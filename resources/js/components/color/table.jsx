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

export function ColorTable({ colors = [], onAdd, onEdit, onRequestDelete, deletingId, isLoading }) {
    const [search, setSearch] = useState('');
    const filtered = colors.filter((c) => {
        const q = search.toLowerCase();
        return (
            c.name?.toLowerCase().includes(q) ||
            c.color_code?.toLowerCase().includes(q)
           
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
                Add Color
            </Button>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">SL No.</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Color Code</TableHead>
                       
                        <TableHead className="w-[160px]">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                Loading Colors...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && colors.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No Colors found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && filtered.length === 0 && colors.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No Colors match your search.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        filtered.map((color, index) => (
                            <TableRow key={color.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{color.name}</TableCell>
                                <TableCell>{color.color_code ?? '—'}</TableCell>
                                
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                       <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Edit ${color.name}`}
                                                            onClick={() => onEdit(color.id)}
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
                                                        aria-label={`Delete ${color.name}`}
                                                        onClick={() => onRequestDelete(color)}
                                                        disabled={deletingId === color.id}
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