import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductSelect from '../ProductSelect';

export default function ProductBasicInfo({ form, onChange, onSelectChange, errors, styles = [] }) {
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                    id="product-name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="e.g. Classic T-Shirt"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <ProductSelect
                        id="product-style-number"
                        label="Style"
                        value={form.style_number}
                        options={styles}
                        placeholder="Select a style"
                        error={errors.style_number}
                        onValueChange={(value) => onSelectChange?.('style_number', value)}
                        valueKey="name"
                        labelKey="name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="product-ref-number">Ref Number</Label>
                    <Input
                        id="product-ref-number"
                        value={form.ref_number}
                        readOnly
                        className="bg-muted/70"
                        placeholder="Auto from selected fabric"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="product-hs-number">HS Code</Label>
                    <Input
                        id="product-hs-number"
                        name="hs_number"
                        value={form.hs_number}
                        onChange={onChange}
                        placeholder="e.g. 6203.42"
                    />
                    {errors.hs_number && <p className="text-xs text-destructive">{errors.hs_number[0]}</p>}
                </div>
            </div>
        </div>
    );
}