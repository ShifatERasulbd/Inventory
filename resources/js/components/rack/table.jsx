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

export default function RackTable({ data = [], isLoading, onAdd, onEdit, onRequestDelete }){
    return (
        <>
        <div className="flex justify-end">
            <Button className="gap-2" onClick={onAdd}>
                <Plus/>
                Add Rack
            </Button>
        </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">SL No</TableHead>
                            <TableHead>Warehouse</TableHead>
                            <TableHead>Rack Name/Number</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan="4" className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan="4" className="text-center py-8 text-muted-foreground">
                                    No racks found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((rack, index) => (
                                <TableRow key={rack.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{rack.warehouse?.name || 'N/A'}</TableCell>
                                    <TableCell>{rack.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(rack.id)}
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onRequestDelete(rack.id)}
                                            >
                                                <Trash2 className="text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </>
    )
}