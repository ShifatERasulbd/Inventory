import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/product/addForm';
import { useAppContext } from '@/context/AppContext';
import { generateBarcodesMap } from '@/components/product/BarcodePreview';

import { fetchBrands } from '@/pages/Brand/api';
import { fetchCategories } from '@/pages/Category/api';
import { fetchColors } from '@/pages/Color/api';
import { fetchFabrics } from '@/pages/Fabric/api';
import { fetchProductsFor } from '@/pages/ProductsFor/api';
import { fetchSeasons } from '@/pages/Season/api';
import { fetchSizes } from '@/pages/Size/api';
import { fetchWarehouses } from '@/pages/Warehouse/api';

import { createProducts } from './api';

const initialForm = {
    brand_id: '',
    category_id: '',
    style_number: '',
    hs_number: '',
    ref_number: '',
    name: '',
    description: '',
    color_id: '',
    color_ids: [''],
    fabric_id: '',
    size_id: '',
    size_ids: [''],
    gender_id: '',
    warehouse_id: '',
    season_id: '',
    cover_image: null,
    gallery_images: [],
};

const MAX_SINGLE_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 7 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 8;

const cleanText = (value) => {
    if (typeof value !== 'string') {
        return value ?? '';
    }

    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const getFabricRefNumber = (fabricId, fabricList) => {
    const selectedFabric = (Array.isArray(fabricList) ? fabricList : []).find((fabric) => String(fabric.id) === String(fabricId));

    return cleanText(selectedFabric?.ref_number);
};

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
    const location = useLocation();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [fabrics, setFabrics] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [productFors, setProductFors] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [seasons, setSeasons] = useState([]);

    useEffect(() => {
        setPageTitle('Add Product');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadOptions() {
            try {
                const [brandData, categoryData, colorData, fabricData, sizeData, productForData, warehouseData, seasonData] = await Promise.all([
                    fetchBrands(),
                    fetchCategories(),
                    fetchColors(),
                    fetchFabrics(),
                    fetchSizes(),
                    fetchProductsFor(),
                    fetchWarehouses(),
                    fetchSeasons(),
                ]);

                if (ignore) {
                    return;
                }

                setBrands(Array.isArray(brandData) ? brandData : []);
                setCategories(Array.isArray(categoryData) ? categoryData : []);
                setColors(Array.isArray(colorData) ? colorData : []);
                setFabrics(Array.isArray(fabricData) ? fabricData : []);
                setSizes(Array.isArray(sizeData) ? sizeData : []);
                setProductFors(Array.isArray(productForData) ? productForData : []);
                setWarehouses(Array.isArray(warehouseData) ? warehouseData : []);
                setSeasons(Array.isArray(seasonData) ? seasonData : []);
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

    useEffect(() => {
        const copied = location.state?.copyFrom;
        const copiedVariants = Array.isArray(location.state?.copyVariants) ? location.state.copyVariants : [];

        if (!copied) {
            return;
        }

        const sourceVariants = copiedVariants.length > 0 ? copiedVariants : [copied];
        const nextColorIds = Array.from(new Set(
            sourceVariants
                .map((item) => item?.color_id)
                .filter((value) => value !== undefined && value !== null && value !== '')
                .map((value) => String(value))
        ));
        const nextSizeIds = Array.from(new Set(
            sourceVariants
                .map((item) => item?.size_id)
                .filter((value) => value !== undefined && value !== null && value !== '')
                .map((value) => String(value))
        ));

        const nextColor = nextColorIds[0] || '';
        const nextSize = nextSizeIds[0] || '';

        setForm((previous) => ({
            ...previous,
            brand_id: copied.brand_id ? String(copied.brand_id) : '',
            category_id: copied.category_id ? String(copied.category_id) : '',
            style_number: copied.style_number || '',
            hs_number: copied.hs_number || '',
            ref_number: copied.ref_number || '',
            name: copied.name || '',
            description: copied.description || '',
            color_id: nextColor,
            color_ids: nextColorIds.length > 0 ? nextColorIds : [''],
            fabric_id: copied.fabric_id ? String(copied.fabric_id) : '',
            size_id: nextSize,
            size_ids: nextSizeIds.length > 0 ? nextSizeIds : [''],
            gender_id: copied.gender_id ? String(copied.gender_id) : '',
            warehouse_id: copied.warehouse_id ? String(copied.warehouse_id) : '',
            season_id: copied.season_id ? String(copied.season_id) : '',
            cover_image: null,
            gallery_images: [],
        }));
    }, [location.state]);

    useEffect(() => {
        if (!form.fabric_id) {
            if (form.ref_number !== '') {
                setForm((previous) => ({
                    ...previous,
                    ref_number: '',
                }));
            }

            return;
        }

        const nextRefNumber = getFabricRefNumber(form.fabric_id, fabrics);
        if (nextRefNumber !== form.ref_number) {
            setForm((previous) => ({
                ...previous,
                ref_number: nextRefNumber,
            }));
        }
    }, [form.fabric_id, fabrics, form.ref_number]);

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
        setForm((previous) => {
            const nextValue = value || '';

            return {
                ...previous,
                [field]: nextValue,
                ...(field === 'fabric_id' ? { ref_number: getFabricRefNumber(nextValue, fabrics) } : {}),
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
                category_id: form.category_id ? Number(form.category_id) : null,
                style_number: form.style_number.trim(),
                hs_number: form.hs_number.trim() || null,
                ref_number: form.ref_number.trim() || null,
                name: form.name.trim(),
                description: form.description.trim(),
                color_id: Number(selectedColorIds[0]),
                color_ids: selectedColorIds.map((value) => Number(value)),
                fabric_id: Number(form.fabric_id),
                size_id: Number(selectedSizeIds[0]),
                size_ids: selectedSizeIds.map((value) => Number(value)),
                gender_id: Number(form.gender_id),
                warehouse_id: Number(form.warehouse_id),
                season_id: form.season_id ? Number(form.season_id) : null,
                cover_image: form.cover_image,
                gallery_images: form.gallery_images,
                barcodes: generateBarcodesMap({
                    styleNumber: form.style_number,
                    colorIds: selectedColorIds,
                    fabricId: form.fabric_id,
                    refNumber: form.ref_number,
                    sizeIds: selectedSizeIds,
                    colors,
                    fabrics,
                    sizes,
                }),
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
                    categories={categories}
                    colors={colors}
                    fabrics={fabrics}
                    sizes={sizes}
                    productFors={productFors}
                    warehouses={warehouses}
                    seasons={seasons}
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