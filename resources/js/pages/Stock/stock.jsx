import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { StockTable } from '@/components/stock/table';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';

import { deleteStock, fetchStocks, updateStock } from './api';

export default function Stock() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [stockToDelete, setStockToDelete] = useState(null);
    const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
    const [adjustMode, setAdjustMode] = useState('add');
    const [adjustStockTarget, setAdjustStockTarget] = useState(null);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [scanCount, setScanCount] = useState(0);
    const [isAdjusting, setIsAdjusting] = useState(false);

    useEffect(() => {
        setPageTitle('Stocks');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadStocks() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchStocks();
                if (!ignore) {
                    setStocks(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load stocks.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadStocks();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!stockToDelete) {
            return;
        }

        const id = stockToDelete.id;

        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteStock(id);
            setStocks((previous) => (Array.isArray(previous) ? previous : []).filter((stock) => stock.id !== id));
            toast.success('Stock deleted successfully.', {
                style: { color: '#16a34a' },
            });
            setStockToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete stock.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setDeletingId(null);
        }
    };

    const openAdjustDialog = (mode, stock) => {
        setAdjustMode(mode);
        setAdjustStockTarget(stock);
        setBarcodeInput('');
        setScanCount(0);
        setErrorMessage('');
        setIsAdjustDialogOpen(true);
    };

    const handleBarcodeScan = () => {
        if (!barcodeInput.trim()) return;
        setScanCount((previous) => previous + 1);
        setBarcodeInput('');
    };

    const handleConfirmAdjustStock = async () => {
        const quantity = scanCount;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            setErrorMessage(adjustMode === 'add' ? 'Scan at least one barcode before adding.' : 'Scan at least one barcode before deducting.');
            return;
        }

        const targetStock = stocks.find((stock) => stock.id === adjustStockTarget?.id);
        if (!targetStock) {
            setErrorMessage('Product not found. Please try again.');
            return;
        }

        const current = Number(targetStock.available_stock ?? 0);
        const nextValue = adjustMode === 'add' ? current + quantity : current - quantity;

        if (nextValue < 0) {
            setErrorMessage('Deducted quantity cannot make stock negative.');
            return;
        }

        setIsAdjusting(true);
        setErrorMessage('');

        try {
            const updated = await updateStock(targetStock.id, {
                name: targetStock.name,
                available_stock: nextValue,
            });

            setStocks((previous) =>
                previous.map((stock) => (stock.id === updated.id ? updated : stock))
            );

            toast.success(adjustMode === 'add' ? 'Stock added successfully.' : 'Stock deducted successfully.', {
                style: { color: '#16a34a' },
            });
            setIsAdjustDialogOpen(false);
            setAdjustStockTarget(null);
            setScanCount(0);
            setBarcodeInput('');
        } catch (error) {
            const message = error.message || 'Failed to update stock.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsAdjusting(false);
        }
    };

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <StockTable
                    stocks={stocks}
                    onAddStock={(stock) => openAdjustDialog('add', stock)}
                    onDeductStock={(stock) => openAdjustDialog('deduct', stock)}
                    onEdit={(id) => navigate(`/stocks/${id}/edit`)}
                    onRequestDelete={setStockToDelete}
                    deletingId={deletingId}
                    isLoading={isLoading}
                />
            </div>

            <AlertDialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{adjustMode === 'add' ? 'Add Stock' : 'Deduct Stock'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {adjustMode === 'add'
                                ? `Increase stock for ${adjustStockTarget?.name || ''}.`
                                : `Deduct stock for ${adjustStockTarget?.name || ''}.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Product</Label>
                            <p className="rounded-md border bg-muted px-3 py-2 text-sm">
                                {adjustStockTarget?.name || 'N/A'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="barcode_input">Scan Barcode</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="barcode_input"
                                    value={barcodeInput}
                                    onChange={(event) => setBarcodeInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            handleBarcodeScan();
                                        }
                                    }}
                                    placeholder="Scan or type barcode"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleBarcodeScan}
                                    className="shrink-0 rounded-md border bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Add
                                </button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Scanned: <span className="font-semibold text-foreground">{scanCount}</span>
                            </p>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isAdjusting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAdjustStock}
                            disabled={isAdjusting || !adjustStockTarget || scanCount === 0}
                        >
                            {isAdjusting ? 'Saving...' : adjustMode === 'add' ? 'Add Stock' : 'Deduct Stock'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={Boolean(stockToDelete)} onOpenChange={(open) => !open && setStockToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Stock</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {stockToDelete?.name}? This action cannot be undone.
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