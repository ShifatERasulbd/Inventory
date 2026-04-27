import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function EditForm({ form, onChange, onSubmit, onCancel, isSubmitting, errors = {} }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Color</CardTitle>
                <CardDescription>Update color information and save your changes.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="color-name">Color Name</Label>
                            <Input
                                id="color-name"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                placeholder="e.g. Bangladesh"
                                required
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
                        {isSubmitting ? 'Updating...' : 'Update Color'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}