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

export function ProductsForTable({ productsFor = [], onAdd, onEdit, onRequestDelete, deletingId, isLoading }) {
    return (
        <>
        <div className="flex justify-end">
            <Button className="gap-2" onClick={onAdd}>
                <Plus />
                Add Products For
            </Button>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">SL No.</TableHead>
                        <TableHead>Products For</TableHead>
                        <TableHead>Age Limit</TableHead>
                        <TableHead className="w-[160px]">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                Loading Products For...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && productsFor.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No Products For found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        productsFor.map((p, index) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.age_limit}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${p.name}`}
                                            onClick={() => onEdit(p.id)}
                                        >
                                            <Pencil />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Delete ${p.name}`}
                                            onClick={() => onRequestDelete(p)}
                                            disabled={deletingId === p.id}
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
    );
}