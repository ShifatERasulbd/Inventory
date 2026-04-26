import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function AddForm({ form, onChange, onSubmit, onCancel, isSubmitting, errors = {} }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Products For</CardTitle>
                <CardDescription>Fill in the products-for details and save to create a new record.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="productsfor-name">Products For Name</Label>
                            <Input
                                id="productsfor-name"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                placeholder="e.g. Adults"
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="productsfor-age-limit">Age Limit</Label>
                            <Input
                                id="productsfor-age-limit"
                                name="age_limit"
                                value={form.age_limit}
                                onChange={onChange}
                                placeholder="e.g. 18+"
                            />
                            {errors.age_limit && <p className="text-xs text-destructive">{errors.age_limit[0]}</p>}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Products For'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
