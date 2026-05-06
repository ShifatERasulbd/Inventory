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
import { Plus, Search, Minus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function StockTable({ stocks = [], onAddStock, onDeductStock, onEdit, onRequestDelete, deletingId, isLoading }) {
    const [search, setSearch] = useState('');
    const filtered = stocks.filter((stock) => {
        const query = search.toLowerCase();
        return stock.name?.toLowerCase().includes(query);
    });

    return (
        <>
            <div className="flex items-center gap-3 justify-between">
                <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full pl-9"
                    />
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">SL No.</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Available Stock</TableHead>
                            <TableHead className="w-[160px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    Loading Stocks...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && stocks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No stocks found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && stocks.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No products match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            filtered.map((stock, index) => (
                                <TableRow key={stock.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{stock.name}</TableCell>
                                    <TableCell>{Number(stock.available_stock ?? 0)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                          <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Add stock for ${stock.name}`}
                                                            onClick={() => onAddStock(stock)}
                                                        >
                                                            <Plus />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                        <p>Add Stock</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Deduct stock for ${stock.name}`}
                                                            onClick={() => onDeductStock(stock)}
                                                        >
                                                            <Minus />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                        <p>Deduct Stock</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                        </TooltipProvider>
                                            
                                            
                                            
                                           
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