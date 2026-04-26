import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditRackRowForm({ form, onChange, onSubmit, isSubmitting, onCancel, errors, requestError, isLoading }) {
    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    Loading...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Rack Row</CardTitle>
            </CardHeader>
            <CardContent>
                {requestError && (
                    <p className="mb-4 text-sm text-destructive">{requestError}</p>
                )}
                <form onSubmit={onSubmit} noValidate className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="row_number">Row Number</Label>
                        <Input
                            id="row_number"
                            name="row_number"
                            value={form.row_number}
                            onChange={onChange}
                            placeholder="e.g. 1, A, R1"
                        />
                        {errors.row_number && (
                            <p className="text-sm text-destructive">{errors.row_number[0]}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="code">Code</Label>
                        <Input
                            id="code"
                            name="code"
                            value={form.code}
                            onChange={onChange}
                            placeholder="e.g. RACK-A-R1"
                        />
                        {errors.code && (
                            <p className="text-sm text-destructive">{errors.code[0]}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Row'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
