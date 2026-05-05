import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Separator } from '@/components/ui/separator';

export default function EditForm({ form, onChange, onCompositionChange, onSubmit, onCancel, isSubmitting, errors = {} }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Fabric</CardTitle>
                <CardDescription>Update fabric information and save your changes.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fabric-name">Fabric Name</Label>
                            <Input
                                id="fabric-name"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                placeholder="e.g. Cotton Woven"
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fabric-type">Fabric Type</Label>
                            <Input
                                id="fabric-type"
                                name="type"
                                value={form.type}
                                onChange={onChange}
                                placeholder="e.g. Woven"
                            />
                            {errors.type && <p className="text-xs text-destructive">{errors.type[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fabric-composition">Composition</Label>
                            <RichTextEditor
                                value={form.composition}
                                onChange={onCompositionChange}
                               
                            />
                            {errors.composition && <p className="text-xs text-destructive">{errors.composition[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fabric-construction">Construction</Label>
                            <Input
                                id="fabric-construction"
                                name="construction"
                                value={form.construction}
                                onChange={onChange}
                                placeholder="e.g. 40x40 / 133x100"
                            />
                            {errors.construction && <p className="text-xs text-destructive">{errors.construction[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fabric-ref-number">Ref Number</Label>
                            <Input
                                id="fabric-ref-number"
                                name="ref_number"
                                value={form.ref_number}
                                onChange={onChange}
                                placeholder="e.g. FAB-0001"
                            />
                            {errors.ref_number && <p className="text-xs text-destructive">{errors.ref_number[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fabric-gsm">GSM</Label>
                            <Input
                                id="fabric-gsm"
                                name="gsm"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.gsm}
                                onChange={onChange}
                                placeholder="e.g. 180"
                            />
                            {errors.gsm && <p className="text-xs text-destructive">{errors.gsm[0]}</p>}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Fabric'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}