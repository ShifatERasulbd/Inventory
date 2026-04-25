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

export default function WarehouseTable({
    warehouses = [],
    onAdd,
    onEdit,
    onRequestDelete,
    deletingId,
    isLoading,
}) {
    return (
        <>
        <div className="flex justify-end">
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

                    {!isLoading &&
                        warehouses.map((warehouse, index) => (
                            <TableRow key={warehouse.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{warehouse.name}</TableCell>
                                <TableCell>{warehouse.country?.name || '-'}</TableCell>
                                <TableCell>{warehouse.state?.name || '-'}</TableCell>
                                <TableCell>{warehouse.fulladress}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${warehouse.name}`}
                                            onClick={() => onEdit?.(warehouse.id)}
                                        >
                                            <Pencil />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Delete ${warehouse.name}`}
                                            onClick={() => onRequestDelete?.(warehouse)}
                                            disabled={deletingId === warehouse.id}
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