
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function StateTable({ states = [], onAdd, onEdit, onDelete, deletingId, isLoading }) {
    return (
        <>
        <div className="flex justify-end">
            <Button className="gap-2" onClick={onAdd}>
                <Plus />
                Add State
            </Button>
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
                                Loading states...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && states.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No states found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        states.map((state, index) => (
                            <TableRow key={state.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{state.country?.name || state.country_name || '-'}</TableCell>
                                <TableCell>{state.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${state.name}`}
                                            onClick={() => onEdit?.(state.id)}
                                        >
                                            <Pencil />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Delete ${state.name}`}
                                            onClick={() => onDelete?.(state.id)}
                                            disabled={deletingId === state.id}
                                        >
                                            <Trash2 className="text-destructive" />
                                        </Button>
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