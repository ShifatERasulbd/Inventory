import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';

import { fetchReceivedCartoons, receiveCartoonByScan } from './api';

function formatProducts(products) {
    if (!Array.isArray(products) || products.length === 0) {
        return 'N/A';
    }

    return products
        .map((item) => [item?.product_name, item?.color, item?.size].filter(Boolean).join(' - '))
        .filter(Boolean)
        .join(', ');
}

export default function ReceivedCartoons() {
    const { setPageTitle } = useAppContext();
    const [searchParams] = useSearchParams();
    const purchaseId = searchParams.get('purchase_id') || '';

    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [scanValue, setScanValue] = useState('');

    useEffect(() => {
        setPageTitle('Received Cartoons');
    }, [setPageTitle]);

    const loadRows = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await fetchReceivedCartoons(purchaseId);
            setRows(Array.isArray(data) ? data : []);
        } catch (error) {
            setErrorMessage(error.message || 'Failed to load received cartoons.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRows();
    }, [purchaseId]);

    const pendingCount = useMemo(() => rows.length, [rows]);

    const handleScanSubmit = async (event) => {
        event.preventDefault();
        const value = scanValue.trim();

        if (!value) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            await receiveCartoonByScan(value);
            setScanValue('');
            toast.success('Cartoon received and stock updated.', {
                style: { color: '#16a34a' },
            });
            await loadRows();
        } catch (error) {
            const message = error.message || 'Failed to receive cartoon.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Receive Cartoons To Stock</CardTitle>
                    <CardDescription>
                        Scan cartoon barcode to transfer scanned product barcodes into destination warehouse stock.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="space-y-2" onSubmit={handleScanSubmit}>
                        <Label htmlFor="scan-cartoon">Scan Cartoon Barcode</Label>
                        <div className="flex gap-2">
                            <Input
                                id="scan-cartoon"
                                value={scanValue}
                                onChange={(event) => setScanValue(event.target.value)}
                                placeholder="Scan cartoon number"
                                autoFocus
                            />
                            <Button type="submit" disabled={isSubmitting || !scanValue.trim()}>
                                {isSubmitting ? 'Receiving...' : 'Receive'}
                            </Button>
                        </div>
                    </form>
                    <p className="text-xs text-muted-foreground">
                        Pending cartoons: <span className="font-semibold text-foreground">{pendingCount}</span>
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Received Cartoons</CardTitle>
                    <CardDescription>
                        {purchaseId ? `Filtered by purchase ID: ${purchaseId}` : 'All received-status cartoons pending stock transfer'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cartoon</TableHead>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Products</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Loading received cartoons...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No pending cartoons found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && rows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.cartoon_number}</TableCell>
                                    <TableCell>{row.purchase?.po_number || row.p_o_number || 'N/A'}</TableCell>
                                    <TableCell>{row.warehouse?.name || 'N/A'}</TableCell>
                                    <TableCell>{row.quantity ?? 0}</TableCell>
                                    <TableCell>{formatProducts(row.purchase?.products)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
