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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';

import {
    assignCartoonRack,
    deletePurchase,
    fetchCartoons,
    fetchPurchases,
    fetchRackRows,
    fetchRacks,
} from './api';

export default function Purchase() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [purchaseToDelete, setPurchaseToDelete] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [invoicePurchase, setInvoicePurchase] = useState(null);
    const [assignPurchase, setAssignPurchase] = useState(null);
    const [cartoons, setCartoons] = useState([]);
    const [racks, setRacks] = useState([]);
    const [rackRows, setRackRows] = useState([]);
    const [selectedCartoonId, setSelectedCartoonId] = useState('');
    const [selectedRackId, setSelectedRackId] = useState('');
    const [selectedRackRowId, setSelectedRackRowId] = useState('');
    const [isAssigningRack, setIsAssigningRack] = useState(false);

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

    const openAssignRackDialog = async (purchase) => {
        const status = String(purchase?.status ?? '').toLowerCase();
        if (status !== 'received') {
            toast.error('Rack can be assigned only after the purchase is received.', {
                style: { color: '#dc2626' },
            });
            return;
        }

        setAssignPurchase(purchase);
        setSelectedCartoonId('');
        setSelectedRackId('');
        setSelectedRackRowId('');
        setRackRows([]);

        try {
            const [cartoonData, rackData] = await Promise.all([fetchCartoons(), fetchRacks()]);
            setCartoons(Array.isArray(cartoonData) ? cartoonData : []);
            setRacks(Array.isArray(rackData) ? rackData : []);
        } catch (error) {
            setCartoons([]);
            setRacks([]);
            toast.error(error.message || 'Failed to load rack assignment data.', {
                style: { color: '#dc2626' },
            });
        }
    };

    const handleRackChange = async (value) => {
        setSelectedRackId(value);
        setSelectedRackRowId('');

        if (!value) {
            setRackRows([]);
            return;
        }

        try {
            const rows = await fetchRackRows(value);
            setRackRows(Array.isArray(rows) ? rows : []);
        } catch (error) {
            setRackRows([]);
            toast.error(error.message || 'Failed to load rack rows.', {
                style: { color: '#dc2626' },
            });
        }
    };

    const handleAssignRack = async () => {
        if (!selectedCartoonId) {
            toast.error('Please select a cartoon first.', { style: { color: '#dc2626' } });
            return;
        }

        if (!selectedRackId) {
            toast.error('Please select a rack first.', { style: { color: '#dc2626' } });
            return;
        }

        setIsAssigningRack(true);
        try {
            await assignCartoonRack(selectedCartoonId, {
                rack_id: Number(selectedRackId),
                ...(selectedRackRowId ? { rack_row_id: Number(selectedRackRowId) } : {}),
            });

            toast.success('Cartoon assigned to rack successfully.', {
                style: { color: '#16a34a' },
            });

            setAssignPurchase(null);
            setSelectedCartoonId('');
            setSelectedRackId('');
            setSelectedRackRowId('');
            setRackRows([]);
        } catch (error) {
            toast.error(error.message || 'Failed to assign rack.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsAssigningRack(false);
        }
    };

    const assignableCartoons = cartoons.filter((cartoon) => (
        Number(cartoon?.p_o_number ?? 0) === Number(assignPurchase?.id ?? 0)
        && Number(cartoon?.warehouse_id ?? 0) === Number(assignPurchase?.purchase_to ?? 0)
    ));

    const destinationRacks = racks.filter((rack) => (
        Number(rack?.warehouse_id ?? 0) === Number(assignPurchase?.purchase_to ?? 0)
    ));

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <PurchaseTable
                purchases={purchases}
                isLoading={isLoading}
                onAddNew={() => navigate('/purchases/add')}
                onInvoice={setInvoicePurchase}
                onEdit={(id) => navigate(`/purchases/${id}/edit`)}
                onAssignRack={openAssignRackDialog}
                onRequestDelete={setPurchaseToDelete}
                deletingId={deletingId}
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
                open={Boolean(assignPurchase)}
                onOpenChange={(open) => {
                    if (!open) {
                        setAssignPurchase(null);
                        setSelectedCartoonId('');
                        setSelectedRackId('');
                        setSelectedRackRowId('');
                        setRackRows([]);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Assign Cartoon To Rack</AlertDialogTitle>
                        <AlertDialogDescription>
                            Assign received purchase cartoons to racks in destination warehouse {assignPurchase?.purchase_to_name || ''}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Cartoon</Label>
                            <Select value={selectedCartoonId} onValueChange={setSelectedCartoonId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a cartoon" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignableCartoons.map((cartoon) => (
                                        <SelectItem key={cartoon.id} value={String(cartoon.id)}>
                                            {cartoon.cartoon_number} (Qty: {Number(cartoon.quantity ?? 0)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {assignableCartoons.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    No cartoons found for this received purchase in destination warehouse.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Rack</Label>
                            <Select value={selectedRackId} onValueChange={handleRackChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a rack" />
                                </SelectTrigger>
                                <SelectContent>
                                    {destinationRacks.map((rack) => (
                                        <SelectItem key={rack.id} value={String(rack.id)}>
                                            {rack.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {destinationRacks.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    No racks are available in the destination warehouse.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Rack Row (Optional)</Label>
                            <Select value={selectedRackRowId} onValueChange={setSelectedRackRowId} disabled={!selectedRackId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={selectedRackId ? 'Select a rack row' : 'Select a rack first'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {rackRows.map((row) => (
                                        <SelectItem key={row.id} value={String(row.id)}>
                                            Row {row.row_number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isAssigningRack}>Cancel</AlertDialogCancel>
                        <Button type="button" onClick={handleAssignRack} disabled={isAssigningRack}>
                            {isAssigningRack ? 'Assigning...' : 'Assign Rack'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
