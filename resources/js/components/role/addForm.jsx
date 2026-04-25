import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

export default function AddForm({
    form = {},
    onChange,
    onPermissionToggle,
    onSubmit,
    onCancel,
    permissions = [],
    isSubmitting = false,
    errors = {},
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Role</CardTitle>
                <CardDescription>Create a new role and assign permissions.</CardDescription>
            </CardHeader>
            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Role Name</Label>
                        <Input
                            id="role-name"
                            name="name"
                            value={form.name || ''}
                            onChange={onChange}
                            placeholder="e.g. Manager"
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                    </div>

                    <div className="space-y-4">
                        <Label>Assign Permissions</Label>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`permission-${permission.id}`}
                                        checked={form.permissions?.includes(permission.id) || false}
                                        onCheckedChange={() => onPermissionToggle(permission.id)}
                                    />
                                    <Label htmlFor={`permission-${permission.id}`} className="font-normal cursor-pointer">
                                        {permission.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {errors.permissions && <p className="text-xs text-destructive">{errors.permissions[0]}</p>}
                    </div>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-end gap-3 pt-6">
                    <Button variant="outline" onClick={onCancel} type="button" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Role'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
