import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';  

export default function AddForm({ form, onChange, onSubmit, onCancel, isSubmitting, errors = {} }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Country</CardTitle>
                <CardDescription>Fill in the country details and save to create a new record.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="country-name">Country Name</Label>
                            <Input
                                id="country-name"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                placeholder="e.g. Bangladesh"
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country-code">Country Code</Label>
                            <Input
                                id="country-code"
                                name="code"
                                value={form.code}
                                onChange={onChange}
                                placeholder="e.g. BD"
                            />
                            {errors.code && <p className="text-xs text-destructive">{errors.code[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency-code">Currency Code</Label>
                            <Input
                                id="currency-code"
                                name="currency_code"
                                value={form.currency_code}
                                onChange={onChange}
                                placeholder="e.g. BDT"
                            />
                            {errors.currency_code && <p className="text-xs text-destructive">{errors.currency_code[0]}</p>}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Country'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}