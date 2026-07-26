import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, FileText, Package } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';
import { formatDate } from '@/lib/utils';

import { fetchPurchase } from './api';

const statusVariantMap = {
    pending: 'secondary',
    approved: 'default',
    shipped: 'outline',
    received: 'success',
    cancelled: 'destructive',
    rejected: 'destructive',
};

function getStatusVariant(status) {
    const key = String(status || '').toLowerCase();
    return statusVariantMap[key] || 'secondary';
}

export default function PurchaseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [purchase, setPurchase] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedProductGroups, setExpandedProductGroups] = useState({});
    const [expandedColorGroups, setExpandedColorGroups] = useState({});

    useEffect(() => {
        setPageTitle('Purchase Order Details');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadPurchase() {
            setIsLoading(true);
            setError('');

            try {
                const data = await fetchPurchase(id);
                if (!ignore) {
                    setPurchase(data);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message || 'Failed to load purchase details.');
                    toast.error('Failed to load purchase details.', {
                        style: { color: '#dc2626' },
                    });
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadPurchase();

        return () => {
            ignore = true;
        };
    }, [id]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => navigate('/purchases')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Purchases
                </Button>
                <p className="text-sm text-muted-foreground">Loading purchase details...</p>
            </div>
        );
    }

    if (error || !purchase) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => navigate('/purchases')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Purchases
                </Button>
                <p className="text-sm text-destructive">{error || 'Purchase not found.'}</p>
            </div>
        );
    }

    const products = Array.isArray(purchase.products) ? purchase.products : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/purchases')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Purchases
                </Button>
            </div>

            {/* Purchase Info Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">
                            Purchase Order: {purchase.po_number || 'N/A'}
                        </CardTitle>
                        <Badge variant={getStatusVariant(purchase.status)} className="text-sm capitalize">
                            {purchase.status || 'pending'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">PO Date</p>
                            <p className="font-medium">{formatDate(purchase.po_date)}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Brand</p>
                            <p className="font-medium">{purchase.brand_name || 'N/A'}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Purchase From</p>
                            <p className="font-medium">{purchase.purchase_form_name || `Warehouse #${purchase.purchase_form}`}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Purchase To</p>
                            <p className="font-medium">{purchase.purchase_to_name || `Warehouse #${purchase.purchase_to}`}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Expected Delivery Date</p>
                            <p className="font-medium">{formatDate(purchase.expected_delivery_date)}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Shipping Date</p>
                            <p className="font-medium">{formatDate(purchase.shipping_date) || 'N/A'}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Received Date</p>
                            <p className="font-medium">{formatDate(purchase.received_date) || 'N/A'}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Payment Method</p>
                            <p className="font-medium capitalize">{purchase.payment_method || 'N/A'}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Payment Status</p>
                            <Badge variant={purchase.payment_status === 'paid' ? 'default' : purchase.payment_status === 'partial' ? 'secondary' : 'outline'} className="capitalize">
                                {purchase.payment_status || 'unpaid'}
                            </Badge>
                        </div>
                    </div>

                    {/* Packing List */}
                    {purchase.packing_list_path && (
                        <div className="mt-4 flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/${purchase.packing_list_path}`, '_blank')}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                View Packing List
                            </Button>
                        </div>
                    )}

                    {/* Note */}
                    {purchase.note && (
                        <div className="mt-4 rounded-md bg-muted/30 p-3">
                            <p className="text-sm font-medium text-muted-foreground">Note</p>
                            <p className="mt-1 text-sm">{purchase.note}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Products Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Product Name / Color</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Purchase Price</TableHead>
                                <TableHead className="text-right">Line Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (() => {
                                    // Level 1: Group products by product_name (Mother)
                                    const motherGroups = products.reduce((groups, item) => {
                                        const name = item.product_name || `Product #${item.product_id}`;
                                        const color = item.color || item.color_name || 'N/A';

                                        if (!groups[name]) {
                                            groups[name] = {
                                                name,
                                                colorGroups: {},
                                                totalQuantity: 0,
                                                totalLineTotal: 0,
                                            };
                                        }

                                        // Level 2: Group by color within each product name
                                        if (!groups[name].colorGroups[color]) {
                                            groups[name].colorGroups[color] = {
                                                color,
                                                items: [],
                                                totalQuantity: 0,
                                                totalLineTotal: 0,
                                            };
                                        }

                                        groups[name].colorGroups[color].items.push(item);
                                        groups[name].colorGroups[color].totalQuantity += Number(item.quantity ?? 0);
                                        groups[name].colorGroups[color].totalLineTotal += Number(item.line_total ?? 0);
                                        groups[name].totalQuantity += Number(item.quantity ?? 0);
                                        groups[name].totalLineTotal += Number(item.line_total ?? 0);
                                        return groups;
                                    }, {});

                                    const motherKeys = Object.keys(motherGroups);
                                    const hasMultipleColors = (motherGroup) =>
                                        Object.keys(motherGroup.colorGroups).length > 1;
                                    const hasMultipleSizes = (colorGroup) => colorGroup.items.length > 1;

                                    const handleToggleMotherGroup = (name) => {
                                        setExpandedProductGroups((prev) => ({
                                            ...prev,
                                            [name]: !(prev[name] ?? false),
                                        }));
                                    };

                                    const handleToggleColorGroup = (key) => {
                                        setExpandedColorGroups((prev) => ({
                                            ...prev,
                                            [key]: !(prev[key] ?? false),
                                        }));
                                    };

                                    return motherKeys.map((motherName, motherIndex) => {
                                        const motherGroup = motherGroups[motherName];
                                        const isMotherExpanded = expandedProductGroups[motherName] ?? false;
                                        const motherCollapsible = hasMultipleColors(motherGroup) ||
                                            Object.values(motherGroup.colorGroups).some((cg) => hasMultipleSizes(cg));

                                        return (
                                            <Fragment key={motherName}>
                                                {/* Mother Group Header Row (by product_name) */}
                                                <TableRow
                                                    className="bg-muted/30 cursor-pointer hover:bg-muted/50 font-medium"
                                                    onClick={() => {
                                                        if (motherCollapsible) {
                                                            handleToggleMotherGroup(motherName);
                                                        }
                                                    }}
                                                >
                                                    <TableCell className="text-muted-foreground">
                                                        {motherCollapsible ? (
                                                            <span className="flex items-center gap-1">
                                                                {isMotherExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                                <span>{motherIndex + 1}</span>
                                                            </span>
                                                        ) : (
                                                            motherIndex + 1
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">{motherGroup.name}</TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell className="text-right font-semibold">{motherGroup.totalQuantity}</TableCell>
                                                    <TableCell className="text-right">-</TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {motherGroup.totalLineTotal.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>

                                                {/* Level 2: Color Groups (children) */}
                                                {isMotherExpanded && motherCollapsible && (
                                                    Object.keys(motherGroup.colorGroups).map((colorName) => {
                                                        const colorGroup = motherGroup.colorGroups[colorName];
                                                        const colorKey = `${motherName}||${colorName}`;
                                                        const isColorExpanded = expandedColorGroups[colorKey] ?? false;
                                                        const colorCollapsible = hasMultipleSizes(colorGroup);

                                                        return (
                                                            <Fragment key={colorKey}>
                                                                {/* Color Group Header Row */}
                                                                <TableRow
                                                                    className="bg-muted/10 cursor-pointer hover:bg-muted/30 border-l-4 border-l-primary/30"
                                                                    onClick={() => {
                                                                        if (colorCollapsible) {
                                                                            handleToggleColorGroup(colorKey);
                                                                        }
                                                                    }}
                                                                >
                                                                    <TableCell />
                                                                    <TableCell className="text-sm text-muted-foreground pl-8">
                                                                        {colorCollapsible ? (
                                                                            <span className="flex items-center gap-1">
                                                                                {isColorExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                                                <span className="italic">{colorGroup.color}</span>
                                                                            </span>
                                                                        ) : (
                                                                            <span className="italic">{colorGroup.color}</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>-</TableCell>
                                                                    <TableCell>{colorGroup.color}</TableCell>
                                                                    <TableCell className="text-right font-medium">{colorGroup.totalQuantity}</TableCell>
                                                                    <TableCell className="text-right">-</TableCell>
                                                                    <TableCell className="text-right font-medium">
                                                                        {colorGroup.totalLineTotal.toFixed(2)}
                                                                    </TableCell>
                                                                </TableRow>

                                                                {/* Detail Size Rows */}
                                                                {isColorExpanded && colorCollapsible && colorGroup.items.map((item, itemIndex) => (
                                                                    <TableRow key={`${colorKey}-${itemIndex}`} className="border-l-8 border-l-primary/10">
                                                                        <TableCell />
                                                                        <TableCell />
                                                                        <TableCell>{item.size || item.size_name || 'N/A'}</TableCell>
                                                                        <TableCell>{item.color || item.color_name || 'N/A'}</TableCell>
                                                                        <TableCell className="text-right">{Number(item.quantity ?? 0)}</TableCell>
                                                                        <TableCell className="text-right">{Number(item.purchase_price ?? 0).toFixed(2)}</TableCell>
                                                                        <TableCell className="text-right font-medium">
                                                                            {Number(item.line_total ?? 0).toFixed(2)}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </Fragment>
                                                        );
                                                    })
                                                )}
                                            </Fragment>
                                        );
                                    });
                                })()
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Payment Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <div className="mx-auto max-w-md space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">{Number(purchase.subtotal ?? 0).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total PO Amount</span>
                            <span className="font-semibold">{Number(purchase.total_amount ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Paid Amount</span>
                            <span>{Number(purchase.paid_amount ?? 0).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-base">
                            <span className="font-medium">Due Amount</span>
                            <span className="text-lg font-bold">{Number(purchase.due_amount ?? 0).toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* QuickBooks Info (if synced) */}
            {purchase.quickbooks_sync_status && (
                <Card>
                    <CardHeader>
                        <CardTitle>QuickBooks Sync</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Sync Status</p>
                                <Badge variant={purchase.quickbooks_sync_status === 'success' ? 'default' : purchase.quickbooks_sync_status === 'failed' ? 'destructive' : 'secondary'}>
                                    {purchase.quickbooks_sync_status}
                                </Badge>
                            </div>
                            {purchase.quickbooks_synced_at && (
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Synced At</p>
                                    <p className="font-medium">{purchase.quickbooks_synced_at}</p>
                                </div>
                            )}
                            {purchase.quickbooks_txn_id && (
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                                    <p className="font-medium text-xs">{purchase.quickbooks_txn_id}</p>
                                </div>
                            )}
                            {purchase.quickbooks_last_error && (
                                <div className="space-y-1 md:col-span-3">
                                    <p className="text-sm text-muted-foreground">Last Error</p>
                                    <p className="text-sm text-destructive">{purchase.quickbooks_last_error}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

