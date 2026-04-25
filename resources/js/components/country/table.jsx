import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const countries = [
    {
        id: 1,
        serialNumber: '1',
        name: 'Bangladesh',
    },
];

export function CountryTable() {
    return (
        <>
        <div className="flex justify-end">
            <Button asChild className="gap-2">
                <Link to="/countries/add">
                    <Plus />
                    Add Country
                </Link>
            </Button>
        </div>

        <Card>
            <Table>
              
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">SL No.</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="w-[140px]">Action</TableHead>
                    
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {countries.map((country) => (
                        <TableRow key={country.id}>
                            <TableCell className="font-medium">{country.serialNumber}</TableCell>
                            <TableCell>{country.name}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" aria-label={`Edit ${country.name}`}>
                                        <Pencil />
                                    </Button>
                                    <Button variant="ghost" size="icon" aria-label={`Delete ${country.name}`}>
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