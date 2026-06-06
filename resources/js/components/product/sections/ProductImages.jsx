import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useImagePreview from '../hooks/useImagePreview';

export default function ProductImages({
    form,
    onFileChange,
}) {
    const coverPreview = useImagePreview(form.cover_image);
    const galleryCount = Array.isArray(form.gallery_images) ? form.gallery_images.length : 0;

    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="product-cover-image">Cover Image</Label>
                <p className="text-xs text-muted-foreground">Max 3 MB</p>
                <Input
                    id="product-cover-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFileChange('cover_image', e.target.files?.[0] || null)}
                />

                {coverPreview && (
                    <img src={coverPreview} alt="Cover preview" className="mt-2 h-20 w-20 rounded-md border object-cover" />
                )}

                {form.cover_image && (
                    <p className="text-xs text-muted-foreground">Selected: {form.cover_image.name}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="product-gallery-images">Gallery Images</Label>
                <p className="text-xs text-muted-foreground">Up to 8 images, 3 MB each, total 7 MB</p>
                <Input
                    id="product-gallery-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => onFileChange('gallery_images', Array.from(e.target.files || []))}
                />

                {galleryCount > 0 && (
                    <p className="text-xs text-muted-foreground">Selected {galleryCount} image(s)</p>
                )}
            </div>
        </div>
    );
}