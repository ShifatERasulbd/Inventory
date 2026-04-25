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

export default function WarehouseTable({ onAdd }){
    return(
        <>
        <div className="flex justify-end">
            <Button className="gap-2" onClick={onAdd}>
                <plus />
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
                    <TableRow>
                        <TableCell className="font-medium">01</TableCell>
                        <TableCell>WareHouse Name</TableCell>
                        <TableCell>Country Name</TableCell>
                        <TableCell>State Name</TableCell>
                        <TableCell>Full Address</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                           
                                        >
                                            <Pencil />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                           
                                        >
                                            <Trash2 className="text-destructive" />
                                        </Button>
                                    </div>
                        </TableCell>
                    </TableRow>
                    
                </TableBody>
            </Table>
        </Card>
        </>
    )
}