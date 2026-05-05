import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function EditForm({ form, onChange, onSelectChange, onSubmit, onCancel, isSubmitting, errors = {} }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Supplier</CardTitle>
                <CardDescription>Update supplier information and save your changes.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="supplier-name">Name</Label>
                            <Input
                                id="supplier-name"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                placeholder="e.g. John Doe"
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supplier-company">Company Name</Label>
                            <Input
                                id="supplier-company"
                                name="company_name"
                                value={form.company_name}
                                onChange={onChange}
                                placeholder="e.g. Acme Textiles Ltd."
                            />
                            {errors.company_name && <p className="text-xs text-destructive">{errors.company_name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supplier-phone">Phone</Label>
                            <Input
                                id="supplier-phone"
                                name="phone"
                                value={form.phone}
                                onChange={onChange}
                                placeholder="e.g. +8801700000000"
                            />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supplier-email">Email</Label>
                            <Input
                                id="supplier-email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={onChange}
                                placeholder="e.g. supplier@example.com"
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supplier-contact">Contact Person</Label>
                            <Input
                                id="supplier-contact"
                                name="contact_person"
                                value={form.contact_person}
                                onChange={onChange}
                                placeholder="e.g. Jane Smith"
                            />
                            {errors.contact_person && <p className="text-xs text-destructive">{errors.contact_person[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supplier-trade-license">Trade License</Label>
                            <Input
                                id="supplier-trade-license"
                                name="trade_license"
                                value={form.trade_license}
                                onChange={onChange}
                                placeholder="e.g. TL-123456"
                            />
                            {errors.trade_license && <p className="text-xs text-destructive">{errors.trade_license[0]}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="supplier-address">Address</Label>
                            <Input
                                id="supplier-address"
                                name="address"
                                value={form.address}
                                onChange={onChange}
                                placeholder="e.g. 123 Main Street, Dhaka"
                            />
                            {errors.address && <p className="text-xs text-destructive">{errors.address[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supplier-status">Status</Label>
                            <Select value={form.status} onValueChange={(value) => onSelectChange('status', value)}>
                                <SelectTrigger id="supplier-status" className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-xs text-destructive">{errors.status[0]}</p>}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Supplier'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
