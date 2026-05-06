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
import { useAppContext } from '@/context/AppContext';

import { deletePurchase, fetchPurchases } from './api';

export default function Purchase() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [purchaseToDelete, setPurchaseToDelete] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [invoicePurchase, setInvoicePurchase] = useState(null);

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
