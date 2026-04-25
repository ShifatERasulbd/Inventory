import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function EditForm({ form, onChange, onCountryChange, onSubmit, onCancel, isSubmitting, errors = {}, countries = [] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit State</CardTitle>
                <CardDescription>Update state details and save your changes.</CardDescription>
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
                            <Label htmlFor="state-name">State Name</Label>
                            <Input
                                id="state-name"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                placeholder="e.g. Dhaka"
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update State'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
