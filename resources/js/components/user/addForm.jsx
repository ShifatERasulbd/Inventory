import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

export default function AddForm({
    form = {},
    onChange,
    onWarehouseToggle,
    onRoleToggle,
    onSubmit,
    onCancel,
    warehouses = [],
    roles = [],
    isSubmitting = false,
    errors = {},
    submitLabel = 'Create User',
    submittingLabel = 'Saving...',
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Details</CardTitle>
                <CardDescription>Fill in the user details and assign warehouses and roles.</CardDescription>
            </CardHeader>
            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    {/* Name & Email & Password */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="user-name">User Name</Label>
                            <Input
                                id="user-name"
                                name="name"
                                value={form.name || ''}
                                onChange={onChange}
                                placeholder="e.g. John Doe"
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-email">Email</Label>
                            <Input
                                id="user-email"
                                name="email"
                                type="email"
                                value={form.email || ''}
                                onChange={onChange}
                                placeholder="e.g. john@example.com"
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-password">Password</Label>
                            <Input
                                id="user-password"
                                name="password"
                                type="password"
                                value={form.password || ''}
                                onChange={onChange}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-xs text-destructive">{errors.password[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                name="c_password"
                                type="password"
                                value={form.c_password || ''}
                                onChange={onChange}
                                placeholder="••••••••"
                            />
                            {errors.c_password && <p className="text-xs text-destructive">{errors.c_password[0]}</p>}
                        </div>
                    </div>

                    {/* Warehouses */}
                    <div className="space-y-3">
                        <Label>Assign Warehouses <span className="text-destructive">*</span></Label>
                        {warehouses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No warehouses available.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {warehouses.map((warehouse) => (
                                    <div key={warehouse.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`warehouse-${warehouse.id}`}
                                            checked={(form.warehouse_ids || []).includes(warehouse.id)}
                                            onCheckedChange={() => onWarehouseToggle(warehouse.id)}
                                        />
                                        <Label htmlFor={`warehouse-${warehouse.id}`} className="font-normal cursor-pointer">
                                            {warehouse.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.warehouse_ids && <p className="text-xs text-destructive">{errors.warehouse_ids[0]}</p>}
                    </div>

                    {/* Roles */}
                    <div className="space-y-3">
                        <Label>Assign Roles</Label>
                        {roles.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No roles available.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={(form.role_ids || []).includes(role.id)}
                                            onCheckedChange={() => onRoleToggle(role.id)}
                                        />
                                        <Label htmlFor={`role-${role.id}`} className="font-normal cursor-pointer">
                                            {role.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.role_ids && <p className="text-xs text-destructive">{errors.role_ids[0]}</p>}
                    </div>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-end gap-3 pt-6">
                    <Button variant="outline" onClick={onCancel} type="button" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? submittingLabel : submitLabel}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}