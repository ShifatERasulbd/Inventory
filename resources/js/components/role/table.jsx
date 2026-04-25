import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Plus, Trash2 } from 'lucide-react';

export function RoleTable({ roles = [], onAdd, onEdit, onRequestDelete, isDeleting = false }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Manage system roles and their permissions.</CardDescription>
        </div>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">No roles found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {(role.permissions || []).length > 0 ? (
                        (role.permissions || []).map((permission) => (
                          <span key={permission.id} className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                            {permission.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No permissions</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(role.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRequestDelete(role)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
