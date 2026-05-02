import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddPurchaseForm from '@/components/purchase/addForm';
import { useAppContext } from '@/context/AppContext';

import { createPurchase, fetchProducts, fetchWarehouses } from './api';

const initialForm = {
    purchase_form: '',
    purchase_to: '',
    product_id: '',
    quantity: '',
    po_number: '',
    purchase_price: '',
    selling_price: '',
    status: 'pending',
};

function validateForm(form, isSuperAdmin) {
    const validationErrors = {};

    if (!Number.isInteger(Number(form.purchase_form)) || Number(form.purchase_form) <= 0) {
        validationErrors.purchase_form = ['Purchase from warehouse is required.'];
    }

    if (isSuperAdmin && (!Number.isInteger(Number(form.purchase_to)) || Number(form.purchase_to) <= 0)) {
        validationErrors.purchase_to = ['Purchase to warehouse is required.'];
    }

    if (!Number.isInteger(Number(form.product_id)) || Number(form.product_id) <= 0) {
        validationErrors.product_id = ['Product is required.'];
    }

    if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) <= 0) {
        validationErrors.quantity = ['Quantity must be a positive integer.'];
    }

    if (!form.po_number.trim()) {
        validationErrors.po_number = ['PO number is required.'];
    }

    if (Number.isNaN(Number(form.purchase_price)) || Number(form.purchase_price) < 0) {
        validationErrors.purchase_price = ['Purchase price must be 0 or greater.'];
    }

    if (Number.isNaN(Number(form.selling_price)) || Number(form.selling_price) < 0) {
        validationErrors.selling_price = ['Selling price must be 0 or greater.'];
    }

    if (!form.status.trim()) {
        validationErrors.status = ['Status is required.'];
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
                product_id: Number(form.product_id),
                quantity: Number(form.quantity),
                po_number: form.po_number.trim(),
                purchase_price: Number(form.purchase_price),
                selling_price: Number(form.selling_price),
                status: form.status.trim(),
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
                onSubmit={handleSubmit}
                onCancel={() => navigate('/purchases')}
                isSubmitting={isSubmitting}
                errors={errors}
                warehouses={warehouses}
                products={products}
                isSuperAdmin={isSuperAdmin}
                purchaseToLabel={purchaseToLabel}
            />
        </div>
    );
}
