import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchStocks } from '@/pages/Stock/api';

export function LowStockAlertTable() {
    const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                const data = await fetchStocks();
                if (!ignore) {
                    setStocks(Array.isArray(data) ? data : []);
                }
            } catch {
                if (!ignore) setStocks([]);
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }

        load();
        return () => { ignore = true; };
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Warehouse Stock Overview</CardTitle>
            </CardHeader>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">SL</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell>
                        </TableRow>
                    )}
                    {!isLoading && stocks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">No stock records found.</TableCell>
                        </TableRow>
                    )}
                    {!isLoading && stocks.map((stock, index) => (
                        <TableRow key={stock.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{stock.name || '—'}</TableCell>
                            <TableCell>{stock.warehouse_name || `Warehouse #${stock.warehouse_id}`}</TableCell>
                            <TableCell className="text-right">{stock.available_stock ?? stock.stocks ?? 0}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}