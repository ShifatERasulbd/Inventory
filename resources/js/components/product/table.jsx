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
import { Barcode, ChevronDown, ChevronRight, Copy, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export function ProductTable({
    products = [],
    selectedIds = [],
    onToggleSelectAll,
    onToggleSelectRow,
    onRequestBulkBarcode,
    onRequestBulkDelete,
    onAdd,
    onEdit,
    onCopy,
    onViewBarcode,
    onRequestDelete,
    deletingId,
    isBulkDeleting,
    isLoading,
}) {
    const multiSelectCheckboxClass = 'border-gray-400 bg-gray-200 data-[state=checked]:border-black data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=indeterminate]:border-black data-[state=indeterminate]:bg-black data-[state=indeterminate]:text-white';

    const [search, setSearch] = useState('');
    const [expandedStyleKeys, setExpandedStyleKeys] = useState([]);

    const getStyleGroupKey = (product) => {
        const normalizedStyle = (product?.style_number || '').trim().toLowerCase();
        return normalizedStyle || `__product_${product?.id}`;
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        return products.filter((product) => (
            product.name?.toLowerCase().includes(q) ||
            product.style_number?.toLowerCase().includes(q) ||
            product.barCode?.toLowerCase().includes(q) ||
            product.brand?.name?.toLowerCase().includes(q) ||
            product.color?.name?.toLowerCase().includes(q) ||
            product.fabric?.name?.toLowerCase().includes(q) ||
            product.size?.size?.toLowerCase().includes(q) ||
            product.gender?.name?.toLowerCase().includes(q) ||
            product.warehouse?.name?.toLowerCase().includes(q)
        ));
    }, [products, search]);

    const variantGroups = useMemo(() => {
        const groups = {};
        filtered.forEach((product) => {
            const key = getStyleGroupKey(product);
            if (!groups[key]) {
                groups[key] = [];
            }

            groups[key].push(product);
        });

        return groups;
    }, [filtered]);

    const uniqueFiltered = useMemo(
        () => Object.values(variantGroups).map((group) => group[0]),
        [variantGroups]
    );

    const filteredIds = uniqueFiltered.flatMap((product) => {
        const key = getStyleGroupKey(product);
        const variants = variantGroups[key] || [];

        if (!expandedStyleKeys.includes(key)) {
            return [product.id];
        }

        return variants.map((variant) => variant.id);
    });
    const selectedSet = new Set(selectedIds);
    const selectedVisibleCount = filteredIds.filter((id) => selectedSet.has(id)).length;
    const allVisibleSelected = filteredIds.length > 0 && selectedVisibleCount === filteredIds.length;
    const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

    const toggleStyleExpansion = (styleKey) => {
        setExpandedStyleKeys((previous) => (
            previous.includes(styleKey)
                ? previous.filter((item) => item !== styleKey)
                : [...previous, styleKey]
        ));
    };

    return (
        <>
            <div className="flex items-center gap-3 justify-between">
                <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full pl-9"
                    />
                </div>
                <Button className="shrink-0 gap-2" onClick={onAdd}>
                    <Plus />
                    Add Product
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {selectedIds.length} selected
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={onRequestBulkBarcode}
                        disabled={selectedIds.length === 0 || isBulkDeleting || isLoading}
                    >
                        <Barcode className="h-4 w-4" />
                        Barcode
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onRequestBulkDelete}
                        disabled={selectedIds.length === 0 || isBulkDeleting || isLoading}
                    >
                        {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
                    </Button>
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">
                                <Checkbox
                                    className={multiSelectCheckboxClass}
                                    checked={allVisibleSelected ? true : (someVisibleSelected ? 'indeterminate' : false)}
                                    onCheckedChange={(checked) => onToggleSelectAll?.(filteredIds, Boolean(checked))}
                                    aria-label="Select all products"
                                />
                            </TableHead>
                            <TableHead className="w-[90px]">SL No.</TableHead>
                            <TableHead className="w-[90px]">Image</TableHead>
                            <TableHead>Style No.</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Warehouse</TableHead>
                            <TableHead className="w-[160px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground">
                                    Loading Products...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground">
                                    No Products found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && uniqueFiltered.length === 0 && products.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground">
                                    No Products match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            uniqueFiltered.map((product, index) => {
                                const styleKey = getStyleGroupKey(product);
                                const variants = variantGroups[styleKey] || [];
                                const hasVariants = variants.length > 1;
                                const isExpanded = expandedStyleKeys.includes(styleKey);
                                const variantIds = hasVariants ? variants.map((variant) => variant.id) : [product.id];
                                const selectedVariantCount = variantIds.filter((id) => selectedSet.has(id)).length;
                                const parentChecked = selectedVariantCount === variantIds.length;
                                const parentIndeterminate = selectedVariantCount > 0 && selectedVariantCount < variantIds.length;

                                return (
                                <Fragment key={styleKey}>
                                    <TableRow>
                                        <TableCell>
                                            <Checkbox
                                                className={multiSelectCheckboxClass}
                                                checked={parentChecked ? true : (parentIndeterminate ? 'indeterminate' : false)}
                                                onCheckedChange={(checked) => onToggleSelectAll?.(variantIds, Boolean(checked))}
                                                aria-label={`Select ${product.name}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            {product.cover_image_url ? (
                                                <img
                                                    src={product.cover_image_url}
                                                    alt={product.name}
                                                    className="h-12 w-12 rounded-md border object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-md border text-xs text-muted-foreground">
                                                    N/A
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {hasVariants && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => toggleStyleExpansion(styleKey)}
                                                            aria-label={isExpanded ? 'Collapse variants' : 'Expand variants'}
                                                        >
                                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        </Button>
                                                )}
                                                <span>{product.style_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p>{product.name}</p>
                                                <p className="text-xs text-muted-foreground">{product.barCode}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.brand?.name || 'N/A'}</TableCell>
                                        <TableCell>{product.warehouse?.name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label={`View barcode for ${product.name}`}
                                                                onClick={() => onViewBarcode?.(product, { variants: hasVariants ? variants : [product] })}
                                                            >
                                                                <Eye />
                                                            </Button>
                                                        </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                        <p>View Barcode</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                             <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Edit ${product.name}`}
                                                            onClick={() => onEdit(product.id)}
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
                                                            aria-label={`Copy ${product.name}`}
                                                            onClick={() => onCopy?.(product, { variants: hasVariants ? variants : [product] })}
                                                        >
                                                            <Copy />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                        <p>Copy Attributes</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                              <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Delete ${product.name}`}
                                                            onClick={() => onRequestDelete(product)}
                                                            disabled={deletingId === product.id || isBulkDeleting}
                                                        >
                                                            <Trash2 className="text-destructive" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                        <p>Delete</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            </div>
                                        </TableCell>
                                    </TableRow>

                                        {isExpanded && hasVariants && variants.map((variant) => (
                                            <TableRow key={variant.id} className="bg-muted/30">
                                                <TableCell>
                                                    <Checkbox
                                                        className={multiSelectCheckboxClass}
                                                        checked={selectedSet.has(variant.id)}
                                                        onCheckedChange={(checked) => onToggleSelectRow?.(variant.id, Boolean(checked))}
                                                        aria-label={`Select ${variant.name}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium text-muted-foreground">-</TableCell>
                                                <TableCell>
                                                    {variant.cover_image_url ? (
                                                        <img
                                                            src={variant.cover_image_url}
                                                            alt={variant.name}
                                                            className="h-12 w-12 rounded-md border object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-md border text-xs text-muted-foreground">
                                                            N/A
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{variant.style_number}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <p>{variant.name}</p>
                                                        <p className="text-xs text-muted-foreground">{variant.barCode}</p>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span>Color: <span className="font-medium text-foreground">{variant.color?.name || 'N/A'}</span></span>
                                                            <span>Size: <span className="font-medium text-foreground">{variant.size?.size || 'N/A'}</span></span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{variant.brand?.name || 'N/A'}</TableCell>
                                                <TableCell>{variant.warehouse?.name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        aria-label={`View barcode for ${variant.name}`}
                                                                        onClick={() => onViewBarcode?.(variant, { variants: [variant] })}
                                                                    >
                                                                        <Eye />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="bottom">
                                                                    <p>View Barcode</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        aria-label={`Edit ${variant.name}`}
                                                                        onClick={() => onEdit(variant.id, { variantOnly: true })}
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
                                                                        aria-label={`Copy ${variant.name}`}
                                                                        onClick={() => onCopy?.(variant, { variants: [variant] })}
                                                                    >
                                                                        <Copy />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="bottom">
                                                                    <p>Copy Attributes</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        aria-label={`Delete ${variant.name}`}
                                                                        onClick={() => onRequestDelete(variant)}
                                                                        disabled={deletingId === variant.id || isBulkDeleting}
                                                                    >
                                                                        <Trash2 className="text-destructive" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="bottom">
                                                                    <p>Delete</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </Fragment>
                                );
                            })}
                    </TableBody>
                </Table>
            </Card>
        </>
    );
}
