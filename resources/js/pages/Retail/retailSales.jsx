import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';

import { fetchRetailSales } from './api';

function formatMoney(value) {
    const numberValue = Number(value ?? 0);
    return `$${(Number.isFinite(numberValue) ? numberValue : 0).toFixed(2)}`;
}

function formatDate(value) {
    if (!value) {
        return 'N/A';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month},${year}`;
}

export default function RetailSales() {
    const { setPageTitle } = useAppContext();

    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);

    useEffect(() => {
        setPageTitle('Retail Sell');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadSales() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const rows = await fetchRetailSales();
                if (!ignore) {
                    setSales(Array.isArray(rows) ? rows : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load retail sales.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadSales();

        return () => {
            ignore = true;
        };
    }, []);

    const filteredSales = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return sales;
        }

        return sales.filter((sale) => {
            const reference = String(sale.reference_number || '').toLowerCase();
            const warehouse = String(sale.warehouse_name || '').toLowerCase();
            const brand = String(sale.brand_name || '').toLowerCase();
            const seller = String(sale.seller_name || '').toLowerCase();
            const paymentMethod = String(sale.payment_method || '').toLowerCase();

            return reference.includes(query)
                || warehouse.includes(query)
                || brand.includes(query)
                || seller.includes(query)
                || paymentMethod.includes(query);
        });
    }, [sales, search]);

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="max-w-md">
                <Input
                    placeholder="Search reference, warehouse, seller..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Retail POS Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ref</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Seller</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">Items</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                                        Loading retail sales...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && filteredSales.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                                        No retail sales found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && filteredSales.map((sale) => {
                                const itemCount = Array.isArray(sale.items)
                                    ? sale.items.reduce((total, item) => total + Number(item?.quantity ?? 0), 0)
                                    : 0;

                                return (
                                    <TableRow
                                        key={sale.id}
                                        className="cursor-pointer"
                                        onClick={() => setSelectedSale(sale)}
                                    >
                                        <TableCell className="font-medium">{sale.reference_number || `Sale #${sale.id}`}</TableCell>
                                        <TableCell>{formatDate(sale.created_at)}</TableCell>
                                        <TableCell>{sale.warehouse_name || 'N/A'}</TableCell>
                                        <TableCell>{sale.brand_name || 'Unassigned'}</TableCell>
                                        <TableCell>{sale.seller_name || 'N/A'}</TableCell>
                                        <TableCell className="capitalize">{sale.payment_method || 'N/A'}</TableCell>
                                        <TableCell className="text-right">{itemCount}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatMoney(sale.total_amount)}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={Boolean(selectedSale)} onOpenChange={(open) => !open && setSelectedSale(null)}>
                <AlertDialogContent className="max-w-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {selectedSale?.reference_number || `Sale #${selectedSale?.id || ''}`} Details
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Date: {formatDate(selectedSale?.created_at)} | Brand: {selectedSale?.brand_name || 'Unassigned'} | Payment: {selectedSale?.payment_method || 'N/A'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Sell Qty</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.isArray(selectedSale?.items) && selectedSale.items.length > 0 ? (
                                    selectedSale.items.map((item, index) => {
                                        const quantity = Number(item?.quantity ?? 0);
                                        const unitPrice = Number(item?.unit_price ?? 0);
                                        const lineTotal = Number(item?.total ?? (unitPrice * quantity));

                                        return (
                                            <TableRow key={`${selectedSale?.id || 'sale'}-${index}`}>
                                                <TableCell>{item?.product_name || `Product #${item?.product_id || index + 1}`}</TableCell>
                                                <TableCell className="text-right">{formatMoney(unitPrice)}</TableCell>
                                                <TableCell className="text-right">{quantity}</TableCell>
                                                <TableCell className="text-right font-medium">{formatMoney(lineTotal)}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No sale items found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
