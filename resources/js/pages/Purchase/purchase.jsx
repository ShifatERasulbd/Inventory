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
    fetchPurchases,
    updatePurchaseStatus,
} from './api';

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

    const handleUpdateStatus = async (id, currentStatus) => {
        const nextStatus = statusDrafts[id] ?? currentStatus;

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

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <PurchaseTable
                purchases={purchases}
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

        </div>
    );
}
