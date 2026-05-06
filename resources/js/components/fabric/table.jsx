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

export function FabricTable({ fabrics = [], onAdd, onEdit, onRequestDelete, deletingId, isLoading }) {
    const [search, setSearch] = useState('');
    const filtered = fabrics.filter((f) => {
        const q = search.toLowerCase();
        return (
            f.name?.toLowerCase().includes(q) ||
            f.type?.toLowerCase().includes(q) ||
            f.composition?.toLowerCase().includes(q) ||
            f.construction?.toLowerCase().includes(q) ||
            f.ref_number?.toLowerCase().includes(q)
        );
    });

    return (
        <>
        <div className="flex items-center gap-3 justify-between">
            <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search Colors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9"
                />
            </div>
            <Button className="shrink-0 gap-2" onClick={onAdd}>
                <Plus />
                Add Fabric
            </Button>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">SL No.</TableHead>
                        <TableHead>Fabric</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Composition</TableHead>
                        <TableHead>Construction</TableHead>
                        <TableHead>Ref No.</TableHead>
                        <TableHead>GSM</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="w-[160px]">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                                Loading Fabric...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && fabrics.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                                No Fabrics found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && filtered.length === 0 && fabrics.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                                No Fabrics match your search.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        filtered.map((fabric, index) => (
                            <TableRow key={fabric.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{fabric.name}</TableCell>
                                <TableCell>{fabric.type ?? '—'}</TableCell>
                                <TableCell>{fabric.composition ?? '—'}</TableCell>
                                <TableCell>{fabric.construction ?? '—'}</TableCell>
                                <TableCell>{fabric.ref_number ?? '—'}</TableCell>
                                <TableCell>{fabric.gsm != null ? fabric.gsm : '—'}</TableCell>
                                <TableCell>{fabric.supplier?.name ?? '—'}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                      
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                       <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Edit ${fabric.name}`}
                                                            onClick={() => onEdit(fabric.id)}
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
                                                        aria-label={`Delete ${fabric.name}`}
                                                        onClick={() => onRequestDelete(fabric)}
                                                        disabled={deletingId === fabric.id}
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
    );
}