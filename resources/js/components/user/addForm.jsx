import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';  

export default function AddForm({
    form = {},
    onChange,
    onWarehouseChange,
    onSubmit,
    onCancel,
    warehouses = [],
    isSubmitting = false,
    errors = {},
    submitLabel = 'Create User',
    submittingLabel = 'Saving...',
}) {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Add User</CardTitle>
                      <CardDescription>Fill in the User details and save to add a new record.</CardDescription>
                </CardHeader>
                <Separator />

                <form onSubmit={onSubmit}>
                    <CardContent className="space-y-6 pt-6">
                       <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="warehouse-select">Warehouse</Label>
                                <Select value={form.warehouse_id} onValueChange={onWarehouseChange}>
                                    <SelectTrigger id="warehouse-select" className="w-full">
                                        <SelectValue placeholder="Select a warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        
                                        {warehouses.map((warehouse) => (
                                            <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                                {warehouse.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.warehouse_id && <p className="text-xs text-destructive">{errors.warehouse_id[0]}</p>}
                            </div>

                         

                            <div className="space-y-2">
                                <Label htmlFor="user-name">User Name</Label>
                                <Input
                                    id="user-name"
                                    name="name"
                                    value={form.name || ''}
                                    onChange={onChange}
                                    placeholder="e.g. User Name"
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user-email">User Email</Label>
                                <Input
                                    id="user-email"
                                    name="email"
                                    value={form.email || ''}
                                    onChange={onChange}
                                    placeholder="e.g. User Email"
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user-password">User Password</Label>
                                <Input
                                    id="user-password"
                                    name="password"
                                    type="password"
                                    value={form.password || ''}
                                    onChange={onChange}
                                    placeholder="e.g. User Password"
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
                                    placeholder="e.g. Confirm Password"
                                />
                                {errors.c_password && <p className="text-xs text-destructive">{errors.c_password[0]}</p>}
                            </div>


                            {/* <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="warehouse-address">Full Address</Label>
                                <textarea
                                    id="warehouse-address"
                                    name="fulladress"
                                    rows={3}
                                    value={form.fulladress || ''}
                                    onChange={onChange}
                                    placeholder="e.g. 12 Industrial Road, Dhaka"
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                                {errors.fulladress && <p className="text-xs text-destructive">{errors.fulladress[0]}</p>}
                            </div> */}
                        </div>
                    </CardContent>

                    <CardFooter className="justify-end gap-2 border-t pt-6">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? submittingLabel : submitLabel}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </>
    )
}