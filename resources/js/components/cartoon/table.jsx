import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Barcode, ChevronDown, ChevronRight, Eye, Minus, PackageCheck, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function formatProductLabel(product) {
    const parts = [product?.product_name, product?.color, product?.size].filter(Boolean);
    return parts.join(' / ');
}

function getPurchaseGroupKey(cartoon) {
    return String(cartoon.purchase?.id ?? cartoon.p_o_number ?? cartoon.purchase?.po_number ?? `cartoon-${cartoon.id}`);
}

function getPurchaseGroupLabel(cartoon) {
    return cartoon.purchase?.po_number ?? cartoon.p_o_number ?? 'No Purchase Order';
}

const PO_PAGE_SIZE = 20;

export function CartoonTable({ cartoons = [], onAdd, onAddQuantity, onDeductQuantity, onAssignRack, onViewBarcode, onEdit, onRequestDelete, deletingId, isLoading, onViewPurchaseDetails }) {
    const [search, setSearch] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [poPageState, setPoPageState] = useState({});

    const filtered = cartoons.filter((c) => {
        const q = search.toLowerCase();
        return (
            c.cartoon_number?.toLowerCase().includes(q) ||
            String(c.purchase?.po_number ?? c.p_o_number ?? '').toLowerCase().includes(q) ||
            (Array.isArray(c.purchase?.products) && c.purchase.products.some((product) => formatProductLabel(product).toLowerCase().includes(q)))
        );
    });

    const groupedCartoons = filtered.reduce((groups, cartoon) => {
        const key = getPurchaseGroupKey(cartoon);
        const existingGroup = groups.find((group) => group.key === key);

        if (existingGroup) {
            existingGroup.cartoons.push(cartoon);
            existingGroup.totalQuantity += Number(cartoon.quantity ?? 0);
            return groups;
        }

        groups.push({
            key,
            purchaseOrder: getPurchaseGroupLabel(cartoon),
            purchaseStatus: cartoon.purchase?.status ?? '',
            totalQuantity: Number(cartoon.quantity ?? 0),
            cartoons: [cartoon],
        });

        return groups;
    }, []);

    const toggleGroup = (groupKey) => {
        setExpandedGroups((previous) => ({
            ...previous,
            [groupKey]: !(previous[groupKey] ?? true),
        }));
    };

    return (
        <>
        <div className="flex items-center gap-3 justify-between">
            <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search purchase order or cartoon..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9"
                />
            </div>
            <Button className="shrink-0 gap-2" onClick={onAdd}>
                <Plus />
                Add Cartoon
            </Button>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">SL No.</TableHead>
                        <TableHead className="text-center">Cartoon Count</TableHead>
                        <TableHead className="text-center">Quantity Of Products</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                Loading Cartoon...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && cartoons.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No Cartoon found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && filtered.length === 0 && cartoons.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No Cartoons match your search.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        groupedCartoons.map((group, index) => {
                            const isExpanded = expandedGroups[group.key] ?? true;
                            const purchaseId = group.cartoons[0]?.purchase?.id;

                            return (
                                <Fragment key={group.key}>
                                    <TableRow>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => toggleGroup(group.key)}
                                                    aria-label={isExpanded ? `Collapse ${group.purchaseOrder}` : `Expand ${group.purchaseOrder}`}
                                                >
                                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                </Button>
                                                <span>{index + 1}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{group.cartoons.length}</TableCell>
                                        <TableCell className="text-center">{group.totalQuantity}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {purchaseId && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    aria-label={`View purchase order details for ${group.purchaseOrder}`}
                                                                    onClick={() => onViewPurchaseDetails?.(purchaseId)}
                                                                >
                                                                    <Eye />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="bottom">
                                                                <p>View Purchase Order</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleGroup(group.key)}
                                                >
                                                    {isExpanded ? 'Hide details' : 'Show details'}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {isExpanded && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="bg-muted/20 p-0">
                                                <div className="p-3">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="text-right">SL No.</TableHead>
                                                                <TableHead className="text-center">Cartoon</TableHead>
                                                                <TableHead className="text-center">Product Details</TableHead>
                                                                <TableHead className="text-center">Warehouse</TableHead>
                                                                <TableHead className="text-center">Quantity</TableHead>
                                                                <TableHead className="text-center">Action</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {(() => {
                                                                const currentPoPage = poPageState[group.key] ?? 1;
                                                                const totalPoPages = Math.max(1, Math.ceil(group.cartoons.length / PO_PAGE_SIZE));
                                                                const startIndex = (currentPoPage - 1) * PO_PAGE_SIZE;
                                                                const paginatedCartoons = group.cartoons.slice(startIndex, startIndex + PO_PAGE_SIZE);

                                                                return paginatedCartoons.map((cartoon, detailIndex) => {
                                                                const isShipped = String(cartoon.purchase?.status ?? '').toLowerCase() === 'shipped';

                                                                return (
                                                                <TableRow key={cartoon.id}>
                                                                    <TableCell className="text-right font-medium">{startIndex + detailIndex + 1}</TableCell>
                                                                    <TableCell className="text-center">{cartoon.cartoon_number}</TableCell>
                                                                    <TableCell className="text-center">
                                                                        {(() => {
                                                                            const scannedCodes = Array.isArray(cartoon.product_code)
                                                                                ? cartoon.product_code
                                                                                : (cartoon.product_code != null ? [cartoon.product_code] : []);

                                                                            const normalizedScannedCodes = scannedCodes
                                                                                .map((c) => String(c ?? '').trim())
                                                                                .filter(Boolean);

                                                                            if (!normalizedScannedCodes.length) {
                                                                                return 'N/A';
                                                                            }

                                                                            const poProducts = Array.isArray(cartoon.purchase?.products)
                                                                                ? cartoon.purchase.products
                                                                                : [];

                                                                            const filtered = poProducts.filter((product) => {
                                                                                const barcode = String(product?.barcode ?? '').trim();
                                                                                if (barcode) {
                                                                                    return normalizedScannedCodes.includes(barcode);
                                                                                }
                                                                                // Fallback: if barcode is missing, try product_id matching by scanning product ids is not
                                                                                // possible here reliably from product_code, so treat as non-match.
                                                                                return false;
                                                                            });

                                                                            if (!filtered.length) {
                                                                                return 'N/A';
                                                                            }

                                                                            return (
                                                                                <div className="space-y-1 text-xs">
                                                                                    {filtered.map((product, productIndex) => (
                                                                                        <p key={`${cartoon.id}-product-${product.product_id ?? productIndex}`}>
                                                                                            {formatProductLabel(product) || 'Product details unavailable'}
                                                                                        </p>
                                                                                    ))}
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </TableCell>
                                                                    <TableCell className="text-center">{cartoon.warehouse?.name ?? cartoon.warehouse_name ?? 'N/A'}</TableCell>
                                                                    <TableCell className="text-center">{cartoon.quantity}</TableCell>
                                                                    <TableCell className="text-center">
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            aria-label={`View barcode for ${cartoon.cartoon_number}`}
                                                                                            onClick={() => onViewBarcode?.(cartoon)}
                                                                                        >
                                                                                            <Barcode />
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent side="bottom">
                                                                                        <p>Barcode</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>

                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            aria-label={`Edit ${cartoon.cartoon_number}`}
                                                                                            onClick={() => onEdit(cartoon.id)}
                                                                                            disabled={isShipped}
                                                                                        >
                                                                                            <Pencil />
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent side="bottom">
                                                                                        <p>Edit</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>

                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            aria-label={`Delete ${cartoon.cartoon_number}`}
                                                                                            onClick={() => onRequestDelete(cartoon)}
                                                                                            disabled={deletingId === cartoon.id || isShipped}
                                                                                        >
                                                                                            <Trash2 className="text-destructive" />
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent side="bottom">
                                                                                        <p>Delete</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>

                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            aria-label={`Add quantity for ${cartoon.cartoon_number}`}
                                                                                            onClick={() => onAddQuantity?.(cartoon)}
                                                                                            disabled={isShipped}
                                                                                        >
                                                                                            <Plus />
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent side="bottom">
                                                                                        <p>Add Stock</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>

                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            aria-label={`Deduct quantity for ${cartoon.cartoon_number}`}
                                                                                            onClick={() => onDeductQuantity?.(cartoon)}
                                                                                            disabled={isShipped}
                                                                                        >
                                                                                            <Minus />
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent side="bottom">
                                                                                        <p>Deduct Stock</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>

                                                                            {String(cartoon.purchase?.status ?? '').toLowerCase() === 'received' && (
                                                                                <TooltipProvider>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="icon"
                                                                                                aria-label={`Assign rack for ${cartoon.cartoon_number}`}
                                                                                                onClick={() => onAssignRack?.(cartoon)}
                                                                                            >
                                                                                                <PackageCheck />
                                                                                            </Button>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent side="bottom">
                                                                                            <p>Assign Rack</p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                                );
                                                            });
                                                            })()}
                                                        </TableBody>
                                                    </Table>
                                                    {group.cartoons.length > PO_PAGE_SIZE && (() => {
                                                        const currentPoPage = poPageState[group.key] ?? 1;
                                                        const totalPoPages = Math.max(1, Math.ceil(group.cartoons.length / PO_PAGE_SIZE));
                                                        return (
                                                            <div className="flex items-center justify-between gap-4 px-2 pt-2">
                                                                <p className="text-sm text-muted-foreground">
                                                                    Showing {Math.min((currentPoPage - 1) * PO_PAGE_SIZE + 1, group.cartoons.length)}-{Math.min(currentPoPage * PO_PAGE_SIZE, group.cartoons.length)} of {group.cartoons.length} cartoons
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setPoPageState((prev) => ({ ...prev, [group.key]: currentPoPage - 1 }))}
                                                                        disabled={currentPoPage <= 1}
                                                                    >
                                                                        Previous
                                                                    </Button>
                                                                    <span className="text-sm tabular-nums text-muted-foreground">
                                                                        Page {currentPoPage} of {totalPoPages}
                                                                    </span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setPoPageState((prev) => ({ ...prev, [group.key]: currentPoPage + 1 }))}
                                                                        disabled={currentPoPage >= totalPoPages}
                                                                    >
                                                                        Next
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
                            );
                        })}
                </TableBody>
            </Table>
        </Card>

        </>
    );
}
