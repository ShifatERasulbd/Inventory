import { Mail, MapPinned, MoreVertical, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRemoteOrderStatus } from '@/lib/remoteOrderStatus';
import { Checkbox } from '@/components/ui/checkbox'; 
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const STATUS_OPTIONS = ['pending', 'waiting for shipment', 'ready for shipment', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function OrdersTable({ 
    orders, 
    isLoading, 
    onUpdateStatus,
    onViewStockLocations,
    onSendToPos,
    onSendTrackingEmail,
    selectedIds, 
    onSelectOrder, 
    onSelectAllOrders,
    canUpdate = true,
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
                    <TableHead>Stripe Payment ID</TableHead>
                    <TableHead>Customer</TableHead>
                    {/* New Columns */}
                    <TableHead>Products</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
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
                            <TableCell>{order.stripe_payment_id }</TableCell>
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

                            <TableCell>{formatRemoteOrderStatus(order.status) || '-'}</TableCell>
                            <TableCell>${Number(order.total || 0).toFixed(2)}</TableCell>
                            <TableCell>
                                {order.updated_at ? new Date(order.updated_at).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                {canUpdate && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 gap-1.5"
                                        onClick={() => onSendTrackingEmail?.(order)}
                                    >
                                        <Mail className="h-3.5 w-3.5" />
                                        Send Email
                                    </Button>
                                )}
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
                                {canUpdate && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {STATUS_OPTIONS.map((status) => (
                                                <DropdownMenuItem
                                                    key={status}
                                                    variant={status === 'refunded' || status === 'cancelled' ? 'destructive' : 'default'}
                                                    onSelect={() => onUpdateStatus?.(order, status)}
                                                >
                                                    {formatRemoteOrderStatus(status)}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </TableCell> 
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}