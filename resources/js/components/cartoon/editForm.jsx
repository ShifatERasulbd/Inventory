import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function EditForm({ form, onChange, onPurchaseChange, purchases = [], onSubmit, onCancel, isSubmitting, errors = {}, racks = [], rackRows = [], onRackChange, onRackRowChange, warehouses = [], isSuperAdmin = false, warehouseLabel = '', onWarehouseChange }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Cartoon</CardTitle>
                <CardDescription>Update Cartoon information and save your changes.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="cartoon_number">Cartoon Number</Label>
                            <Input
                                id="cartoon_number"
                                name="cartoon_number"
                                value={form.cartoon_number}
                                onChange={onChange}
                                placeholder="e.g. Cartoon Number"
                                required
                            />
                            {errors.cartoon_number && <p className="text-xs text-destructive">{errors.cartoon_number[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="p_o_number">Purchase Order Number</Label>
                            <Select value={String(form.p_o_number ?? '')} onValueChange={onPurchaseChange}>
                                <SelectTrigger id="p_o_number" className="w-full">
                                    <SelectValue placeholder="Select a Purchase Order" />
                                </SelectTrigger>
                                <SelectContent>
                                    {purchases.map((purchase) => (
                                        <SelectItem key={purchase.id} value={String(purchase.id)}>
                                            {purchase.po_number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.p_o_number && <p className="text-xs text-destructive">{errors.p_o_number[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="warehouse_id">Warehouse {isSuperAdmin ? '' : '(Login Warehouse)'}</Label>
                            {isSuperAdmin ? (
                                <>
                                    <Select value={String(form.warehouse_id ?? '')} onValueChange={onWarehouseChange}>
                                        <SelectTrigger id="warehouse_id" className="w-full">
                                            <SelectValue placeholder="Select a Warehouse" />
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
                                </>
                            ) : (
                                <Input value={warehouseLabel} disabled />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rack_id">Rack</Label>
                            <Select value={String(form.rack_id ?? '')} onValueChange={onRackChange}>
                                <SelectTrigger id="rack_id" className="w-full">
                                    <SelectValue placeholder="Select a Rack" />
                                </SelectTrigger>
                                <SelectContent>
                                    {racks.map((rack) => (
                                        <SelectItem key={rack.id} value={String(rack.id)}>
                                            {rack.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.rack_id && <p className="text-xs text-destructive">{errors.rack_id[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rack_row_id">Rack Row</Label>
                            <Select value={String(form.rack_row_id ?? '')} onValueChange={onRackRowChange} disabled={!form.rack_id}>
                                <SelectTrigger id="rack_row_id" className="w-full">
                                    <SelectValue placeholder={form.rack_id ? "Select a Rack Row" : "Select a Rack first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {rackRows.map((rackRow) => (
                                        <SelectItem key={rackRow.id} value={String(rackRow.id)}>
                                            Row {rackRow.row_number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.rack_row_id && <p className="text-xs text-destructive">{errors.rack_row_id[0]}</p>}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Cartoon'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}