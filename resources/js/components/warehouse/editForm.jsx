import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function EditForm({
    form = {},
    onChange,
    onCountryChange,
    onStateChange,
    onStateOpenChange,
    onSubmit,
    onCancel,
    countries = [],
    states = [],
    isSubmitting = false,
    errors = {},
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Warehouse</CardTitle>
                <CardDescription>Update warehouse details and save your changes.</CardDescription>
            </CardHeader>
            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="country-select">Country</Label>
                            <Select value={form.country_id} onValueChange={onCountryChange}>
                                <SelectTrigger id="country-select" className="w-full">
                                    <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country.id} value={String(country.id)}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.country_id && <p className="text-xs text-destructive">{errors.country_id[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state-select">State</Label>
                            <Select
                                value={form.state_id || ''}
                                onValueChange={onStateChange}
                                onOpenChange={onStateOpenChange}
                            >
                                <SelectTrigger id="state-select" className="w-full">
                                    <SelectValue placeholder="Select a state" />
                                </SelectTrigger>
                                <SelectContent>
                                    {states.map((state) => (
                                        <SelectItem key={state.id} value={String(state.id)}>
                                            {state.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.state_id && <p className="text-xs text-destructive">{errors.state_id[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="warehouse-name">Warehouse Name</Label>
                            <Input
                                id="warehouse-name"
                                name="name"
                                value={form.name || ''}
                                onChange={onChange}
                                placeholder="e.g. Main Warehouse"
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
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
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Warehouse'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
