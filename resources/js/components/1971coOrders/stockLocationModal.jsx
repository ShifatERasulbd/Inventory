import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function StockLocationModal({
    open,
    onOpenChange,
    orderNumber,
    items = [],
    isLoading = false,
    errorMessage = '',
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Stock Locations</DialogTitle>
                    <DialogDescription>
                        {orderNumber ? `Cartons, racks, and rack rows for order ${orderNumber}.` : 'Cartons, racks, and rack rows for this order.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-auto space-y-4">
                    {isLoading && <p className="text-sm text-muted-foreground">Loading stock locations...</p>}
                    {!isLoading && !!errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                    {!isLoading && !errorMessage && items.length === 0 && (
                        <p className="text-sm text-muted-foreground">No stock locations found.</p>
                    )}

                    {items.map((item, index) => (
                        <div key={`${item.input_label}-${index}`} className="rounded-lg border">
                            <div className="border-b px-4 py-3">
                                <div className="font-medium">{item.resolved_product_name || item.input_label || 'Product'}</div>
                                <div className="text-xs text-muted-foreground">
                                    Requested Qty: {item.requested_quantity ?? 1}
                                    {item.product_barcode ? ` | Barcode: ${item.product_barcode}` : ''}
                                </div>
                                {item.message && <div className="mt-1 text-xs text-amber-600">{item.message}</div>}
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead>Cartoon</TableHead>
                                        <TableHead>Rack</TableHead>
                                        <TableHead>Rack Row</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(item.matches || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No cartoon found for this product.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (item.matches || []).map((match) => (
                                            <TableRow key={`${item.input_label}-${match.cartoon_id}`}>
                                                <TableCell>{match.warehouse_name || 'N/A'}</TableCell>
                                                <TableCell>{match.cartoon_number || 'N/A'}</TableCell>
                                                <TableCell>{match.rack_name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {match.rack_row_number || 'N/A'}
                                                    {match.rack_row_code ? ` (${match.rack_row_code})` : ''}
                                                </TableCell>
                                                <TableCell className="text-right">{match.quantity ?? 0}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}