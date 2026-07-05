import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditPurchaseForm from '@/components/purchase/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchPurchase, fetchPurchaseFormOptions, fetchShipmentTimes, updatePurchase } from './api';

const emptyProductRow = () => ({ product_id: '', quantity: '', purchase_price: '' });

const initialForm = {
    purchase_form: '',
    purchase_to: '',
    brand_id: '',
    po_number: '',
    expected_delivery_date: '',
    status: 'pending',
    payment_method: '',
    paid_amount: '0',
    shipping_date: '',
    received_date: '',
    note: '',
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

function getLineTotal(quantity, purchasePrice) {
    const qty = Number(quantity ?? 0);
    const unit = Number(purchasePrice ?? 0);

    if (!Number.isFinite(qty) || !Number.isFinite(unit)) {
        return 0;
    }

    return Math.max(0, qty) * Math.max(0, unit);
}

function getOrderSubtotal(rows) {
    return (rows ?? []).reduce((total, row) => total + getLineTotal(row.quantity, row.purchase_price), 0);
}

function toDateOnlyString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addDays(baseDate, days) {
    const date = new Date(baseDate);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + Math.max(0, Number(days) || 0));
    return date;
}

function parseShipmentDays(rawValue) {
    const parsed = Number(rawValue);
    if (Number.isFinite(parsed) && parsed >= 0) {
        return Math.floor(parsed);
    }

    const extracted = Number(String(rawValue ?? '').match(/\d+/)?.[0]);
    if (!Number.isFinite(extracted) || extracted < 0) {
        return 0;
    }

    return Math.floor(extracted);
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

export default function EditPurchase() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle, user, setUser } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [warehouses, setWarehouses] = useState([]);
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [latestShipmentTimes, setLatestShipmentTimes] = useState({
        shipmentTime: '',
        productionTime: '',
    });
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
                const [purchase, options, currentUser] = await Promise.all([
                    fetchPurchase(id),
                    fetchPurchaseFormOptions(),
                    user ? Promise.resolve(user) : fetchCurrentUser(),
                ]);

                if (!ignore) {
                    const loadedProducts = Array.isArray(purchase.products) && purchase.products.length > 0
                        ? purchase.products.map((item) => ({
                            product_id:     String(item.product_id ?? ''),
                            quantity:       String(item.quantity ?? ''),
                            purchase_price: String(item.purchase_price ?? ''),
                          }))
                        : [emptyProductRow()];

                    setForm({
                        purchase_form: String(purchase.purchase_form ?? ''),
                        purchase_to:   String(purchase.purchase_to ?? ''),
                        brand_id:      String(purchase.brand_id ?? ''),
                        po_number:     purchase.po_number || '',
                        expected_delivery_date: purchase.expected_delivery_date || '',
                        status:        purchase.status || 'pending',
                        payment_method: purchase.payment_method || '',
                        paid_amount: String(purchase.paid_amount ?? 0),
                        shipping_date: purchase.shipping_date || '',
                        received_date: purchase.received_date || '',
                        note:          purchase.note || '',
                        products:      loadedProducts,
                    });
                    setWarehouses(Array.isArray(options?.warehouses) ? options.warehouses : []);
                    setBrands(Array.isArray(options?.brands) ? options.brands : []);
                    setProducts(Array.isArray(options?.products) ? options.products : []);
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

            try {
                const shipmentTimes = await fetchShipmentTimes();

                if (!ignore) {
                    const latestShipment = Array.isArray(shipmentTimes) && shipmentTimes.length > 0
                        ? shipmentTimes[0]
                        : null;

                    setLatestShipmentTimes({
                        shipmentTime: latestShipment?.shipmentTime ?? latestShipment?.shipping_time ?? '',
                        productionTime: latestShipment?.productionTime ?? latestShipment?.production_time ?? '',
                    });
                }
            } catch {
                if (!ignore) {
                    setLatestShipmentTimes({ shipmentTime: '', productionTime: '' });
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

    const orderSubtotal = useMemo(() => getOrderSubtotal(form.products), [form.products]);
    const paidAmount = useMemo(() => {
        const numeric = Number(form.paid_amount ?? 0);
        if (!Number.isFinite(numeric) || numeric < 0) {
            return 0;
        }
        return numeric;
    }, [form.paid_amount]);
    const dueAmount = useMemo(() => Math.max(0, orderSubtotal - paidAmount), [orderSubtotal, paidAmount]);
    const paymentStatus = useMemo(() => {
        if (paidAmount <= 0) {
            return 'unpaid';
        }

        if (dueAmount <= 0) {
            return 'paid';
        }

        return 'partial';
    }, [dueAmount, paidAmount]);

    const shipmentDays = useMemo(() => parseShipmentDays(latestShipmentTimes.shipmentTime), [latestShipmentTimes.shipmentTime]);

    const minExpectedDeliveryDate = useMemo(() => {
        return toDateOnlyString(addDays(new Date(), shipmentDays));
    }, [shipmentDays]);

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

        if (!form.expected_delivery_date?.trim()) {
            setErrors({ expected_delivery_date: ['Expected delivery date is required.'] });
            return;
        }

        if (form.expected_delivery_date < minExpectedDeliveryDate) {
            setErrors({ expected_delivery_date: [`Expected delivery date must be on or after ${minExpectedDeliveryDate}.`] });
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            await updatePurchase(id, {
                purchase_form: Number(form.purchase_form),
                purchase_to: Number(form.purchase_to),
                brand_id: Number(form.brand_id),
                products: form.products.map((row) => ({
                    product_id:     Number(row.product_id),
                    quantity:       Number(row.quantity),
                    purchase_price: Number(row.purchase_price),
                })),
                payment_method: form.payment_method || null,
                paid_amount: paidAmount,
                po_number: form.po_number.trim(),
                expected_delivery_date: form.expected_delivery_date.trim(),
                status: form.status.trim(),
                shipping_date: form.shipping_date || null,
                received_date: form.received_date || null,
                note: form.note || '',
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
                onProductChange={handleProductChange}
                onProductSelectChange={handleProductSelectChange}
                onAddProduct={addProductRow}
                onRemoveProduct={removeProductRow}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/purchases')}
                isSubmitting={isSubmitting}
                errors={errors}
                warehouses={warehouses}
                brands={brands}
                productOptions={products}
                isSuperAdmin={isSuperAdmin}
                purchaseToLabel={purchaseToLabel}
                availableStatuses={availableStatuses}
                orderSubtotal={orderSubtotal}
                orderTotal={orderSubtotal}
                dueAmount={dueAmount}
                paymentStatus={paymentStatus}
                minExpectedDeliveryDate={minExpectedDeliveryDate}
                shipmentTimeValue={latestShipmentTimes.shipmentTime}
                productionTimeValue={latestShipmentTimes.productionTime}
            />
        </div>
    );
}
