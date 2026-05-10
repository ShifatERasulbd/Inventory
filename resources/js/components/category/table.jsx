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

export function CategoryTable({ categories = [], onAdd, onEdit, onRequestDelete, deletingId, isLoading }) {
    const [search, setSearch] = useState('');
    const filtered = categories.filter((category) => {
        const q = search.toLowerCase();
        return category.name?.toLowerCase().includes(q);
    });

    return (
        <>
            <div className="flex items-center gap-3 justify-between">
                <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full pl-9"
                    />
                </div>
                <Button className="shrink-0 gap-2" onClick={onAdd}>
                    <Plus />
                    Add Category
                </Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">SL No.</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="w-[160px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    Loading Categories...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    No Categories found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && categories.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    No Categories match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            filtered.map((category, index) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Edit ${category.name}`}
                                                            onClick={() => onEdit(category.id)}
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
                                                            aria-label={`Delete ${category.name}`}
                                                            onClick={() => onRequestDelete(category)}
                                                            disabled={deletingId === category.id}
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
