import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function EditForm({ form, onChange, onSubmit, onCancel, isSubmitting, errors = {} }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Shipment</CardTitle>
                <CardDescription>Update shipment information and save your changes.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="shipment-time">Minimum Shipment Time</Label>
                            <Input
                                id="shipment-time"
                                name="shipmentTime"
                                value={form.shipmentTime}
                                onChange={onChange}
                                placeholder="e.g. 10:00 AM"
                                required
                            />
                            {errors.shipmentTime && <p className="text-xs text-destructive">{errors.shipmentTime[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="production-time">Minimum Production Day</Label>
                            <Input
                                id="production-time"
                                name="productionTime"
                                value={form.productionTime}
                                onChange={onChange}
                                placeholder="e.g. 10:00 AM"
                                required
                            />
                            {errors.productionTime && <p className="text-xs text-destructive">{errors.productionTime[0]}</p>}
                        </div>

                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Shipment'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}