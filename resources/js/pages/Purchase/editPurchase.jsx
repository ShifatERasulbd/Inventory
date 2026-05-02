import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditPurchaseForm from '@/components/purchase/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchProducts, fetchPurchase, fetchWarehouses, updatePurchase } from './api';

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

export default function EditPurchase() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle, user, setUser } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const isSuperAdmin = Array.isArray(user?.role_slugs) && user.role_slugs.includes('super-admin');

    useEffect(() => {
        setPageTitle('Edit Purchase');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const [purchase, warehouseData, productData, currentUser] = await Promise.all([
                    fetchPurchase(id),
                    fetchWarehouses(),
                    fetchProducts(),
                    user ? Promise.resolve(user) : fetchCurrentUser(),
                ]);

                if (!ignore) {
                    setForm({
                        purchase_form: String(purchase.purchase_form ?? ''),
                        purchase_to: String(purchase.purchase_to ?? ''),
                        product_id: String(purchase.product_id ?? ''),
                        quantity: String(purchase.quantity ?? ''),
                        po_number: purchase.po_number || '',
                        purchase_price: String(purchase.purchase_price ?? ''),
                        selling_price: String(purchase.selling_price ?? ''),
                        status: purchase.status || 'pending',
                    });
                    setWarehouses(Array.isArray(warehouseData) ? warehouseData : []);
                    setProducts(Array.isArray(productData) ? productData : []);
                    if (!user && currentUser) {
                        setUser(currentUser);
                    }
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load purchase.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadData();

        return () => {
            ignore = true;
        };
    }, [id, setUser, user]);

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

        setIsSubmitting(true);
        setErrors({});

        try {
            await updatePurchase(id, {
                purchase_form: Number(form.purchase_form),
                ...(isSuperAdmin ? { purchase_to: Number(form.purchase_to) } : {}),
                product_id: Number(form.product_id),
                quantity: Number(form.quantity),
                po_number: form.po_number.trim(),
                purchase_price: Number(form.purchase_price),
                selling_price: Number(form.selling_price),
                status: form.status.trim(),
            });

            toast.success('Purchase updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/purchases');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update purchase.';
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
        return <p className="text-sm text-muted-foreground">Loading purchase...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditPurchaseForm
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
