import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

function normalizeStatus(status) {
    const value = String(status ?? '').trim().toLowerCase();
    if (!value) return 'unknown';
    return value;
}

function statusBadgeClass(status) {
    const value = normalizeStatus(status);

    if (['approved', 'approve', 'active', 'received'].includes(value)) {
        return 'bg-green-100 text-green-700';
    }

    if (['pending'].includes(value)) {
        return 'bg-amber-100 text-amber-700';
    }

    if (['cancelled', 'canceled', 'rejected'].includes(value)) {
        return 'bg-red-100 text-red-700';
    }

    return 'bg-slate-100 text-slate-700';
}

export default function CartoonTrackingTable({ rows = [], isLoading = false }) {
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[70px]">SL</TableHead>
                        <TableHead>Cartoon Number</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>PO Status</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Loading cartoon tracking...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && rows.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No tracking records found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && rows.map((row, index) => (
                        <TableRow key={row.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{row.cartoon_number || 'N/A'}</TableCell>
                            <TableCell>{row.po_number || 'N/A'}</TableCell>
                            <TableCell>
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(row.po_status)}`}>
                                    {normalizeStatus(row.po_status)}
                                </span>
                            </TableCell>
                            <TableCell>{row.warehouse_name || `Warehouse #${row.warehouse_id ?? 'N/A'}`}</TableCell>
                            <TableCell className="text-center">{Number(row.quantity ?? 0)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
