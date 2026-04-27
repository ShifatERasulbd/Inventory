import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { useEffect, useMemo } from 'react';

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

export default function AddForm({
    form,
    brands = [],
    colors = [],
    fabrics = [],
    sizes = [],
    productFors = [],
    warehouses = [],
    onChange,
    onSelectChange,
    onFileChange,
    onSubmit,
    onCancel,
    isSubmitting,
    errors = {},
    currentCoverImageUrl = '',
    currentGalleryImageUrls = [],
    onRemoveCurrentCover,
    onRemoveCurrentGallery,
    title = 'Create Product',
    description = 'Fill in the product details and save to create a new record.',
    submitLabel = 'Create Product',
    submittingLabel = 'Creating...',
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
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
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

                     <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
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
                            id="product-color"
                            label="Color"
                            value={form.color_id}
                            options={colors}
                            placeholder="Select a color"
                            error={errors.color_id}
                            onValueChange={(value) => onSelectChange('color_id', value)}
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
                            id="product-size"
                            label="Size"
                            value={form.size_id}
                            options={sizes}
                            placeholder="Select a size"
                            error={errors.size_id}
                            onValueChange={(value) => onSelectChange('size_id', value)}
                            labelKey="size"
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
                     </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      

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
                            <Label htmlFor="product-barcode">Barcode</Label>
                            <Input
                                id="product-barcode"
                                name="barCode"
                                value={form.barCode}
                                onChange={onChange}
                                placeholder="e.g. 1234567890123"
                            />
                            {errors.barCode && <p className="text-xs text-destructive">{errors.barCode[0]}</p>}
                        </div>

                       


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
                        {isSubmitting ? submittingLabel : submitLabel}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
