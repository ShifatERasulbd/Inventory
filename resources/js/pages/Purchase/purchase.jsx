import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import PurchaseInvoiceModal from '@/components/purchase/invoiceModal';
import { PurchaseTable } from '@/components/purchase/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

import {
    deletePurchase,
    createRecurringPayment,
    fetchPurchases,
    updatePurchaseStatus,
    uploadPurchasePackingList,
} from './api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

async function fetchCurrentUser() {
    const response = await fetch('/api/user', {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        return null;
    }

    return response.json();
}

export default function Purchase() {
    const navigate = useNavigate();
    const { setPageTitle, user, setUser } = useAppContext();

    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [purchaseToDelete, setPurchaseToDelete] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [invoicePurchase, setInvoicePurchase] = useState(null);
    const [statusDrafts, setStatusDrafts] = useState({});
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [paymentPurchase, setPaymentPurchase] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [viewingPdf, setViewingPdf] = useState(null);


    useEffect(() => {
        setPageTitle('Purchases');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadPurchases() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchPurchases();
                if (!ignore) {
                    setPurchases(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load purchases.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadPurchases();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadUser() {
            if (user) {
                return;
            }

            try {
                const currentUser = await fetchCurrentUser();
                if (!ignore && currentUser) {
                    setUser(currentUser);
                }
            } catch {
                // Keep table usable even if user info cannot be fetched.
            }
        }

        loadUser();

        return () => {
            ignore = true;
        };
    }, [setUser, user]);

    const handleConfirmDelete = async () => {
        if (!purchaseToDelete) {
            return;
        }

        setDeletingId(purchaseToDelete.id);
        setErrorMessage('');

        try {
            await deletePurchase(purchaseToDelete.id);
            setPurchases((previous) => previous.filter((item) => item.id !== purchaseToDelete.id));
            setPurchaseToDelete(null);
            toast.success('Purchase deleted successfully.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            const message = error.message || 'Failed to delete purchase.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setDeletingId(null);
        }
    };

    const handleStatusDraftChange = (id, value) => {
        setStatusDrafts((previous) => ({
            ...previous,
            [id]: value,
        }));
    };

    const startQuickBooksConnect = async () => {
        try {
            const response = await fetch('/api/quickbooks/connect', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`QuickBooks connect failed with status ${response.status}`);
            }

            const payload = await response.json();
            if (payload?.url) {
                window.location.href = payload.url;
                return;
            }

            throw new Error('Missing QuickBooks authorization URL.');
        } catch (error) {
            toast.error(error.message || 'Unable to open QuickBooks connect flow.', {
                style: { color: '#dc2626' },
            });
        }
    };

    const handleUpdateStatus = async (id, currentStatus) => {
        const nextStatus = statusDrafts[id] ?? currentStatus;
        const isPendingToApproved =
            String(currentStatus).toLowerCase() === 'pending' &&
            String(nextStatus).toLowerCase() === 'approved';
        const isShippedToReceived =
            String(currentStatus).toLowerCase() === 'shipped' &&
            String(nextStatus).toLowerCase() === 'received';

        // Supporting Document (PDF) is mandatory before moving approved -> shipped
        const isApprovedToShipped =
            String(currentStatus).toLowerCase() === 'approved' &&
            String(nextStatus).toLowerCase() === 'shipped';

        if (isApprovedToShipped) {
            const purchase = purchases?.find?.((p) => p.id === id);
            if (!purchase?.packing_list_path) {
                toast.error('Upload Packing list before Shipment.', {
                    style: { color: '#dc2626' },
                });
                return;
            }
        }
        if (String(nextStatus).toLowerCase() === String(currentStatus).toLowerCase()) {
            toast.info('Please select a different status before updating.');
            return;
        }


        try {
            setUpdatingStatusId(id);
            const updated = await updatePurchaseStatus(id, { status: nextStatus });

            setPurchases((previous) => previous.map((item) => (item.id === id ? updated : item)));
            setStatusDrafts((previous) => {
                const next = { ...previous };
                delete next[id];
                return next;
            });

            toast.success('Purchase status updated successfully.', {
                style: { color: '#16a34a' },
            });

            if (isShippedToReceived) {
                navigate(`/received-cartoons?purchase_id=${id}`);
                return;
            }

            if (isPendingToApproved) {
                if (updated?.quickbooks_sync_status === 'success') {
                    toast.success('Purchase approved and sent to QuickBooks as Accounts Payable successfully.', {
                        style: { color: '#16a34a' },
                    });
                } else if (updated?.quickbooks_sync_status === 'pending_connection') {
                    const qbError = updated?.quickbooks_last_error || 'QuickBooks is not connected.';
                    toast.info(`Purchase approved. QuickBooks sync is waiting for connection: ${qbError}`, {
                        style: { color: '#0f766e' },
                    });

                    toast.info('Redirecting to QuickBooks to connect your account...', {
                        style: { color: '#0f766e' },
                    });
                    await startQuickBooksConnect();
                    return;
                } else if (updated?.quickbooks_sync_status === 'failed') {
                    const qbError = updated?.quickbooks_last_error || 'QuickBooks sync failed.';
                    toast.error(`Purchase approved, but QuickBooks sync failed: ${qbError}`, {
                        style: { color: '#dc2626' },
                    });

                    if (String(qbError).toLowerCase().includes('quickbooks is not connected')) {
                        toast.info('Redirecting to QuickBooks to connect your account...', {
                            style: { color: '#0f766e' },
                        });
                        await startQuickBooksConnect();
                        return;
                    }
                }

                navigate(`/cartoons/add?purchase_id=${id}`);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update purchase status.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const userWarehouseIds = Array.isArray(user?.warehouse_ids)
        ? user.warehouse_ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
        : [];

    const isSuperAdmin = Array.isArray(user?.role_slugs) && user.role_slugs.includes('super-admin');

    const handleOpenPayRemaining = (purchase) => {
        setPaymentPurchase(purchase);
        setPaymentAmount(String(Number(purchase?.due_amount ?? 0).toFixed(2)));
    };

    const handleSubmitRemainingPayment = async () => {
        if (!paymentPurchase) {
            return;
        }

        const dueAmount = Number(paymentPurchase.due_amount ?? 0);
        const amount = Number(paymentAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error('Please enter a valid payment amount greater than 0.', {
                style: { color: '#dc2626' },
            });
            return;
        }

        if (amount > dueAmount) {
            toast.error('Payment amount cannot be greater than due amount.', {
                style: { color: '#dc2626' },
            });
            return;
        }

        try {
            setIsSubmittingPayment(true);

            await createRecurringPayment({
                purchase_id: paymentPurchase.id,
                amount,
                frequency: 'manual',
            });

            const updatedPurchases = await fetchPurchases();
            setPurchases(Array.isArray(updatedPurchases) ? updatedPurchases : []);
            setPaymentPurchase(null);
            setPaymentAmount('');

            toast.success('Payment added successfully.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            const message = error?.payload?.errors?.amount?.[0] || error.message || 'Failed to add payment.';
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <PurchaseTable
                purchases={purchases}
                onViewPdf={setViewingPdf}

                isLoading={isLoading}
                onAddNew={() => navigate('/purchases/add')}
                onInvoice={setInvoicePurchase}
                onEdit={(id) => navigate(`/purchases/${id}/edit`)}
                onRequestDelete={setPurchaseToDelete}
                deletingId={deletingId}
                statusDrafts={statusDrafts}
                updatingStatusId={updatingStatusId}
                
                onStatusDraftChange={handleStatusDraftChange}
                onUpdateStatus={handleUpdateStatus}
                onPayRemaining={handleOpenPayRemaining}
                onUploadPackingList={async ({ purchaseId, file }) => {
                    try {
                        await uploadPurchasePackingList(purchaseId, file);
                        const updatedPurchases = await fetchPurchases();
                        setPurchases(Array.isArray(updatedPurchases) ? updatedPurchases : []);
                        toast.success('Packing list uploaded successfully.', {
                            style: { color: '#16a34a' },
                        });
                    } catch (error) {
                        toast.error(error.message || 'Failed to upload packing list.', {
                            style: { color: '#dc2626' },
                        });
                    }
                }}
                userWarehouseIds={userWarehouseIds}
                isSuperAdmin={isSuperAdmin}
            />

            <PurchaseInvoiceModal
                purchase={invoicePurchase}
                open={Boolean(invoicePurchase)}
                onClose={() => setInvoicePurchase(null)}
            />

            <AlertDialog open={Boolean(purchaseToDelete)} onOpenChange={(open) => !open && setPurchaseToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Purchase</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete purchase {purchaseToDelete?.po_number}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deletingId !== null}
                            onClick={handleConfirmDelete}
                        >
                            {deletingId !== null ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={Boolean(paymentPurchase)}
                onOpenChange={(open) => {
                    if (!open) {
                        setPaymentPurchase(null);
                        setPaymentAmount('');
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Pay Remaining Amount</AlertDialogTitle>
                        <AlertDialogDescription>
                            Add payment for purchase {paymentPurchase?.po_number}. You can pay the full due amount or part of it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-3">
                        <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
                            <p>Total: {Number(paymentPurchase?.total_amount ?? 0).toFixed(2)}</p>
                            <p>Paid: {Number(paymentPurchase?.paid_amount ?? 0).toFixed(2)}</p>
                            <p className="font-semibold text-foreground">Due: {Number(paymentPurchase?.due_amount ?? 0).toFixed(2)}</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="remaining_payment_amount">Payment Amount</Label>
                            <Input
                                id="remaining_payment_amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={paymentAmount}
                                onChange={(event) => setPaymentAmount(event.target.value)}
                                placeholder="Enter amount"
                            />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmittingPayment}>Cancel</AlertDialogCancel>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmittingPayment}
                            onClick={() => setPaymentAmount(String(Number(paymentPurchase?.due_amount ?? 0).toFixed(2)))}
                        >
                            Use Full Due
                        </Button>
                        <Button
                            type="button"
                            disabled={isSubmittingPayment}
                            onClick={handleSubmitRemainingPayment}
                        >
                            {isSubmittingPayment ? 'Saving...' : 'Save Payment'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

           {viewingPdf && (
    <div className="fixed inset-0 z-50 flex flex-col bg-background p-4">
        <div className="mb-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Packing List Viewer</h2>
            <Button type="button" variant="outline" onClick={() => setViewingPdf(null)}>
                Close
            </Button>
        </div>

        {/* This takes up all remaining space */}
        <div className="flex-1 w-full overflow-hidden border rounded-md">
            <iframe
                src={viewingPdf}
                className="w-full h-full"
                title="Packing List PDF Viewer"
            />
        </div>
    </div>
)}
        </div>
        );
}
