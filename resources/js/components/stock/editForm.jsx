import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function EditForm({ form, onChange, onSubmit, onCancel, isSubmitting, errors = {} }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Stock</CardTitle>
                <CardDescription>Update product, stock count, warehouse, cartoon, and barcode.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="product_id">Product ID</Label>
                            <Input
                                id="product_id"
                                name="product_id"
                                type="number"
                                min="1"
                                value={form.product_id}
                                onChange={onChange}
                                placeholder="e.g. 1"
                            />
                            {errors.product_id && <p className="text-xs text-destructive">{errors.product_id[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stocks">Stocks</Label>
                            <Input
                                id="stocks"
                                name="stocks"
                                type="number"
                                min="0"
                                value={form.stocks}
                                onChange={onChange}
                                placeholder="e.g. 120"
                            />
                            {errors.stocks && <p className="text-xs text-destructive">{errors.stocks[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="warehouse_id">Warehouse ID</Label>
                            <Input
                                id="warehouse_id"
                                name="warehouse_id"
                                type="number"
                                min="1"
                                value={form.warehouse_id}
                                onChange={onChange}
                                placeholder="e.g. 1"
                            />
                            {errors.warehouse_id && <p className="text-xs text-destructive">{errors.warehouse_id[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cartoon_id">Cartoon ID</Label>
                            <Input
                                id="cartoon_id"
                                name="cartoon_id"
                                type="number"
                                min="1"
                                value={form.cartoon_id}
                                onChange={onChange}
                                placeholder="e.g. 1"
                            />
                            {errors.cartoon_id && <p className="text-xs text-destructive">{errors.cartoon_id[0]}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="barcode">Barcode</Label>
                            <Input
                                id="barcode"
                                name="barcode"
                                value={form.barcode}
                                onChange={onChange}
                                placeholder="Scan or type barcode"
                            />
                            {errors.barcode && <p className="text-xs text-destructive">{errors.barcode[0]}</p>}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Stock'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}