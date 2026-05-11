import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddPurchaseForm from '@/components/purchase/addForm';
import { useAppContext } from '@/context/AppContext';

import { createPurchase, fetchProducts, fetchWarehouses } from './api';

const emptyProductRow = () => ({ product_id: '', quantity: '', purchase_price: '', selling_price: '' });

const initialForm = {
    purchase_form: '',
    purchase_to: '',
    po_number: '',
    status: 'pending',
    shipping_date: '',
    received_date: '',
    products: [emptyProductRow()],
};

const ALL_STATUS_OPTIONS = ['pending', 'approved', 'shipped', 'received', 'cancelled'];

function getAvailableStatuses(isSuperAdmin, userWarehouseId, selectedPurchaseToWarehouseId) {
    // Super admins can use all statuses
    if (isSuperAdmin) {
        return ALL_STATUS_OPTIONS;
    }

    // Non-super-admins can only approve if warehouse matches their warehouse
    const userWarehouse = Number(userWarehouseId) || null;
    const purchaseToWarehouse = Number(selectedPurchaseToWarehouseId) || null;

    if (userWarehouse && purchaseToWarehouse && userWarehouse === purchaseToWarehouse) {
        return ALL_STATUS_OPTIONS;
    }

    // If warehouse doesn't match, exclude 'approved'
    return ALL_STATUS_OPTIONS.filter((status) => status !== 'approved');
}

function validateForm(form, isSuperAdmin) {
    const validationErrors = {};

    if (!Number.isInteger(Number(form.purchase_form)) || Number(form.purchase_form) <= 0) {
        validationErrors.purchase_form = ['Purchase from warehouse is required.'];
    }

    if (isSuperAdmin && (!Number.isInteger(Number(form.purchase_to)) || Number(form.purchase_to) <= 0)) {
        validationErrors.purchase_to = ['Purchase to warehouse is required.'];
    }

    if (!form.po_number.trim()) {
        validationErrors.po_number = ['PO number is required.'];
    }

    if (!form.status.trim()) {
        validationErrors.status = ['Status is required.'];
    }

    if (form.shipping_date && Number.isNaN(Date.parse(form.shipping_date))) {
        validationErrors.shipping_date = ['Shipping date must be a valid date.'];
    }

    if (form.received_date && Number.isNaN(Date.parse(form.received_date))) {
        validationErrors.received_date = ['Received date must be a valid date.'];
    }

    if (!Array.isArray(form.products) || form.products.length === 0) {
        validationErrors.products = ['At least one product is required.'];
    } else {
        form.products.forEach((row, i) => {
            if (!Number.isInteger(Number(row.product_id)) || Number(row.product_id) <= 0) {
                validationErrors[`products.${i}.product_id`] = ['Product is required.'];
            }
            if (!Number.isInteger(Number(row.quantity)) || Number(row.quantity) <= 0) {
                validationErrors[`products.${i}.quantity`] = ['Quantity must be a positive integer.'];
            }
            if (Number.isNaN(Number(row.purchase_price)) || Number(row.purchase_price) < 0) {
                validationErrors[`products.${i}.purchase_price`] = ['Purchase price must be 0 or greater.'];
            }
            if (Number.isNaN(Number(row.selling_price)) || Number(row.selling_price) < 0) {
                validationErrors[`products.${i}.selling_price`] = ['Selling price must be 0 or greater.'];
            }
        });
    }

    return validationErrors;
}

async function fetchCurrentUser() {
    const response = await fetch('/api/user', {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        return null;
    }

    return response.json();
}

export default function AddPurchase() {
    const navigate = useNavigate();
    const { setPageTitle, user, setUser } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [errors, setErrors] = useState({});
    const [requestError, setRequestError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const isSuperAdmin = Array.isArray(user?.role_slugs) && user.role_slugs.includes('super-admin');

    useEffect(() => {
        setPageTitle('Add Purchase');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadOptions() {
            setIsLoadingOptions(true);
            setRequestError('');

            try {
                const [warehouseData, productData, currentUser] = await Promise.all([
                    fetchWarehouses(),
                    fetchProducts(),
                    user ? Promise.resolve(user) : fetchCurrentUser(),
                ]);

                if (!ignore) {
                    setWarehouses(Array.isArray(warehouseData) ? warehouseData : []);
                    setProducts(Array.isArray(productData) ? productData : []);
                    if (!user && currentUser) {
                        setUser(currentUser);
                    }
                }
            } catch (error) {
                if (!ignore) {
                    setRequestError(error.message || 'Failed to load form options.');
                }
            } finally {
                if (!ignore) {
                    setIsLoadingOptions(false);
                }
            }
        }

        loadOptions();

        return () => {
            ignore = true;
        };
    }, [setUser, user]);

    const purchaseToLabel = useMemo(() => {
        if (user?.warehouse?.id) {
            return `${user.warehouse.name} (ID: ${user.warehouse.id})`;
        }

        if (Array.isArray(user?.warehouses) && user.warehouses.length > 0) {
            const first = user.warehouses[0];
            return `${first.name} (ID: ${first.id})`;
        }

        return 'Auto from login user warehouse';
    }, [user]);

    const getUserWarehouseId = useMemo(() => {
        if (user?.warehouse?.id) {
            return user.warehouse.id;
        }
        if (Array.isArray(user?.warehouses) && user.warehouses.length > 0) {
            return user.warehouses[0].id;
        }
        return null;
    }, [user]);

    const availableStatuses = useMemo(() => {
        return getAvailableStatuses(isSuperAdmin, getUserWarehouseId, form.purchase_to);
    }, [isSuperAdmin, getUserWarehouseId, form.purchase_to]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSelectChange = (name, value) => {
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleProductChange = (index, field, value) => {
        setForm((previous) => {
            const updated = previous.products.map((row, i) =>
                i === index ? { ...row, [field]: value } : row
            );
            return { ...previous, products: updated };
        });
    };

    const handleProductSelectChange = (index, value) => {
        handleProductChange(index, 'product_id', value);
    };

    const addProductRow = () => {
        setForm((previous) => ({
            ...previous,
            products: [...previous.products, emptyProductRow()],
        }));
    };

    const removeProductRow = (index) => {
        setForm((previous) => ({
            ...previous,
            products: previous.products.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm(form, isSuperAdmin);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setRequestError('');
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setRequestError('');

        try {
            await createPurchase({
                purchase_form: Number(form.purchase_form),
                ...(isSuperAdmin ? { purchase_to: Number(form.purchase_to) } : {}),
                products: form.products.map((row) => ({
                    product_id:     Number(row.product_id),
                    quantity:       Number(row.quantity),
                    purchase_price: Number(row.purchase_price),
                    selling_price:  Number(row.selling_price),
                })),
                po_number: form.po_number.trim(),
                status: form.status.trim(),
                shipping_date: form.shipping_date || null,
                received_date: form.received_date || null,
            });

            toast.success('Purchase created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/purchases');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create purchase.';
                setRequestError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingOptions) {
        return <p className="text-sm text-muted-foreground">Loading options...</p>;
    }

    return (
        <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}

            <AddPurchaseForm
                form={form}
                onChange={handleChange}
                onSelectChange={handleSelectChange}
                onProductChange={handleProductChange}
                onProductSelectChange={handleProductSelectChange}
                onAddProduct={addProductRow}
                onRemoveProduct={removeProductRow}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/purchases')}
                isSubmitting={isSubmitting}
                errors={errors}
                warehouses={warehouses}
                productOptions={products}
                isSuperAdmin={isSuperAdmin}
                purchaseToLabel={purchaseToLabel}
                availableStatuses={availableStatuses}
            />
        </div>
    );
}
