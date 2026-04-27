import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/product/editForm';
import { useAppContext } from '@/context/AppContext';
import { fetchBrands } from '@/pages/Brand/api';
import { fetchColors } from '@/pages/Color/api';
import { fetchFabrics } from '@/pages/Fabric/api';
import { fetchProductsFor } from '@/pages/ProductsFor/api';
import { fetchSizes } from '@/pages/Size/api';
import { fetchWarehouses } from '@/pages/Warehouse/api';

import { fetchProduct, updateProducts } from './api';

const initialForm = {
    brand_id: '',
    style_number: '',
    name: '',
    description: '',
    color_id: '',
    fabric_id: '',
    size_id: '',
    gender_id: '',
    barCode: '',
    warehouse_id: '',
    cover_image: null,
    gallery_images: [],
};

const MAX_SINGLE_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 7 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 8;

function validateForm(form) {
    const validationErrors = {};

    if (!form.brand_id) validationErrors.brand_id = ['Please select a brand.'];
    if (!form.style_number.trim()) validationErrors.style_number = ['Please enter the style number.'];
    if (!form.name.trim()) validationErrors.name = ['Please enter the product name.'];
    if (!form.color_id) validationErrors.color_id = ['Please select a color.'];
    if (!form.fabric_id) validationErrors.fabric_id = ['Please select a fabric.'];
    if (!form.size_id) validationErrors.size_id = ['Please select a size.'];
    if (!form.gender_id) validationErrors.gender_id = ['Please select product for.'];
    if (!form.barCode.trim()) validationErrors.barCode = ['Please enter the barcode.'];
    if (!form.warehouse_id) validationErrors.warehouse_id = ['Please select a warehouse.'];

    if (form.cover_image && form.cover_image.size > MAX_SINGLE_IMAGE_BYTES) {
        validationErrors.cover_image = ['Cover image must be 3 MB or less.'];
    }

    if (Array.isArray(form.gallery_images) && form.gallery_images.length > MAX_GALLERY_IMAGES) {
        validationErrors.gallery_images = [`You can upload up to ${MAX_GALLERY_IMAGES} gallery images.`];
    }

    if (Array.isArray(form.gallery_images) && form.gallery_images.some((file) => file.size > MAX_SINGLE_IMAGE_BYTES)) {
        validationErrors.gallery_images = ['Each gallery image must be 3 MB or less.'];
    }

    const totalUploadBytes = (form.cover_image?.size || 0)
        + (Array.isArray(form.gallery_images)
            ? form.gallery_images.reduce((sum, file) => sum + (file?.size || 0), 0)
            : 0);

    if (totalUploadBytes > MAX_TOTAL_IMAGE_BYTES) {
        validationErrors.gallery_images = ['Total upload size must be 7 MB or less.'];
    }

    return validationErrors;
}

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [brands, setBrands] = useState([]);
    const [colors, setColors] = useState([]);
    const [fabrics, setFabrics] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [productFors, setProductFors] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [currentCoverImageUrl, setCurrentCoverImageUrl] = useState('');
    const [currentGalleryImageUrls, setCurrentGalleryImageUrls] = useState([]);
    const [currentCoverImagePath, setCurrentCoverImagePath] = useState('');
    const [currentGalleryImages, setCurrentGalleryImages] = useState([]);
    const [removeCoverImage, setRemoveCoverImage] = useState(false);
    const [removeGalleryImages, setRemoveGalleryImages] = useState([]);

    useEffect(() => {
        setPageTitle('Edit Product');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadForm() {
            setIsLoading(true);
            setLoadError('');

            try {
                const [product, brandData, colorData, fabricData, sizeData, productForData, warehouseData] = await Promise.all([
                    fetchProduct(id),
                    fetchBrands(),
                    fetchColors(),
                    fetchFabrics(),
                    fetchSizes(),
                    fetchProductsFor(),
                    fetchWarehouses(),
                ]);

                if (ignore) {
                    return;
                }

                setBrands(Array.isArray(brandData) ? brandData : []);
                setColors(Array.isArray(colorData) ? colorData : []);
                setFabrics(Array.isArray(fabricData) ? fabricData : []);
                setSizes(Array.isArray(sizeData) ? sizeData : []);
                setProductFors(Array.isArray(productForData) ? productForData : []);
                setWarehouses(Array.isArray(warehouseData) ? warehouseData : []);
                const galleryPaths = Array.isArray(product.gallery_images) ? product.gallery_images : [];
                const galleryUrls = Array.isArray(product.gallery_image_urls) ? product.gallery_image_urls : [];
                const galleryPairs = galleryPaths.map((path, index) => ({
                    path,
                    url: galleryUrls[index] || '',
                })).filter((item) => item.path || item.url);

                setCurrentCoverImagePath(product.cover_image || '');
                setCurrentCoverImageUrl(product.cover_image_url || '');
                setCurrentGalleryImages(galleryPairs);
                setCurrentGalleryImageUrls(galleryPairs.map((item) => item.url).filter(Boolean));
                setRemoveCoverImage(false);
                setRemoveGalleryImages([]);
                setForm({
                    brand_id: product.brand_id ? String(product.brand_id) : '',
                    style_number: product.style_number || '',
                    name: product.name || '',
                    description: product.description || '',
                    color_id: product.color_id ? String(product.color_id) : '',
                    fabric_id: product.fabric_id ? String(product.fabric_id) : '',
                    size_id: product.size_id ? String(product.size_id) : '',
                    gender_id: product.gender_id ? String(product.gender_id) : '',
                    barCode: product.barCode || '',
                    warehouse_id: product.warehouse_id ? String(product.warehouse_id) : '',
                    cover_image: null,
                    gallery_images: [],
                });
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load product.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadForm();

        return () => {
            ignore = true;
        };
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSelectChange = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value || '',
        }));

        setErrors((previous) => {
            if (!previous[field]) {
                return previous;
            }

            const next = { ...previous };
            delete next[field];
            return next;
        });
    };

    const handleFileChange = (field, files) => {
        setForm((previous) => ({
            ...previous,
            [field]:
                field === 'gallery_images'
                    ? [...(Array.isArray(previous.gallery_images) ? previous.gallery_images : []), ...(Array.isArray(files) ? files : [])]
                    : files,
        }));

        setErrors((previous) => {
            if (!previous[field]) {
                return previous;
            }

            const next = { ...previous };
            delete next[field];
            return next;
        });
    };

    const handleRemoveCurrentCover = () => {
        setCurrentCoverImageUrl('');
        setCurrentCoverImagePath('');
        setRemoveCoverImage(true);
    };

    const handleRemoveCurrentGallery = (urlToRemove) => {
        setCurrentGalleryImages((previous) => {
            const matched = previous.find((item) => item.url === urlToRemove);
            if (matched?.path) {
                setRemoveGalleryImages((old) => (old.includes(matched.path) ? old : [...old, matched.path]));
            }

            const next = previous.filter((item) => item.url !== urlToRemove);
            setCurrentGalleryImageUrls(next.map((item) => item.url).filter(Boolean));
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            await updateProducts(id, {
                brand_id: Number(form.brand_id),
                style_number: form.style_number.trim(),
                name: form.name.trim(),
                description: form.description.trim(),
                color_id: Number(form.color_id),
                fabric_id: Number(form.fabric_id),
                size_id: Number(form.size_id),
                gender_id: Number(form.gender_id),
                barCode: form.barCode.trim(),
                warehouse_id: Number(form.warehouse_id),
                cover_image: form.cover_image,
                gallery_images: form.gallery_images,
                remove_cover_image: removeCoverImage,
                remove_gallery_images: removeGalleryImages,
            });

            toast.success('Product updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/products');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (error.payload?.errors) {
                const firstField = Object.keys(error.payload.errors)[0];
                const firstMessage = firstField ? error.payload.errors[firstField]?.[0] : null;
                if (firstMessage) {
                    toast.error(firstMessage, {
                        style: { color: '#dc2626' },
                    });
                }
            }
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update product.';
                setLoadError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading Products...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                brands={brands}
                colors={colors}
                fabrics={fabrics}
                sizes={sizes}
                productFors={productFors}
                warehouses={warehouses}
                currentCoverImageUrl={currentCoverImageUrl}
                currentGalleryImageUrls={currentGalleryImageUrls}
                onChange={handleChange}
                onSelectChange={handleSelectChange}
                onFileChange={handleFileChange}
                onRemoveCurrentCover={handleRemoveCurrentCover}
                onRemoveCurrentGallery={handleRemoveCurrentGallery}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/products')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}
