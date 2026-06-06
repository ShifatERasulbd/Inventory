import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { stripHtmlTags } from './utils/productUtils';

export default function ProductRepeaterSelect({
    id,
    label,
    values = [''],
    options = [],
    placeholder,
    error,
    onValueChange,
    onAdd,
    onRemove,
    valueKey = 'id',
    labelKey = 'name',
}) {
    const resolved = values?.length ? values : [''];

    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <Label>{label}</Label>

                <Button type="button" size="sm" variant="outline" onClick={onAdd}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                </Button>
            </div>

            {resolved.map((value, index) => (
                <div key={index} className="flex gap-2 items-center">
                    <Select
                        value={value ? String(value) : ''}
                        onValueChange={(val) => onValueChange(index, val)}
                    >
                        <SelectTrigger>
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

                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        disabled={resolved.length === 1}
                        onClick={() => onRemove(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}