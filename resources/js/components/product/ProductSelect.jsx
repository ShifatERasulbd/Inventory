import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { stripHtmlTags } from './utils/productUtils';

export default function ProductSelect({
    id,
    label,
    value,
    options = [],
    placeholder,
    error,
    onValueChange,
    valueKey = 'id',
    labelKey = 'name',
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>

            {options.length === 0 ? (
                <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">No options available.</p>
            ) : (
                <Select value={value ? String(value) : ''} onValueChange={onValueChange}>
                    <SelectTrigger id={id} className="w-full">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>

                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option[valueKey]} value={String(option[valueKey])}>
                                {stripHtmlTags(option[labelKey])}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {error && <p className="text-xs text-destructive">{error[0]}</p>}
        </div>
    );
}