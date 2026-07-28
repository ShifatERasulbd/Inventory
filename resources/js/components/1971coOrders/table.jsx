import { Edit2, MapPinned, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; 
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function OrdersTable({ 
    orders, 
    isLoading, 
    onEdit, 
    onViewStockLocations,
    onSendToPos,
    selectedIds, 
    onSelectOrder, 
    onSelectAllOrders 
}) {
    const allSelected = orders.length > 0 && selectedIds.length === orders.length;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[40px]">
                        <Checkbox 
                            checked={allSelected} 
                            onCheckedChange={(checked) => onSelectAllOrders?.(!!checked)}
                        />
                    </TableHead>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    {/* New Columns */}
                    <TableHead>Products</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Courier</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {!isLoading && orders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={11} className="text-center text-muted-foreground">
                            No remote orders found.
                        </TableCell>
                    </TableRow>
                )}

                {orders.map((order, index) => {
                    const isChecked = selectedIds.includes(order.id);
                    
                    // Fallback helpers to read items from order.items or order.raw_payload.items
                    const items = order.items || order.raw_payload?.items || [];

                    return (
                        <TableRow key={order.id} className={isChecked ? "bg-muted/50" : ""}>
                            <TableCell>
                                <Checkbox 
                                    checked={isChecked} 
                                    onCheckedChange={(checked) => onSelectOrder?.(order.id, !!checked)}
                                />
                            </TableCell>
                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                            <TableCell>{order.order_number || '-'}</TableCell>
                            <TableCell>{order.customer_name || '-'}</TableCell>
                            
                            {/* Products Column */}
                            <TableCell className="max-w-[200px] truncate title={items.map(i => i.name || i.title).join(', ')}">
                                {items.length > 0 ? (
                                    <div className="flex flex-col gap-0.5">
                                        {items.map((item, idx) => (
                                            <span key={idx} className="block text-xs truncate">
                                                {item.name || item.title || 'Unknown Product'}
                                                 <p className="text-sm text-muted-foreground">
                                            
                                            {item.selectedColor ? ` | Color: ${item.selectedColor}` : ''}
                                            {item.selectedSize ? ` | Size: ${item.selectedSize}` : ''}
                                        </p>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>

                            {/* Quantities Column */}
                            <TableCell>
                                {items.length > 0 ? (
                                    <div className="flex flex-col gap-0.5">
                                        {items.map((item, idx) => (
                                            <span key={idx} className="block text-xs text-muted-foreground">
                                                {item.quantity || item.qty || 1}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>

                            <TableCell>{order.status || '-'}</TableCell>
                            <TableCell>
                                {order.courier_company || 
                                 order.raw_payload?.courier_company || 
                                 order.raw_payload?.courier_service || '-'}
                            </TableCell>
                            <TableCell>${Number(order.total || 0).toFixed(2)}</TableCell>
                            <TableCell>
                                {order.updated_at ? new Date(order.updated_at).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 gap-1.5"
                                    onClick={() => onSendToPos?.(order)}
                                >
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    POS
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 gap-1.5"
                                    onClick={() => onViewStockLocations?.(order)}
                                >
                                    <MapPinned className="h-3.5 w-3.5" />
                                    Stock
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 gap-1.5"
                                    onClick={() => onEdit?.(order)}
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Edit
                                </Button>
                            </TableCell> REPLACE
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}