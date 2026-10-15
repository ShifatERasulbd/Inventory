import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ReturnRequestTable } from '@/components/return-requests/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import Preloader from '@/components/Preloader';

import {
    fetchCartonsForProduct,
    fetchReturnRequest,
    fetchReturnRequests,
    fetchReturnShippingLabelBlob,
    restockReturnItem,
    syncReturnRequests,
    updateReturnRequestStatus,
} from './api';

function RestockItem({ item, returnRequestId, restockedItems, canRestock, onRestocked }) {
    const itemName = String(item.name || '').trim();
    const itemColor = String(item.selectedColor || '').trim();
    const itemSize = String(item.selectedSize || '').trim();

    const alreadyRestocked = restockedItems.find(
        (entry) =>
            String(entry.name || '').trim().toLowerCase() === itemName.toLowerCase()
            && String(entry.color || '').trim().toLowerCase() === itemColor.toLowerCase()
            && String(entry.size || '').trim().toLowerCase() === itemSize.toLowerCase()
    );

    const [cartons, setCartons] = useState([]);
    const [isLoadingCartons, setIsLoadingCartons] = useState(false);
    const [selectedCartoonId, setSelectedCartoonId] = useState('');
    const [quantity, setQuantity] = useState(item.quantity || 1);
    const [isRestocking, setIsRestocking] = useState(false);

    useEffect(() => {
        if (!itemName || alreadyRestocked || !canRestock) return;

        let ignore = false;
        setIsLoadingCartons(true);

        fetchCartonsForProduct(returnRequestId, { name: itemName, color: itemColor, size: itemSize })
            .then(({ cartons: fetchedCartons }) => {
                if (!ignore) setCartons(fetchedCartons);
            })
            .catch((error) => {
                if (!ignore) toast.error(error.message || 'Failed to load cartons for this product.', { style: { color: '#dc2626' } });
            })
            .finally(() => {
                if (!ignore) setIsLoadingCartons(false);
            });

        return () => {
            ignore = true;
        };
    }, [itemName, itemColor, itemSize, returnRequestId, alreadyRestocked, canRestock]);

    const handleRestock = async () => {
        if (!selectedCartoonId) {
            toast.error('Select a carton first.', { style: { color: '#dc2626' } });
            return;
        }

        setIsRestocking(true);

        try {
            const result = await restockReturnItem(returnRequestId, {
                name: itemName,
                color: itemColor,
                size: itemSize,
                cartoonId: Number(selectedCartoonId),
                quantity: Number(quantity) || 1,
            });
            toast.success('Item restocked into carton successfully.', { style: { color: '#16a34a' } });
            onRestocked(result.return_request);
        } catch (error) {
            toast.error(error.message || 'Failed to restock item.', { style: { color: '#dc2626' } });
        } finally {
            setIsRestocking(false);
        }
    };

    return (
        <div className="rounded-md border p-3 space-y-2">
            <div className="text-sm">
                <span className="font-medium">{item.quantity}x {item.name}</span>
                {(item.selectedColor || item.selectedSize) && (
                    <span className="text-xs text-muted-foreground ml-2">
                        {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                    </span>
                )}
            </div>

            {!canRestock ? null : alreadyRestocked ? (
                <Badge variant="success">
                    Restocked {alreadyRestocked.quantity} into carton #{alreadyRestocked.cartoon_id}
                </Badge>
            ) : (
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={selectedCartoonId} onValueChange={setSelectedCartoonId} disabled={isLoadingCartons || isRestocking}>
                        <SelectTrigger className="w-56">
                            <SelectValue placeholder={isLoadingCartons ? 'Loading cartons...' : 'Select a carton'} />
                        </SelectTrigger>
                        <SelectContent>
                            {cartons.length === 0 && (
                                <div className="px-2 py-1.5 text-xs text-muted-foreground">No cartons found for this product.</div>
                            )}
                            {cartons.map((cartoon) => (
                                <SelectItem key={cartoon.id} value={String(cartoon.id)}>
                                    #{cartoon.cartoon_number || cartoon.id} &middot; {cartoon.warehouse_name || 'Unknown warehouse'} &middot; stock {cartoon.current_stock}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-20"
                        disabled={isRestocking}
                    />

                    <Button size="sm" onClick={handleRestock} disabled={isRestocking || !selectedCartoonId}>
                        {isRestocking ? 'Restocking...' : 'Restock'}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function ReturnRequests() {
    const { setPageTitle, can } = useAppContext();
    const canSync = can('update', '1971co-return-requests');
    const canUpdate = can('update', '1971co-return-requests');
    const canRestock = can('create', '1971co-return-requests');

    const [returnRequests, setReturnRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isLoadingLabel, setIsLoadingLabel] = useState(false);

    // Confirmation Modal State
    const [pendingStatus, setPendingStatus] = useState(null);

    useEffect(() => {
        setPageTitle('1971co Return Requests');
    }, [setPageTitle]);

    const loadReturnRequests = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await fetchReturnRequests();
            setReturnRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            setErrorMessage(error.message || 'Failed to load return requests.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReturnRequests();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        setErrorMessage('');

        try {
            const result = await syncReturnRequests();
            toast.success(`Synced ${result?.synced_count ?? 0} return request(s) from 1971co.`, {
                style: { color: '#16a34a' },
            });
            await loadReturnRequests();
        } catch (error) {
            const message = error.message || 'Failed to sync return requests.';
            setErrorMessage(message);
            toast.error(message, { style: { color: '#dc2626' } });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleView = async (id) => {
        try {
            const data = await fetchReturnRequest(id);
            setSelectedRequest(data);
        } catch (error) {
            toast.error(error.message || 'Failed to load return request details.', {
                style: { color: '#dc2626' },
            });
        }
    };

    // Triggered when user selects a status from the dropdown
    const handleStatusSelect = (status) => {
        if (!selectedRequest || status === selectedRequest.status) return;
        setPendingStatus(status);
    };

    // Executed after confirming in the modal
    const confirmStatusChange = async () => {
        if (!pendingStatus || !selectedRequest) return;

        setIsUpdatingStatus(true);
        const statusToApply = pendingStatus;
        setPendingStatus(null);

        try {
            const updated = await updateReturnRequestStatus(selectedRequest.id, statusToApply);
            setSelectedRequest(updated);
            setReturnRequests((previous) =>
                previous.map((item) => (item.id === updated.id ? updated : item))
            );
            toast.success('Return request status updated.', { style: { color: '#16a34a' } });

            if (updated?.return_label_available === false) {
                toast.warning(
                    'Return approved, but Veeqo has no return label for this shipment. The label must be generated manually.',
                    { duration: 8000 }
                );
            }

            const emailNotification = updated?.email_notification;
            if (emailNotification) {
                if (emailNotification.sent) {
                    console.log(`Return approved email sent to ${emailNotification.email}.`);
                    toast.success(`Approval email sent to ${emailNotification.email}.`, {
                        style: { color: '#16a34a' },
                    });
                } else {
                    console.error(`Return approved email failed: ${emailNotification.error}`);
                    toast.error(`Approval email failed to send: ${emailNotification.error}`, {
                        style: { color: '#dc2626' },
                    });
                }
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update status.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleViewShippingLabel = async () => {
        if (!selectedRequest) return;

        setIsLoadingLabel(true);

        try {
            const blob = await fetchReturnShippingLabelBlob(selectedRequest.id);
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            toast.error(error.message || 'Failed to load return shipping label.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsLoadingLabel(false);
        }
    };

    const handleGenerateReturnLabel = async () => {
        if (!selectedRequest || isUpdatingStatus) return;

        setIsUpdatingStatus(true);

        try {
            const updated = await updateReturnRequestStatus(selectedRequest.id, 'approved_return');
            setSelectedRequest(updated);
            setReturnRequests((previous) =>
                previous.map((item) => (item.id === updated.id ? updated : item))
            );
            toast.success('Veeqo return shipping label generated.', { style: { color: '#16a34a' } });

            const emailNotification = updated?.email_notification;
            if (emailNotification) {
                if (emailNotification.sent) {
                    toast.success(`Approval email sent to ${emailNotification.email}.`, {
                        style: { color: '#16a34a' },
                    });
                } else {
                    toast.error(`Approval email failed to send: ${emailNotification.error}`, {
                        style: { color: '#dc2626' },
                    });
                }
            }
        } catch (error) {
            toast.error(error.message || 'Failed to generate the Veeqo return label.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    if (isLoading) {
        return (
            <div className="relative min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl bg-background">
                <Preloader message="Loading Return Requests..." fullScreen={false} />
            </div>
        );
    }

    const rawPayload = selectedRequest?.raw_payload || {};
    const order = rawPayload?.order || null;
    const orderItems = Array.isArray(order?.items) ? order.items : [];
    const restockedItems = Array.isArray(selectedRequest?.restocked_items) ? selectedRequest.restocked_items : [];
    const itemSizeReplacements = selectedRequest?.item_size_replacements || rawPayload?.item_size_replacements;
    const uploadedDocument = rawPayload?.uploaded_document;

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <ReturnRequestTable
                    returnRequests={returnRequests}
                    onView={handleView}
                    onSync={handleSync}
                    isLoading={isLoading}
                    isSyncing={isSyncing}
                    canSync={canSync}
                />
            </div>

            <Dialog open={Boolean(selectedRequest)} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            Return Request - {selectedRequest?.order_number || `#${selectedRequest?.id || ''}`}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Status</span>
                                {canUpdate ? (
                                    <Select value={selectedRequest.status || 'pending'} onValueChange={handleStatusSelect} disabled={isUpdatingStatus}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved_return">Approved Return</SelectItem>
                                            <SelectItem value="product_received">Product Received</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="refund_initiated">Refund Initiated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge className="capitalize">{selectedRequest.status || 'pending'}</Badge>
                                )}
                            </div>

                            {['approved_return', 'product_received', 'refund_initiated'].includes(selectedRequest.status) && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Return Shipping Label</span>
                                    <div className="flex items-center gap-2">
                                        {!selectedRequest.return_label_file_path
                                            && selectedRequest.status === 'approved_return'
                                            && canUpdate && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleGenerateReturnLabel}
                                                    disabled={isUpdatingStatus}
                                                >
                                                    {isUpdatingStatus ? 'Generating...' : 'Generate label'}
                                                </Button>
                                            )}
                                        {selectedRequest.return_label_file_path ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleViewShippingLabel}
                                                disabled={isLoadingLabel}
                                            >
                                                {isLoadingLabel ? 'Loading...' : 'View / Download'}
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                {selectedRequest.status === 'approved_return'
                                                    ? 'Label not generated'
                                                    : 'No label available'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <span className="font-medium text-foreground">Reason: </span>
                                {selectedRequest.request_reason || 'N/A'}
                            </div>

                            {selectedRequest.additional_text && (
                                <div>
                                    <span className="font-medium text-foreground">Comments: </span>
                                    {selectedRequest.additional_text}
                                </div>
                            )}

                            <div>
                                <span className="font-medium text-foreground">Wants Size Replacement: </span>
                                {selectedRequest.wants_size_replacement || 'no'}
                            </div>

                            {itemSizeReplacements && (
                                <div>
                                    <span className="font-medium text-foreground">Requested Size Changes:</span>
                                    <pre className="mt-1 whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                                        {JSON.stringify(itemSizeReplacements, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {uploadedDocument && (
                                <div>
                                    <span className="font-medium text-foreground">Unpacking Video: </span>
                                    <a href={uploadedDocument} target="_blank" rel="noreferrer" className="text-primary underline">
                                        View video
                                    </a>
                                </div>
                            )}

                            {order && (
                                <div className="border-t pt-3 space-y-2">
                                    <div className="font-medium text-foreground">Order Details</div>
                                    <div>{order.first_name} {order.last_name} &mdash; {order.email}</div>
                                    <div>Order Status: {order.status}</div>
                                    <div>Total: ${order.total}</div>

                                    {orderItems.length > 0 && (
                                        <div className="space-y-2 pt-2">
                                            <div className="font-medium text-foreground">Items &amp; Restock</div>
                                            {orderItems.map((item, index) => (
                                                <RestockItem
                                                    key={item.lineId || index}
                                                    item={item}
                                                    returnRequestId={selectedRequest.id}
                                                    restockedItems={restockedItems}
                                                    canRestock={canRestock}
                                                    onRestocked={(updatedReturnRequest) => {
                                                        setSelectedRequest(updatedReturnRequest);
                                                        setReturnRequests((previous) =>
                                                            previous.map((r) => (r.id === updatedReturnRequest.id ? updatedReturnRequest : r))
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirmation Modal */}
           <AlertDialog open={Boolean(pendingStatus)} onOpenChange={(open) => !open && setPendingStatus(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to change the return request status to{' '}
                            <span className="font-semibold capitalize text-foreground">
                                {pendingStatus?.replace('_', ' ')}
                            </span>
                            . This action may trigger automated notifications or workflows.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingStatus(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmStatusChange} 
                            variant="destructive"
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}