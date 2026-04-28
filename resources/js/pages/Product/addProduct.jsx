import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/product/addForm';
import { useAppContext } from '@/context/AppContext';

import { fetchBrands } from '@/pages/Brand/api';
import { fetchColors } from '@/pages/Color/api';
import { fetchFabrics } from '@/pages/Fabric/api';
import { fetchProductsFor } from '@/pages/ProductsFor/api';
import { fetchSizes } from '@/pages/Size/api';
import { fetchWarehouses } from '@/pages/Warehouse/api';

import { createProducts } from './api';

const initialForm = {
    brand_id: '',
    style_number: '',
    name: '',
    description: '',
    color_id: '',
    color_ids: [''],
    fabric_id: '',
    size_id: '',
    size_ids: [''],
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
    const selectedColorIds = Array.isArray(form.color_ids) ? form.color_ids.filter(Boolean) : [];
    const selectedSizeIds = Array.isArray(form.size_ids) ? form.size_ids.filter(Boolean) : [];

    if (!form.brand_id) {
        validationErrors.brand_id = ['Please select a brand.'];
    }

    if (!form.style_number.trim()) {
        validationErrors.style_number = ['Please enter the style number.'];
    }

    if (!form.name.trim()) {
        validationErrors.name = ['Please enter the product name.'];
    }

    if (selectedColorIds.length === 0) {
        validationErrors.color_ids = ['Please add at least one color.'];
    }

    if (!form.fabric_id) {
        validationErrors.fabric_id = ['Please select a fabric.'];
    }

    if (selectedSizeIds.length === 0) {
        validationErrors.size_ids = ['Please add at least one size.'];
    }

    if (!form.gender_id) {
        validationErrors.gender_id = ['Please select product for.'];
    }

    if (!form.barCode.trim()) {
        validationErrors.barCode = ['Please enter the barcode.'];
    }

    if (!form.warehouse_id) {
        validationErrors.warehouse_id = ['Please select a warehouse.'];
    }

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

export default function AddProduct() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [brands, setBrands] = useState([]);
    const [colors, setColors] = useState([]);
    const [fabrics, setFabrics] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [productFors, setProductFors] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        setPageTitle('Add Product');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadOptions() {
            try {
                const [brandData, colorData, fabricData, sizeData, productForData, warehouseData] = await Promise.all([
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
            } catch (error) {
                if (!ignore) {
                    setRequestError(error.message || 'Failed to load product form options.');
                }
            }
        }

        loadOptions();

        return () => {
            ignore = true;
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => {
            if (!previous[name]) {
                return previous;
            }

            const next = { ...previous };
            delete next[name];
            return next;
        });
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

    const handleRepeaterSelectChange = (field, index, value) => {
        setForm((previous) => {
            const current = Array.isArray(previous[field]) && previous[field].length > 0 ? [...previous[field]] : [''];
            current[index] = value || '';

            return {
                ...previous,
                [field]: current,
                ...(field === 'color_ids' ? { color_id: current.find(Boolean) || '' } : {}),
                ...(field === 'size_ids' ? { size_id: current.find(Boolean) || '' } : {}),
            };
        });

        setErrors((previous) => {
            if (!previous[field]) {
                return previous;
            }

            const next = { ...previous };
            delete next[field];
            return next;
        });
    };

    const handleAddRepeaterItem = (field) => {
        setForm((previous) => ({
            ...previous,
            [field]: [...(Array.isArray(previous[field]) ? previous[field] : ['']), ''],
        }));
    };

    const handleRemoveRepeaterItem = (field, index) => {
        setForm((previous) => {
            const current = Array.isArray(previous[field]) ? [...previous[field]] : [''];

            if (current.length === 1) {
                current[0] = '';
            } else {
                current.splice(index, 1);
            }

            return {
                ...previous,
                [field]: current,
                ...(field === 'color_ids' ? { color_id: current.find(Boolean) || '' } : {}),
                ...(field === 'size_ids' ? { size_id: current.find(Boolean) || '' } : {}),
            };
        });

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

    const handleSubmit = async (event) => {
        event.preventDefault();

        const selectedColorIds = Array.isArray(form.color_ids) ? form.color_ids.filter(Boolean) : [];
        const selectedSizeIds = Array.isArray(form.size_ids) ? form.size_ids.filter(Boolean) : [];

        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setRequestError('');
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setRequestError('');

        try {
            await createProducts({
                brand_id: Number(form.brand_id),
                style_number: form.style_number.trim(),
                name: form.name.trim(),
                description: form.description.trim(),
                color_id: Number(selectedColorIds[0]),
                color_ids: selectedColorIds.map((value) => Number(value)),
                fabric_id: Number(form.fabric_id),
                size_id: Number(selectedSizeIds[0]),
                size_ids: selectedSizeIds.map((value) => Number(value)),
                gender_id: Number(form.gender_id),
                barCode: form.barCode.trim(),
                warehouse_id: Number(form.warehouse_id),
                cover_image: form.cover_image,
                gallery_images: form.gallery_images,
            });

            toast.success('Product created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/products');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create Product.';
                setRequestError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddForm
                    form={form}
                    brands={brands}
                    colors={colors}
                    fabrics={fabrics}
                    sizes={sizes}
                    productFors={productFors}
                    warehouses={warehouses}
                    onChange={handleChange}
                    onSelectChange={handleSelectChange}
                    onRepeaterSelectChange={handleRepeaterSelectChange}
                    onAddRepeaterItem={handleAddRepeaterItem}
                    onRemoveRepeaterItem={handleRemoveRepeaterItem}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/products')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            </div>
            </div>
        </>
    );
}