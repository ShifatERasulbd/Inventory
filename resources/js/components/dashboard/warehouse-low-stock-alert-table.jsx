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

export function WarehouseLowStockAlertTable() {
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
                if (!ignore) {
                    setStocks([]);
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        load();

        return () => {
            ignore = true;
        };
    }, []);

    const lowStocks = stocks.filter((stock) => {
        const quantity = Number(stock.available_stock ?? stock.stocks ?? 0);
        return Number.isFinite(quantity) && quantity < 10;
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Warehouse Wise Low Stock Alert</CardTitle>
            </CardHeader>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] text-right">SL</TableHead>
                        <TableHead className="text-center">Product</TableHead>
                        <TableHead className="text-center">Warehouse</TableHead>
                        <TableHead className="text-center">Stock</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell>
                        </TableRow>
                    )}
                    {!isLoading && lowStocks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">No low stock found under 10.</TableCell>
                        </TableRow>
                    )}
                    {!isLoading && lowStocks.map((stock, index) => {
                        const quantity = Number(stock.available_stock ?? stock.stocks ?? 0);

                        return (
                            <TableRow key={stock.id}>
                                <TableCell className="font-medium text-right">{index + 1}</TableCell>
                                <TableCell className="text-center">{stock.name || '—'}</TableCell>
                                <TableCell className="text-center">{stock.warehouse_name || `Warehouse #${stock.warehouse_id}`}</TableCell>
                                <TableCell className="text-center text-red-600 font-semibold">{quantity}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
