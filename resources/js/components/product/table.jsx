import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export function ProductTable({
    products = [],
    selectedIds = [],
    onToggleSelectAll,
    onToggleSelectRow,
    onRequestBulkDelete,
    onAdd,
    onEdit,
    onViewBarcode,
    onRequestDelete,
    deletingId,
    isBulkDeleting,
    isLoading,
}) {
    const multiSelectCheckboxClass = 'border-gray-400 bg-gray-200 data-[state=checked]:border-black data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=indeterminate]:border-black data-[state=indeterminate]:bg-black data-[state=indeterminate]:text-white';

    const [search, setSearch] = useState('');
    const filtered = products.filter((product) => {
        const q = search.toLowerCase();
        return (
            product.name?.toLowerCase().includes(q) ||
            product.style_number?.toLowerCase().includes(q) ||
            product.barCode?.toLowerCase().includes(q) ||
            product.brand?.name?.toLowerCase().includes(q) ||
            product.color?.name?.toLowerCase().includes(q) ||
            product.fabric?.name?.toLowerCase().includes(q) ||
            product.size?.size?.toLowerCase().includes(q) ||
            product.gender?.name?.toLowerCase().includes(q) ||
            product.warehouse?.name?.toLowerCase().includes(q)
        );
    });
    const filteredIds = filtered.map((product) => product.id);
    const selectedSet = new Set(selectedIds);
    const selectedVisibleCount = filteredIds.filter((id) => selectedSet.has(id)).length;
    const allVisibleSelected = filteredIds.length > 0 && selectedVisibleCount === filteredIds.length;
    const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

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
                <Button
                    type="button"
                    variant="destructive"
                    onClick={onRequestBulkDelete}
                    disabled={selectedIds.length === 0 || isBulkDeleting || isLoading}
                >
                    {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
                </Button>
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
                            <TableHead>Color</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Warehouse</TableHead>
                            <TableHead className="w-[160px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center text-muted-foreground">
                                    Loading Products...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center text-muted-foreground">
                                    No Products found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && products.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center text-muted-foreground">
                                    No Products match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            filtered.map((product, index) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Checkbox
                                            className={multiSelectCheckboxClass}
                                            checked={selectedSet.has(product.id)}
                                            onCheckedChange={(checked) => onToggleSelectRow?.(product.id, Boolean(checked))}
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
                                    <TableCell>{product.style_number}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p>{product.name}</p>
                                            <p className="text-xs text-muted-foreground">{product.barCode}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.brand?.name || 'N/A'}</TableCell>
                                    <TableCell>{product.color?.name || 'N/A'}</TableCell>
                                    <TableCell>{product.size?.size || 'N/A'}</TableCell>
                                    <TableCell>{product.warehouse?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`View barcode for ${product.name}`}
                                                onClick={() => onViewBarcode?.(product)}
                                            >
                                                <Eye />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit ${product.name}`}
                                                onClick={() => onEdit(product.id)}
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Delete ${product.name}`}
                                                onClick={() => onRequestDelete(product)}
                                                disabled={deletingId === product.id || isBulkDeleting}
                                            >
                                                <Trash2 className="text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </Card>
        </>
    );
}
