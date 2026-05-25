import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function WarehouseStockModal({
    open,
    onOpenChange,
    warehouseName,
    rows = [],
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[95vw] sm:max-w-5xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Warehouse Stock</AlertDialogTitle>
                    <AlertDialogDescription>
                        {warehouseName ? `Current stock for ${warehouseName}.` : 'Select a warehouse to view stock.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="max-h-[60vh] overflow-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">SL No.</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead className="text-right">Available Stock</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No product in stock.
                                    </TableCell>
                                </TableRow>
                            )}

                            {rows.map((row, index) => (
                                <TableRow key={`${row.product_id}-${index}`}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.color || 'N/A'}</TableCell>
                                    <TableCell>{row.size || 'N/A'}</TableCell>
                                    <TableCell className="text-right">{Number(row.available_stock ?? 0)}</TableCell>
                                    <TableCell className="text-right">$ {Number(row.unit_price ?? 0).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
