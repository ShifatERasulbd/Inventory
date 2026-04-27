import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ProductTable({ products = [], onAdd, onEdit, onRequestDelete, deletingId, isLoading }) {
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

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
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
                                <TableCell colSpan={9} className="text-center text-muted-foreground">
                                    Loading Products...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center text-muted-foreground">
                                    No Products found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && products.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center text-muted-foreground">
                                    No Products match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            filtered.map((product, index) => (
                                <TableRow key={product.id}>
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
                                                disabled={deletingId === product.id}
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
