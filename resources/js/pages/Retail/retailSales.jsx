import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Printer } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';
import Preloader from '@/components/Preloader';

import { fetchRetailSales, updateRetailSaleStatus } from './api';
import ShippingLabelSection from './ShippingLabelSection';

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
    const [updatingSaleId, setUpdatingSaleId] = useState(null);
    const [labelSale, setLabelSale] = useState(null);

    useEffect(() => {
        setPageTitle('Retail Sell');
    }, [setPageTitle]);

    const handleStatusChange = async (sale, status) => {
        setUpdatingSaleId(sale.id);
        try {
            await updateRetailSaleStatus(sale.id, status);
            setSales((previous) => previous.map((row) => (
                row.id === sale.id ? { ...row, status } : row
            )));
            toast.success(
                status === 'cancelled'
                    ? 'Sale cancelled. Veeqo booking (if any) was also cancelled.'
                    : 'Sale marked as refunded.'
            );
        } catch (error) {
            toast.error(error.message || 'Failed to update sale status.');
        } finally {
            setUpdatingSaleId(null);
        }
    };

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

    if (isLoading) {
        return (
            <div className="relative min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl bg-background">
                <Preloader message="Loading Retail Sales..." fullScreen={false} />
            </div>
        );
    }

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
                                <TableHead>Shipping Level</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Seller</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">Items</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                                        Loading retail sales...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && filteredSales.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-muted-foreground">
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
                                        <TableCell className="font-medium">{sale.order_number || `Sale #${sale.id}`}</TableCell>
                                        <TableCell onClick={(event) => event.stopPropagation()}>
                                            {sale.shipping_level ? (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span title={sale.tracking_url || undefined}>
                                                        {sale.shipping_carrier ? `${sale.shipping_carrier} - ` : ''}{sale.shipping_level}
                                                    </span>
                                                    {(sale.label_url || sale.label_file_url) && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            title="View / print shipping label"
                                                            onClick={() => setLabelSale(sale)}
                                                        >
                                                            <Printer className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{formatDate(sale.created_at)}</TableCell>
                                        <TableCell>{sale.warehouse_name || 'N/A'}</TableCell>
                                        <TableCell>{sale.brand_name || 'Unassigned'}</TableCell>
                                        <TableCell>{sale.seller_name || 'N/A'}</TableCell>
                                        <TableCell className="capitalize">{sale.payment_method || 'N/A'}</TableCell>
                                        <TableCell className="text-right">{itemCount}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatMoney(sale.total_amount)}</TableCell>
                                        <TableCell onClick={(event) => event.stopPropagation()}>
                                            {sale.status ? (
                                                <Badge variant={sale.status === 'cancelled' ? 'destructive' : 'secondary'} className="capitalize">
                                                    {sale.status}
                                                </Badge>
                                            ) : (
                                                <Select
                                                    value=""
                                                    disabled={updatingSaleId === sale.id}
                                                    onValueChange={(status) => handleStatusChange(sale, status)}
                                                >
                                                    <SelectTrigger size="sm" className="w-[130px]">
                                                        <SelectValue placeholder="Update status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="refunded">Refunded</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
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

            <Dialog open={Boolean(labelSale)} onOpenChange={(open) => !open && setLabelSale(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            Shipping Label - {labelSale?.reference_number || labelSale?.order_number || `Sale #${labelSale?.id || ''}`}
                        </DialogTitle>
                    </DialogHeader>
                    <ShippingLabelSection
                        carrier={labelSale?.shipping_carrier}
                        service={labelSale?.shipping_level}
                        trackingUrl={labelSale?.tracking_url}
                        labelUrl={labelSale?.label_url}
                        labelFileUrl={labelSale?.label_file_url}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
