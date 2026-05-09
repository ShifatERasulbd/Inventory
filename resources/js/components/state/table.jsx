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
import { Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function StateTable({
        states = [],
        onAdd,
        onEdit,
        onRequestDelete,
        onToggleDeleted,
        onRestore,
        deletingId,
        restoringId,
        isLoading,
        isShowingDeleted = false,
        isSuperAdmin = false,
}) {
    const [search, setSearch] = useState('');
    const filtered = states.filter((s) => {
        const q = search.toLowerCase();
        return (
            s.name?.toLowerCase().includes(q) ||
            (s.country?.name ?? s.country_name ?? '').toLowerCase().includes(q)
        );
    });

    return (
        <>
        <div className="flex items-center gap-3 justify-between">
            <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search states..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9"
                />
            </div>
            <Button className="gap-2" onClick={onAdd}>
                <Plus />
                Add State
            </Button>
            {isSuperAdmin && (
                <Button type="button" variant="outline" className="gap-2" onClick={onToggleDeleted}>
                    <RotateCcw />
                    {isShowingDeleted ? 'Back To States' : 'Deleted States'}
                </Button>
            )}
        </div>
            <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">SL No.</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead className="w-[160px]">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                Loading {isShowingDeleted ? 'deleted states' : 'states'}...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && states.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No {isShowingDeleted ? 'deleted states' : 'states'} found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && filtered.length === 0 && states.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No {isShowingDeleted ? 'deleted states' : 'states'} match your search.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        filtered.map((state, index) => (
                            <TableRow key={state.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{state.country?.name || state.country_name || '-'}</TableCell>
                                <TableCell>{state.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {isShowingDeleted ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Restore ${state.name}`}
                                                            onClick={() => onRestore?.(state.id)}
                                                            disabled={restoringId === state.id}
                                                        >
                                                            <RotateCcw className="text-emerald-600" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                        <p>{restoringId === state.id ? 'Restoring...' : 'Restore'}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label={`Edit ${state.name}`}
                                                                onClick={() => onEdit?.(state.id)}
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
                                                                aria-label={`Delete ${state.name}`}
                                                                onClick={() => onRequestDelete?.(state)}
                                                                disabled={deletingId === state.id}
                                                            >
                                                                <Trash2 className="text-destructive" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom">
                                                            <p>Delete</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </>
                                        )}
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