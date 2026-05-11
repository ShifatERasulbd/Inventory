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
import { Barcode, ChevronDown, ChevronRight, Minus, PackageCheck, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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

export function CartoonTable({ cartoons = [], onAdd, onAddQuantity, onDeductQuantity, onAssignRack, onViewBarcode, onEdit, onRequestDelete, deletingId, isLoading }) {
    const [search, setSearch] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});

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
                        <TableHead className="text-right">SL No.</TableHead>
                       <TableHead className="text-center">Purchase Order</TableHead>
                        <TableHead className="text-center">Cartoon Count</TableHead>
                        <TableHead className="text-center">Quantity Of Products</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                Loading Cartoon...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && cartoons.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No Cartoon found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && filtered.length === 0 && cartoons.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No Cartoons match your search.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        groupedCartoons.map((group, index) => {
                            const isExpanded = expandedGroups[group.key] ?? true;

                            return (
                                <Fragment key={group.key}>
                                    <TableRow>
                                        <TableCell className="font-medium text-right">{index + 1}</TableCell>
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
                                                <div className="text-left">
                                                    <p className="font-medium">{group.purchaseOrder}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {group.purchaseStatus || 'Status unavailable'}
                                                    </p>
                                                    {Array.isArray(group.cartoons[0]?.purchase?.products) && group.cartoons[0].purchase.products.length > 0 && (
                                                        <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                                            {group.cartoons[0].purchase.products.map((product, productIndex) => (
                                                                <p key={`${group.key}-product-${product.product_id ?? productIndex}`}>
                                                                    {formatProductLabel(product) || 'Product details unavailable'}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{group.cartoons.length}</TableCell>
                                        <TableCell className="text-center">{group.totalQuantity}</TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleGroup(group.key)}
                                            >
                                                {isExpanded ? 'Hide details' : 'Show details'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>

                                    {isExpanded && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="bg-muted/20 p-0">
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
                                                            {group.cartoons.map((cartoon, detailIndex) => (
                                                                <TableRow key={cartoon.id}>
                                                                    <TableCell className="text-right font-medium">{detailIndex + 1}</TableCell>
                                                                    <TableCell className="text-center">{cartoon.cartoon_number}</TableCell>
                                                                    <TableCell className="text-center">
                                                                        {Array.isArray(cartoon.purchase?.products) && cartoon.purchase.products.length > 0 ? (
                                                                            <div className="space-y-1 text-xs">
                                                                                {cartoon.purchase.products.map((product, productIndex) => (
                                                                                    <p key={`${cartoon.id}-product-${product.product_id ?? productIndex}`}>
                                                                                        {formatProductLabel(product) || 'Product details unavailable'}
                                                                                    </p>
                                                                                ))}
                                                                            </div>
                                                                        ) : 'N/A'}
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
                                                                                            disabled={deletingId === cartoon.id}
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
                                                            ))}
                                                        </TableBody>
                                                    </Table>
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