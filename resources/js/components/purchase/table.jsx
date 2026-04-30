import { Pencil, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function PurchaseTable({ purchases = [], isLoading, onEdit, onRequestDelete, deletingId, onAddNew }) {
    const [search, setSearch] = useState('');

    const filtered = purchases.filter((purchase) => {
        const query = search.toLowerCase();
        const poNumber = String(purchase.po_number || '').toLowerCase();
        const productName = String(purchase.product_name || '').toLowerCase();
        const status = String(purchase.status || '').toLowerCase();

        return poNumber.includes(query) || productName.includes(query) || status.includes(query);
    });

    return (
        <>
            <div className="flex items-center gap-3 justify-between">
                <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search PO, product, status..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full pl-9"
                    />
                </div>

                <Button type="button" onClick={onAddNew}>Add Purchase</Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">SL No.</TableHead>
                            <TableHead>PO Number</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Purchase From</TableHead>
                            <TableHead>Purchase To</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Purchase Price</TableHead>
                            <TableHead>Selling Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[120px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center text-muted-foreground">
                                    Loading purchases...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && purchases.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center text-muted-foreground">
                                    No purchases found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && purchases.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center text-muted-foreground">
                                    No purchases match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            filtered.map((purchase, index) => (
                                <TableRow key={purchase.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{purchase.po_number}</TableCell>
                                    <TableCell>{purchase.product_name || `Product #${purchase.product_id}`}</TableCell>
                                    <TableCell>{purchase.purchase_form_name || `Warehouse #${purchase.purchase_form}`}</TableCell>
                                    <TableCell>{purchase.purchase_to_name || `Warehouse #${purchase.purchase_to}`}</TableCell>
                                    <TableCell>{Number(purchase.quantity ?? 0)}</TableCell>
                                    <TableCell>{Number(purchase.purchase_price ?? 0).toFixed(2)}</TableCell>
                                    <TableCell>{Number(purchase.selling_price ?? 0).toFixed(2)}</TableCell>
                                    <TableCell className="capitalize">{purchase.status}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit purchase ${purchase.po_number}`}
                                                onClick={() => onEdit(purchase.id)}
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Delete purchase ${purchase.po_number}`}
                                                onClick={() => onRequestDelete(purchase)}
                                                disabled={deletingId === purchase.id}
                                            >
                                                <Trash2 />
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
