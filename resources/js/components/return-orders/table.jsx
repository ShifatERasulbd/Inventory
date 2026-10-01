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
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ReturnOrderTable({ returnOrders = [], onAdd, onEdit, onRequestDelete, deletingId, isLoading, canCreate = false, canUpdate = false, canDelete = false }) {
    const [search, setSearch] = useState('');
    
    const filtered = returnOrders.filter((item) => {
        const q = search.toLowerCase();
        return (
            item.order?.order_number?.toLowerCase().includes(q) ||
            item.order?.customer_name?.toLowerCase().includes(q) ||
            item.reason?.toLowerCase().includes(q)
        );
    });

    return (
        <>
        <div className="flex items-center gap-3 justify-between">
            <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search Return Orders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9"
                />
            </div>
            <Button className="shrink-0 gap-2" onClick={onAdd} disabled={!canCreate}>
                <Plus />
                Add Return Order
            </Button>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">SL No.</TableHead>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Order Details / Reason</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead className="w-[160px]">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                Loading Return Orders...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && returnOrders.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                No Return Order found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && filtered.length === 0 && returnOrders.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                No Return Orders match your search.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        filtered.map((returnOrder, index) => {
                            const items = returnOrder.order?.raw_payload?.items || returnOrder.order?.items || [];
                            const totalQuantity = items.reduce((sum, item) => sum + Number(item?.quantity ?? 0), 0);

                            return (
                            <TableRow key={returnOrder.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{returnOrder.order?.order_number || 'N/A'}</TableCell>
                                <TableCell>{returnOrder.order?.customer_name || 'N/A'}</TableCell>
                                
                                {/* Order Details & Items Mapping */}
                                <TableCell>
                                    <div className="space-y-2">
                                        {items.length > 0 ? (
                                            <div className="space-y-1">
                                                {items.map((item, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        <span className="font-medium">{item.quantity}x {item.name}</span>
                                                        {(item.selectedColor || item.selectedSize) && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">No items</span>
                                        )}

                                        {/* Reason Section */}
                                        <div className="text-xs text-muted-foreground pt-1 border-t">
                                            <span className="font-semibold text-foreground">Reason:</span> {returnOrder.reason || 'N/A'}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>{totalQuantity || '-'}</TableCell>
                                <TableCell>{returnOrder.order?.total ? `$${returnOrder.order.total}` : '-'}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {canUpdate && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                     <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Edit Return Order`}
                                                        onClick={() => onEdit(returnOrder.id)}
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p>Edit</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        )}

                                        {canDelete && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Delete Return Order`}
                                                        onClick={() => onRequestDelete(returnOrder)}
                                                        disabled={deletingId === returnOrder.id}
                                                    >
                                                        <Trash2 className="text-destructive" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p>Delete</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        </Card>
        </>
    );
}