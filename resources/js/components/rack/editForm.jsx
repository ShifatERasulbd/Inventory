import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';  

export default function EditForm({
    form = {},
    onWarehouseChange,
    warehouses = [],
    onChange,
    onSubmit,
    errors = {},
    isSubmitting,
    onCancel,
    requestError
}){
    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>Edit Rack</CardTitle>
                <CardDescription>Update the Rack details and save.</CardDescription>
            </CardHeader>
        
            <Separator/>
            <form onSubmit={onSubmit}>
                <CardContent>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="rack-name">Rack Name/Number</Label>
                            <Input
                                id="rack-name"
                                name="name"
                                value={form.name || ''}
                                onChange={onChange}
                                placeholder="e.g. Rack Name/Number"
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                        </div>

                        {/* Warehouses */}
                        <div className="space-y-3">
                            <Label htmlFor="rack-warehouse">Assign Warehouse <span className="text-destructive">*</span></Label>
                            {warehouses.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No warehouses available.</p>
                            ) : (
                                <Select
                                    value={form.warehouse_id ? String(form.warehouse_id) : ''}
                                    onValueChange={onWarehouseChange}
                                >
                                    <SelectTrigger id="rack-warehouse" className="w-full">
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
                            )}
                            {errors.warehouse_id && <p className="text-xs text-destructive">{errors.warehouse_id[0]}</p>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Rack'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
        </>
    )
}
