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
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function WarehouseTable({
    warehouses = [],
    onAdd,
    onEdit,
    onRequestDelete,
    deletingId,
    isLoading,
}) {
    const [search, setSearch] = useState('');
    const filtered = warehouses.filter((w) => {
        const q = search.toLowerCase();
        return (
            w.name?.toLowerCase().includes(q) ||
            w.fulladress?.toLowerCase().includes(q) ||
            (w.country?.name ?? '').toLowerCase().includes(q) ||
            (w.state?.name ?? '').toLowerCase().includes(q)
        );
    });

    return (
        <>
        <div className="flex items-center gap-3 justify-between">
            <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search warehouses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9"
                />
            </div>
            <Button className="gap-2" onClick={onAdd}>
                <Plus />
                Add Warehouse
            </Button>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">SL No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Full Address</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Loading warehouses...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && warehouses.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No warehouses found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && filtered.length === 0 && warehouses.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No warehouses match your search.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        filtered.map((warehouse, index) => (
                            <TableRow key={warehouse.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{warehouse.name}</TableCell>
                                <TableCell>{warehouse.country?.name || '-'}</TableCell>
                                <TableCell>{warehouse.state?.name || '-'}</TableCell>
                                <TableCell>{warehouse.fulladress}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                       
                                       <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Edit ${warehouse.name}`}
                                                        onClick={() => onEdit?.(warehouse.id)}
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p>Edit</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                         <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Delete ${warehouse.name}`}
                                                        onClick={() => onRequestDelete?.(warehouse)}
                                                        disabled={deletingId === warehouse.id}
                                                    >
                                                        <Trash2 className="text-destructive" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p>Delete</p>
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
    )
}