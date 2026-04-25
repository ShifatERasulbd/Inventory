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

export default function UserTable({
    users = [],
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
                Add User
            </Button>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">SL No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                Loading users...
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No users found.
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        users.map((user, index) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email || '-'}</TableCell>
                                <TableCell>{user.warehouse?.name || '-'}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${user.name}`}
                                            onClick={() => onEdit?.(user.id)}
                                        >
                                            <Pencil />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Delete ${user.name}`}
                                            onClick={() => onRequestDelete?.(user)}
                                            disabled={deletingId === user.id}
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