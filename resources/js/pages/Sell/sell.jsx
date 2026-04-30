import { useEffect, useState } from 'react';
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
import { toast } from 'sonner';

async function fetchSells() {
    const response = await fetch('/api/sells', {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch sells');
    }

    return response.json();
}

function SellTable({ data, searchTerm }) {
    const filtered = data.filter((item) => {
        const keyword = searchTerm.toLowerCase();
        return (
            String(item.po_number ?? '').toLowerCase().includes(keyword) ||
            String(item.product_name ?? '').toLowerCase().includes(keyword) ||
            String(item.selling_from_name ?? '').toLowerCase().includes(keyword) ||
            String(item.sold_to_name ?? '').toLowerCase().includes(keyword)
        );
    });

    return (
        <Card className="rounded-lg border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>SL No.</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Selling From</TableHead>
                        <TableHead>Sold To</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Purchase Price</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                                No sell data found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filtered.map((sell, index) => (
                            <TableRow key={sell.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{sell.po_number}</TableCell>
                                <TableCell>{sell.product_name}</TableCell>
                                <TableCell>{sell.selling_from_name}</TableCell>
                                <TableCell>{sell.sold_to_name}</TableCell>
                                <TableCell>{sell.quantity}</TableCell>
                                <TableCell>{Number(sell.purchase_price ?? 0).toFixed(2)}</TableCell>
                                <TableCell>{Number(sell.selling_price ?? 0).toFixed(2)}</TableCell>
                                <TableCell className="capitalize">{sell.status}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    );
}

export default function Sell() {
    const [sells, setSells] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadSells = async () => {
            try {
                setLoading(true);
                const data = await fetchSells();
                setSells(Array.isArray(data) ? data : []);
            } catch (error) {
                toast.error('Failed to load sell data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadSells();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Sell</h1>
            </div>

            <Input
                placeholder="Search by PO number, product, warehouse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />

            <SellTable data={sells} searchTerm={searchTerm} />
        </div>
    );
}
