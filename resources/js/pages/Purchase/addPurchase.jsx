import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddPurchaseForm from '@/components/purchase/addForm';
import WarehouseStockModal from '@/components/purchase/warehouseStockModal';
import { useAppContext } from '@/context/AppContext';

import { createPurchase, fetchPurchaseFormOptions } from './api';

const emptyProductRow = () => ({ product_id: '', quantity: '', purchase_price: '' });

const initialForm = {
    purchase_form: '',
    purchase_to: '',
    brand_id: '',
    po_number: '',
    status: 'pending',
    payment_method: '',
    paid_amount: '0',
    shipping_date: '',
    received_date: '',
    products: [emptyProductRow()],
};

const ALL_STATUS_OPTIONS = ['pending', 'approved', 'shipped', 'received', 'cancelled'];

function getStockSellingPrice(stockSellingPrices, warehouseId, productId, brandId = null) {
    const sourceWarehouseId = Number(warehouseId);
    const selectedProductId = Number(productId);

    if (!Number.isInteger(sourceWarehouseId) || sourceWarehouseId <= 0) {
        return null;
    }

    if (!Number.isInteger(selectedProductId) || selectedProductId <= 0) {
        return null;
    }

    const normalizedBrandId = Number(brandId);
    const hasSelectedBrand = Number.isInteger(normalizedBrandId) && normalizedBrandId > 0;
    const exactBrandSegment = hasSelectedBrand ? String(normalizedBrandId) : 'none';
    const exactKey = `${sourceWarehouseId}:${selectedProductId}:${exactBrandSegment}`;
    const fallbackNoneKey = `${sourceWarehouseId}:${selectedProductId}:none`;

    let value = stockSellingPrices?.[exactKey];

    if (value == null && hasSelectedBrand) {
        value = stockSellingPrices?.[fallbackNoneKey];
    }

    // Final fallback for legacy data: take any brand segment value for this warehouse/product.
    if (value == null && stockSellingPrices && typeof stockSellingPrices === 'object') {
        const prefix = `${sourceWarehouseId}:${selectedProductId}:`;
        const matchedEntry = Object.entries(stockSellingPrices).find(([key, candidate]) => (
            key.startsWith(prefix) && candidate != null
        ));

        value = matchedEntry ? matchedEntry[1] : null;
    }

    return value == null ? null : Number(value);
}

function getStockQuantity(stockQuantities, warehouseId, productId, brandId = null) {
    const sourceWarehouseId = Number(warehouseId);
    const selectedProductId = Number(productId);

    if (!Number.isInteger(sourceWarehouseId) || sourceWarehouseId <= 0) {
        return 0;
    }

    if (!Number.isInteger(selectedProductId) || selectedProductId <= 0) {
        return 0;
    }

    const normalizedBrandId = Number(brandId);
    const hasSelectedBrand = Number.isInteger(normalizedBrandId) && normalizedBrandId > 0;
    const exactBrandSegment = hasSelectedBrand ? String(normalizedBrandId) : 'none';
    const exactKey = `${sourceWarehouseId}:${selectedProductId}:${exactBrandSegment}`;
    const fallbackNoneKey = `${sourceWarehouseId}:${selectedProductId}:none`;

    let value = stockQuantities?.[exactKey];

    if (value == null && hasSelectedBrand) {
        value = stockQuantities?.[fallbackNoneKey];
    }

    // Final fallback for legacy data: sum all brand segments for this warehouse/product.
    if (value == null && stockQuantities && typeof stockQuantities === 'object') {
        const prefix = `${sourceWarehouseId}:${selectedProductId}:`;
        value = Object.entries(stockQuantities)
            .filter(([key]) => key.startsWith(prefix))
            .reduce((sum, [, candidate]) => sum + Math.max(0, Number(candidate ?? 0)), 0);
    }

    return Math.max(0, Number(value ?? 0));
}

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

function validateForm(form, isSuperAdmin) {
    const validationErrors = {};

    if (!Number.isInteger(Number(form.purchase_form)) || Number(form.purchase_form) <= 0) {
        validationErrors.purchase_form = ['Purchase from warehouse is required.'];
    }

    if (isSuperAdmin && (!Number.isInteger(Number(form.purchase_to)) || Number(form.purchase_to) <= 0)) {
        validationErrors.purchase_to = ['Purchase to warehouse is required.'];
    }

    if (!Number.isInteger(Number(form.brand_id)) || Number(form.brand_id) <= 0) {
        validationErrors.brand_id = ['Brand is required.'];
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
            const productId = Number(row.product_id);
            if (!Number.isInteger(productId) || productId <= 0) {
                validationErrors[`products.${i}.product_id`] = ['Product is required.'];
            }

            const quantity = Number(row.quantity);
            if (!Number.isInteger(quantity) || quantity <= 0) {
                validationErrors[`products.${i}.quantity`] = ['Quantity must be a positive integer.'];
            }

            const purchasePrice = String(row.purchase_price ?? '').trim();
            if (purchasePrice === '' || Number.isNaN(Number(purchasePrice)) || Number(purchasePrice) < 0) {
                validationErrors[`products.${i}.purchase_price`] = ['Purchase price must be a valid number.'];
            }

        });
    }

    const subtotal = getOrderSubtotal(form.products);
    const paidAmount = Number(form.paid_amount ?? 0);

    if (!Number.isFinite(paidAmount) || paidAmount < 0) {
        validationErrors.paid_amount = ['Paid amount must be 0 or greater.'];
    } else if (paidAmount > subtotal) {
        validationErrors.paid_amount = ['Paid amount cannot exceed total PO amount.'];
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
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);
    const [stockSellingPrices, setStockSellingPrices] = useState({});
    const [stockQuantities, setStockQuantities] = useState({});
    const [errors, setErrors] = useState({});
    const [requestError, setRequestError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [isWarehouseStockModalOpen, setIsWarehouseStockModalOpen] = useState(false);
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
                const [options, currentUser] = await Promise.all([
                    fetchPurchaseFormOptions(),
                    user ? Promise.resolve(user) : fetchCurrentUser(),
                ]);

                if (!ignore) {
                    setWarehouses(Array.isArray(options?.warehouses) ? options.warehouses : []);
                    setBrands(Array.isArray(options?.brands) ? options.brands : []);
                    setProducts(Array.isArray(options?.products) ? options.products : []);
                    setStockSellingPrices(options?.stock_selling_prices && typeof options.stock_selling_prices === 'object'
                        ? options.stock_selling_prices
                        : {});
                    setStockQuantities(options?.stock_quantities && typeof options.stock_quantities === 'object'
                        ? options.stock_quantities
                        : {});
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

    const filteredProductOptions = useMemo(() => {
        if (!Number.isInteger(Number(form.purchase_form)) || Number(form.purchase_form) <= 0) {
            return [];
        }

        return products;
    }, [form.purchase_form, products]);

    const selectedWarehouse = useMemo(() => {
        const selectedWarehouseId = Number(form.purchase_form);
        return warehouses.find((warehouse) => Number(warehouse.id) === selectedWarehouseId) || null;
    }, [form.purchase_form, warehouses]);

    const warehouseStockRows = useMemo(() => {
        return filteredProductOptions
            .map((product) => ({
                product_id: product.id,
                name: product?.name || `Product #${product?.id}`,
                color: product?.color?.color_code || product?.color?.name || product?.color_name,
                size: product?.size?.size || product?.size || product?.size_name,
                available_stock: getStockQuantity(stockQuantities, form.purchase_form, product.id, form.brand_id),
                unit_price: getStockSellingPrice(stockSellingPrices, form.purchase_form, product.id, form.brand_id) ?? 0,
            }))
            .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }, [filteredProductOptions, form.purchase_form, stockQuantities, stockSellingPrices]);

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

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSelectChange = (name, value) => {
        setForm((previous) => {
            if (name !== 'purchase_form') {
                return {
                    ...previous,
                    [name]: value,
                };
            }

            const updatedProducts = previous.products.map((row) => {
                const autoPrice = getStockSellingPrice(stockSellingPrices, value, row.product_id, previous.brand_id);

                return {
                    ...row,
                    purchase_price: autoPrice == null ? row.purchase_price : String(autoPrice),
                    quantity: row.quantity,
                };
            });

            return {
                ...previous,
                [name]: value,
                products: updatedProducts,
            };
        });
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
        setForm((previous) => {
            const autoPrice = getStockSellingPrice(stockSellingPrices, previous.purchase_form, value, previous.brand_id);
            const updated = previous.products.map((row, i) => {
                if (i !== index) {
                    return row;
                }

                return {
                    ...row,
                    product_id: value,
                    purchase_price: autoPrice == null ? row.purchase_price : String(autoPrice),
                };
            });

            return {
                ...previous,
                products: updated,
            };
        });
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
                brand_id: Number(form.brand_id),
                products: form.products.map((row) => ({
                    product_id:     Number(row.product_id),
                    quantity:       Number(row.quantity),
                    purchase_price: Number(row.purchase_price),
                })),
                payment_method: form.payment_method || null,
                paid_amount: paidAmount,
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
                brands={brands}
                productOptions={filteredProductOptions}
                isSuperAdmin={isSuperAdmin}
                purchaseToLabel={purchaseToLabel}
                availableStatuses={availableStatuses}
                isPurchasePriceLocked={false}
                selectedPurchaseFromWarehouseId={form.purchase_form}
                stockQuantities={stockQuantities}
                orderSubtotal={orderSubtotal}
                orderTotal={orderSubtotal}
                paidAmount={paidAmount}
                dueAmount={dueAmount}
                paymentStatus={paymentStatus}
                noProductInStock={false}
                canViewWarehouseStock={Boolean(Number(form.purchase_form) > 0)}
                onViewWarehouseStock={() => setIsWarehouseStockModalOpen(true)}
            />

            <WarehouseStockModal
                open={isWarehouseStockModalOpen}
                onOpenChange={setIsWarehouseStockModalOpen}
                warehouseName={selectedWarehouse?.name || ''}
                rows={warehouseStockRows}
            />
        </div>
    );
}
