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
import { Barcode, Pencil, Plus, Search, Trash2,Minus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function CartoonTable({ cartoons = [], onAdd, onAddQuantity, onDeductQuantity, onViewBarcode, onEdit, onRequestDelete, deletingId, isLoading }) {
    const [search, setSearch] = useState('');
    const filtered = cartoons.filter((c) => {
        const q = search.toLowerCase();
        return (
            c.cartoon_number?.toLowerCase().includes(q) 
           
        );
    });

    return (
        <>
        <div className="flex items-center gap-3 justify-between">
            <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search countries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9"
                />
            </div>
            <Button className="shrink-0 gap-2" onClick={onAdd}>
                <Plus />
                Add Cartoon
            </Button>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-right">SL No.</TableHead>
                        <TableHead className="text-center">Cartoon</TableHead>
                       <TableHead className="text-center">Purchase Order</TableHead>
                       <TableHead className="text-center">Quantity Of Products</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                Loading Cartoon...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && cartoons.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No Cartoon found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && filtered.length === 0 && cartoons.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No Cartoons match your search.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        filtered.map((cartoon, index) => (
                            <TableRow key={cartoon.id}>
                                <TableCell className="font-medium text-right">{index + 1}</TableCell>
                                <TableCell className="text-center">{cartoon.cartoon_number}</TableCell>
                                <TableCell className="text-center">{cartoon.purchase?.po_number ?? cartoon.purchase?.id ?? cartoon.p_o_number ?? ''}</TableCell>
                                <TableCell className="text-center">{cartoon.quantity}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`View barcode for ${cartoon.cartoon_number}`}
                                                        onClick={() => onViewBarcode?.(cartoon)}
                                                    >
                                                        <Barcode />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p>Barcode</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Edit ${cartoon.cartoon_number}`}
                                                        onClick={() => onEdit(cartoon.id)}
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
                                                            aria-label={`Delete ${cartoon.name}`}
                                                            onClick={() => onRequestDelete(cartoon)}
                                                            disabled={deletingId === cartoon.id}
                                                        >
                                                            <Trash2 className="text-destructive" />
                                                        </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p>Delete</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Add quantity for ${cartoon.cartoon_number}`}
                                                            onClick={() => onAddQuantity?.(cartoon)}
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
                                                            aria-label={`Deduct quantity for ${cartoon.cartoon_number}`}
                                                            onClick={() => onDeductQuantity?.(cartoon)}
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