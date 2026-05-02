import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const STATUS_OPTIONS = ['pending', 'approved', 'received', 'cancelled'];

export default function AddPurchaseForm({
    form,
    onChange,
    onSelectChange,
    onSubmit,
    onCancel,
    isSubmitting,
    errors = {},
    warehouses = [],
    products = [],
    isSuperAdmin = false,
    purchaseToLabel,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Purchase</CardTitle>
                <CardDescription>Add purchase details for the selected warehouse and product.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="purchase_form">Purchase From</Label>
                            <Select value={form.purchase_form} onValueChange={(value) => onSelectChange('purchase_form', value)}>
                                <SelectTrigger id="purchase_form" className="w-full">
                                    <SelectValue placeholder="Select warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                            {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.purchase_form && <p className="text-xs text-destructive">{errors.purchase_form[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purchase_to">Purchase To {isSuperAdmin ? '' : '(Login Warehouse)'}</Label>
                            {isSuperAdmin ? (
                                <>
                                    <Select value={form.purchase_to} onValueChange={(value) => onSelectChange('purchase_to', value)}>
                                        <SelectTrigger id="purchase_to" className="w-full">
                                            <SelectValue placeholder="Select warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                                    {warehouse.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.purchase_to && <p className="text-xs text-destructive">{errors.purchase_to[0]}</p>}
                                </>
                            ) : (
                                <Input value={purchaseToLabel} disabled />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product_id">Product</Label>
                            <Select value={form.product_id} onValueChange={(value) => onSelectChange('product_id', value)}>
                                <SelectTrigger id="product_id" className="w-full">
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={String(product.id)}>
                                            {product.name || `Product #${product.id}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.product_id && <p className="text-xs text-destructive">{errors.product_id[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="1"
                                value={form.quantity}
                                onChange={onChange}
                                placeholder="e.g. 100"
                            />
                            {errors.quantity && <p className="text-xs text-destructive">{errors.quantity[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="po_number">PO Number</Label>
                            <Input
                                id="po_number"
                                name="po_number"
                                value={form.po_number}
                                onChange={onChange}
                                placeholder="e.g. PO-2026-001"
                            />
                            {errors.po_number && <p className="text-xs text-destructive">{errors.po_number[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={form.status} onValueChange={(value) => onSelectChange('status', value)}>
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-xs text-destructive">{errors.status[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purchase_price">Purchase Price</Label>
                            <Input
                                id="purchase_price"
                                name="purchase_price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.purchase_price}
                                onChange={onChange}
                                placeholder="e.g. 350.00"
                            />
                            {errors.purchase_price && <p className="text-xs text-destructive">{errors.purchase_price[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="selling_price">Selling Price</Label>
                            <Input
                                id="selling_price"
                                name="selling_price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.selling_price}
                                onChange={onChange}
                                placeholder="e.g. 420.00"
                            />
                            {errors.selling_price && <p className="text-xs text-destructive">{errors.selling_price[0]}</p>}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Purchase'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
