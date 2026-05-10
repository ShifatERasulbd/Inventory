import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import BarcodePreview from './BarcodePreview';

function ProductSelect({ id, label, value, options = [], placeholder, error, onValueChange, valueKey = 'id', labelKey = 'name' }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            {options.length === 0 ? (
                <p className="text-sm text-muted-foreground">No options available.</p>
            ) : (
                <Select value={value ? String(value) : ''} onValueChange={onValueChange}>
                    <SelectTrigger id={id} className="w-full">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option[valueKey]} value={String(option[valueKey])}>
                                {option[labelKey]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            {error && <p className="text-xs text-destructive">{error[0]}</p>}
        </div>
    );
}

function ProductRepeaterSelect({
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
    const resolvedValues = Array.isArray(values) && values.length > 0 ? values : [''];
    const topError = Array.isArray(error) && typeof error[0] === 'string' ? error[0] : '';

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>{label}</Label>
                <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                </Button>
            </div>

            {options.length === 0 ? (
                <p className="text-sm text-muted-foreground">No options available.</p>
            ) : (
                <div className="space-y-2">
                    {resolvedValues.map((value, index) => {
                        const rowError = Array.isArray(error?.[index]) ? error[index][0] : '';

                        return (
                            <div key={`${id}-${index}`} className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={value ? String(value) : ''}
                                        onValueChange={(selectedValue) => onValueChange(index, selectedValue)}
                                    >
                                        <SelectTrigger id={`${id}-${index}`} className="w-full">
                                            <SelectValue placeholder={placeholder} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {options.map((option) => (
                                                <SelectItem key={option[valueKey]} value={String(option[valueKey])}>
                                                    {option[labelKey]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        onClick={() => onRemove(index)}
                                        disabled={resolvedValues.length === 1}
                                        aria-label={`Remove ${label} row ${index + 1}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                {rowError && <p className="text-xs text-destructive">{rowError}</p>}
                            </div>
                        );
                    })}
                </div>
            )}

            {topError && <p className="text-xs text-destructive">{topError}</p>}
        </div>
    );
}

export default function EditForm({
    form,
    brands = [],
    colors = [],
    fabrics = [],
    sizes = [],
    productFors = [],
    warehouses = [],
    seasons = [],
    onChange,
    onSelectChange,
    onRepeaterSelectChange,
    onAddRepeaterItem,
    onRemoveRepeaterItem,
    onFileChange,
    onSubmit,
    onCancel,
    isSubmitting,
    errors = {},
    currentCoverImageUrl = '',
    currentGalleryImageUrls = [],
    onRemoveCurrentCover,
    onRemoveCurrentGallery,
    barcodes = {},
}) {
    const selectedCoverPreviewUrl = useMemo(() => {
        if (!form?.cover_image) {
            return '';
        }

        return URL.createObjectURL(form.cover_image);
    }, [form?.cover_image]);

    const selectedGalleryPreviewUrls = useMemo(() => {
        if (!Array.isArray(form?.gallery_images) || form.gallery_images.length === 0) {
            return [];
        }

        return form.gallery_images.map((file) => URL.createObjectURL(file));
    }, [form?.gallery_images]);

    useEffect(() => {
        return () => {
            if (selectedCoverPreviewUrl) {
                URL.revokeObjectURL(selectedCoverPreviewUrl);
            }

            selectedGalleryPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [selectedCoverPreviewUrl, selectedGalleryPreviewUrls]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Product</CardTitle>
                <CardDescription>Update the product details and save your changes.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
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
                    </div>

                     <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
                          <ProductSelect
                            id="product-brand"
                            label="Brand"
                            value={form.brand_id}
                            options={brands}
                            placeholder="Select a brand"
                            error={errors.brand_id}
                            onValueChange={(value) => onSelectChange('brand_id', value)}
                        />
                         <ProductSelect
                            id="product-fabric"
                            label="Fabric"
                            value={form.fabric_id}
                            options={fabrics}
                            placeholder="Select a fabric"
                            error={errors.fabric_id}
                            onValueChange={(value) => onSelectChange('fabric_id', value)}
                        />

                        <ProductSelect
                            id="product-for"
                            label="Product For"
                            value={form.gender_id}
                            options={productFors}
                            placeholder="Select product for"
                            error={errors.gender_id}
                            onValueChange={(value) => onSelectChange('gender_id', value)}
                        />

                        <ProductSelect
                            id="product-warehouse"
                            label="Warehouse"
                            value={form.warehouse_id}
                            options={warehouses}
                            placeholder="Select a warehouse"
                            error={errors.warehouse_id}
                            onValueChange={(value) => onSelectChange('warehouse_id', value)}
                        />

                        <ProductSelect
                            id="product-season"
                            label="Season"
                            value={form.season_id}
                            options={seasons}
                            placeholder="Select a season"
                            error={errors.season_id}
                            onValueChange={(value) => onSelectChange('season_id', value)}
                        />
                     </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <ProductRepeaterSelect
                            id="product-color"
                            label="Colors"
                            values={form.color_ids}
                            options={colors}
                            placeholder="Select a color"
                            error={errors.color_ids}
                            onValueChange={(index, value) => onRepeaterSelectChange?.('color_ids', index, value)}
                            onAdd={() => onAddRepeaterItem?.('color_ids')}
                            onRemove={(index) => onRemoveRepeaterItem?.('color_ids', index)}
                        />

                        <ProductRepeaterSelect
                            id="product-size"
                            label="Sizes"
                            values={form.size_ids}
                            options={sizes}
                            placeholder="Select a size"
                            error={errors.size_ids}
                            onValueChange={(index, value) => onRepeaterSelectChange?.('size_ids', index, value)}
                            onAdd={() => onAddRepeaterItem?.('size_ids')}
                            onRemove={(index) => onRemoveRepeaterItem?.('size_ids', index)}
                            labelKey="size"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">


                        <div className="space-y-2">
                            <Label htmlFor="product-style-number">Style Number</Label>
                            <Input
                                id="product-style-number"
                                name="style_number"
                                value={form.style_number}
                                onChange={onChange}
                                placeholder="e.g. ST-1001"
                            />
                            {errors.style_number && <p className="text-xs text-destructive">{errors.style_number[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-ref-number">Ref Number</Label>
                            <Input
                                id="product-ref-number"
                                name="ref_number"
                                value={form.ref_number}
                                onChange={onChange}
                                placeholder="e.g. REF-0001"
                            />
                            {errors.ref_number && <p className="text-xs text-destructive">{errors.ref_number[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-hs-number">HS Number</Label>
                            <Input
                                id="product-hs-number"
                                name="hs_number"
                                value={form.hs_number || ''}
                                onChange={onChange}
                                placeholder="e.g. 6203.42"
                            />
                            {errors.hs_number && <p className="text-xs text-destructive">{errors.hs_number[0]}</p>}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Generated Barcodes</Label>
                        <BarcodePreview
                            styleNumber={form.style_number}
                            colorIds={form.color_ids}
                            fabricId={form.fabric_id}
                            refNumber={form.ref_number}
                            sizeIds={form.size_ids}
                            colors={colors}
                            fabrics={fabrics}
                            sizes={sizes}
                        />
                        {errors.barcodes && <p className="text-xs text-destructive">{errors.barcodes[0]}</p>}
                    </div>




                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div className="space-y-2">
                            <Label htmlFor="product-cover-image">Cover Image</Label>
                            <p className="text-xs text-muted-foreground">Max 3 MB</p>
                            <Input
                                id="product-cover-image"
                                type="file"
                                accept="image/*"
                                onChange={(event) => onFileChange?.('cover_image', event.target.files?.[0] || null)}
                            />
                            {form.cover_image && <p className="text-xs text-muted-foreground">Selected: {form.cover_image.name}</p>}
                            {selectedCoverPreviewUrl && (
                                <img
                                    src={selectedCoverPreviewUrl}
                                    alt="Selected cover preview"
                                    className="h-20 w-20 rounded-md border object-cover"
                                />
                            )}
                            {!form.cover_image && currentCoverImageUrl && (
                                <div className="relative inline-block">
                                    <img
                                        src={currentCoverImageUrl}
                                        alt="Current product cover"
                                        className="h-20 w-20 rounded-md border object-cover"
                                    />
                                    {onRemoveCurrentCover && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="absolute -right-2 -top-2 h-5 w-5"
                                            onClick={onRemoveCurrentCover}
                                            aria-label="Remove current cover image"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            )}
                            {errors.cover_image && <p className="text-xs text-destructive">{errors.cover_image[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-gallery-images">Gallery Images</Label>
                            <p className="text-xs text-muted-foreground">Up to 8 images, 3 MB each, total 7 MB</p>
                            <Input
                                id="product-gallery-images"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(event) => onFileChange?.('gallery_images', Array.from(event.target.files || []))}
                            />
                            {Array.isArray(form.gallery_images) && form.gallery_images.length > 0 && (
                                <p className="text-xs text-muted-foreground">Selected {form.gallery_images.length} image(s)</p>
                            )}
                            {selectedGalleryPreviewUrls.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedGalleryPreviewUrls.map((url, index) => (
                                        <img
                                            key={`${url}-${index}`}
                                            src={url}
                                            alt={`Selected gallery preview ${index + 1}`}
                                            className="h-16 w-16 rounded-md border object-cover"
                                        />
                                    ))}
                                </div>
                            )}
                            {Array.isArray(currentGalleryImageUrls) && currentGalleryImageUrls.length > 0 && form.gallery_images.length === 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {currentGalleryImageUrls.map((url) => (
                                        <div key={url} className="relative inline-block">
                                            <img
                                                src={url}
                                                alt="Current product gallery"
                                                className="h-16 w-16 rounded-md border object-cover"
                                            />
                                            {onRemoveCurrentGallery && (
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute -right-2 -top-2 h-5 w-5"
                                                    onClick={() => onRemoveCurrentGallery(url)}
                                                    aria-label="Remove current gallery image"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.gallery_images && <p className="text-xs text-destructive">{errors.gallery_images[0]}</p>}
                        </div>


                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="product-description">Description</Label>
                            <textarea
                                id="product-description"
                                name="description"
                                value={form.description}
                                onChange={onChange}
                                placeholder="Write a short product description"
                                rows={4}
                                className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                            {errors.description && <p className="text-xs text-destructive">{errors.description[0]}</p>}
                        </div>
                    </div>

                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Product'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
