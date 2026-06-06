import { Label } from '@/components/ui/label';

export default function ProductDescription({ form, onChange, errors }) {
    return (
        <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <textarea
                id="product-description"
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
                placeholder="Write a short product description"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {errors.description && (
                <p className="text-xs text-destructive">{errors.description[0]}</p>
            )}
        </div>
    );
}