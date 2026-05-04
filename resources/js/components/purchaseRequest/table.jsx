import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
function formatMoney(value) {
    const numberValue = Number(value ?? 0);
    return Number.isFinite(numberValue) ? numberValue.toFixed(2) : '0.00';
}

export default function PurchaseRequestTable({
    data = [],
    searchTerm = '',
    onDelete,
    statusDrafts = {},
    updatingId,
    onDraftChange,
    onUpdateStatus,
}) {
    const safeData = Array.isArray(data) ? data : [];

    const filtered = safeData.filter((item) => {
        const query = searchTerm.toLowerCase();
        const poMatch = String(item.po_number ?? '').toLowerCase().includes(query);
        const productsText = (item.products || [])
            .map((product) => String(product.product_name || `Product #${product.product_id || ''}`).toLowerCase())
            .join(' ');

        return poMatch || productsText.includes(query);
        });
    return (
        <>
          <Card className="rounded-lg border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SL No.</TableHead>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Purchase From</TableHead>
                                <TableHead>Send To</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((purchase, index) => (
                                <TableRow key={purchase.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{purchase.po_number}</TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            {(purchase.products || []).map((product, productIndex) => (
                                                <div key={`${purchase.id}-${productIndex}`} className="rounded-md border border-border/60 px-3 py-2 text-sm">
                                                    <div className="font-medium">
                                                        {product.product_name || `Product #${product.product_id}`}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        Qty: {Number(product.quantity ?? 0)} | Purchase: {formatMoney(product.purchase_price)} | Selling: {formatMoney(product.selling_price)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>{purchase.purchase_form_name}</TableCell>
                                    <TableCell>{purchase.purchase_to_name}</TableCell>
                                    <TableCell className="capitalize">{purchase.status}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={statusDrafts[purchase.id] ?? purchase.status}
                                                onChange={(e) => onDraftChange(purchase.id, e.target.value)}
                                                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                                            >
                                                <option value="pending">pending</option>
                                                <option value="approved">approved</option>
                                                <option value="rejected">rejected</option>
                                                <option value="completed">completed</option>
                                            </select>
                                            <Button
                                                size="sm"
                                                onClick={() => onUpdateStatus(purchase.id, purchase.status)}
                                                disabled={updatingId === purchase.id}
                                            >
                                                {updatingId === purchase.id ? 'Updating...' : 'Update'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(purchase.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
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