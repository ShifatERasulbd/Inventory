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

export function CountryTable({ countries = [], onAdd, onEdit, onRequestDelete, deletingId, isLoading }) {
    return (
        <>
        <div className="flex justify-end">
            <Button className="gap-2" onClick={onAdd}>
                <Plus />
                Add Country
            </Button>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">SL No.</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead className="w-[160px]">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                Loading countries...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && countries.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No countries found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        countries.map((country, index) => (
                            <TableRow key={country.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{country.name}</TableCell>
                                <TableCell>{country.code}</TableCell>
                                <TableCell>{country.currency_code}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${country.name}`}
                                            onClick={() => onEdit(country.id)}
                                        >
                                            <Pencil />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Delete ${country.name}`}
                                            onClick={() => onRequestDelete(country)}
                                            disabled={deletingId === country.id}
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