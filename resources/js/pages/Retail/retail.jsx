import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Barcode as BarcodeIcon, ShoppingCart, Trash2, Plus, Minus, X, ClipboardList, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import {
    createRetailSale,
    fetchAvailableCartoonsByWarehouse,
    fetchPendingRemoteOrders,
    fetchWarehouses,
    lookupBarcode,
    bookRemoteOrderVeeqoShipment,
    fetchRemoteOrderById,
    updateRemoteOrderStatus,
} from './api';
import ShippingLabelSection from './ShippingLabelSection';

function normalizeText(value) {
    return String(value ?? '').trim().toLowerCase();
}

// Veeqo sometimes returns label_url as a path relative to its dashboard, not an absolute URL.
function normalizeVeeqoLabelUrl(labelUrl) {
    const value = String(labelUrl ?? '').trim();
    if (value === '' || /^https?:\/\//i.test(value)) {
        return value || null;
    }
    return `https://app.veeqo.com/${value.replace(/^\/+/, '')}`;
}

function normalizeName(value) {
    return String(value ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function buildOrderItemKey({ productId, color, size }) {
    const normalizedProductId = Number.parseInt(productId, 10) || 0;
    return `${normalizedProductId}::${normalizeText(color)}::${normalizeText(size)}`;
}

function resolveOrderLineForProduct(product, requiredItems, scannedQtyByOrderKey) {
    const exactKey = buildOrderItemKey({
        productId: product?.product_id,
        color: product?.color,
        size: product?.size,
    });

    const withRemaining = (item) => Number(scannedQtyByOrderKey[item.matchKey] || 0) < Number(item.quantity || 0);

    const exact = requiredItems.find((item) => item.matchKey === exactKey && withRemaining(item));
    if (exact) {
        return exact;
    }

    const scannedProductId = Number.parseInt(product?.product_id, 10) || 0;
    if (scannedProductId > 0) {
        const byProductId = requiredItems.find((item) => Number(item.productId || 0) === scannedProductId && withRemaining(item));
        if (byProductId) {
            return byProductId;
        }
    }

    const scannedName = normalizeName(product?.product_name);
    if (scannedName) {
        const byName = requiredItems.find((item) => item.nameKey === scannedName && withRemaining(item));
        if (byName) {
            return byName;
        }
    }

    return null;
}

function extractSelectedOrderItems(order) {
    const sourceItems = Array.isArray(order?.raw_payload?.items) ? order.raw_payload.items : [];

    return sourceItems
        .map((item) => {
            const quantity = Math.max(1, Number.parseInt(item?.quantity ?? item?.qty ?? 1, 10) || 1);
            const name = String(item?.name || item?.title || item?.product_name || 'Unknown Product');
            const productId = Number.parseInt(item?.productId ?? item?.product_id ?? 0, 10) || 0;
            const color = String(
                item?.selectedColor
                || item?.selected_color
                || item?.color
                || item?.color_variant?.name
                || ''
            ).trim();
            const size = String(
                item?.selectedSize
                || item?.selected_size
                || item?.size
                || item?.size_variant?.size
                || ''
            ).trim();
            const matchKey = buildOrderItemKey({ productId, color, size });
            const barcode = String(item?.barcode || '').trim();

            return {
                productId,
                quantity,
                name,
                nameKey: normalizeName(name),
                color,
                size,
                barcode,
                matchKey,
            };
        })
        .filter((item) => item.productId > 0);
}

function formatCurrency(value) {
    const amount = Number(value ?? 0);
    return `$${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export default function RetailPOS() {
    const { setPageTitle, user } = useAppContext();
    const location = useLocation();

    const isSuperAdmin = Array.isArray(user?.role_slugs) && user.role_slugs.includes('super-admin');
    const userWarehouseIds = Array.isArray(user?.warehouse_ids)
        ? user.warehouse_ids.map((id) => Number.parseInt(id, 10)).filter((id) => Number.isInteger(id) && id > 0)
        : [];

    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('none');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isAmazonOrder, setIsAmazonOrder] = useState(false);
    const [note, setNote] = useState('');
    const [warehouseCartoons, setWarehouseCartoons] = useState([]);
    const [selectedWarehouseCartoon, setSelectedWarehouseCartoon] = useState('none');
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [lastCheckoutSummary, setLastCheckoutSummary] = useState(null);

    // Dropdown pending orders states
    const [pendingOrders, setPendingOrders] = useState([]);
    const [selectedPendingOrder, setSelectedPendingOrder] = useState('none');

    const barcodeRef = useRef(null);
    const prefillAppliedRef = useRef(false);
    const remoteSelectionHydratedRef = useRef(false);
    const remoteSelectionAppliedRef = useRef(false);

    useEffect(() => {
        setPageTitle('Retail POS');
    }, [setPageTitle]);

    // Fetch live unfulfilled pending orders list on layout mount
    useEffect(() => {
        fetchPendingRemoteOrders()
            .then((orders) => setPendingOrders(orders))
            .catch(() => setPendingOrders([]));
    }, []);

    const getUserWarehousesFallback = useCallback(() => {
        const candidates = Array.isArray(user?.warehouses) ? user.warehouses : [];

        return candidates
            .filter((warehouse) => Number.parseInt(warehouse?.id, 10) > 0)
            .map((warehouse) => ({
                id: Number.parseInt(warehouse.id, 10),
                name: String(warehouse.name ?? ''),
                brands: Array.isArray(warehouse.brands)
                    ? warehouse.brands.filter((brand) => Number.parseInt(brand?.id, 10) > 0)
                    : [],
            }));
    }, [user]);

    useEffect(() => {
        fetchWarehouses()
            .then((data) => {
                let filtered = Array.isArray(data) ? data : [];
                if (!isSuperAdmin && userWarehouseIds.length > 0) {
                    filtered = data.filter((w) => userWarehouseIds.includes(Number(w.id)));
                }

                if (!isSuperAdmin && filtered.length === 0) {
                    filtered = getUserWarehousesFallback();
                }

                setWarehouses(filtered);

                if (!isSuperAdmin && userWarehouseIds.length > 0) {
                    const loginWarehouse = filtered.find((w) => Number(w.id) === userWarehouseIds[0]);
                    if (loginWarehouse) {
                        setSelectedWarehouse(String(loginWarehouse.id));
                        return;
                    }
                }

                if (filtered.length > 0) {
                    setSelectedWarehouse(String(filtered[0].id));
                }
            })
            .catch(() => {
                if (!isSuperAdmin) {
                    const fallback = getUserWarehousesFallback();
                    setWarehouses(fallback);

                    if (fallback.length > 0) {
                        setSelectedWarehouse(String(fallback[0].id));
                    }
                }
            });
    }, [getUserWarehousesFallback, isSuperAdmin, userWarehouseIds]);

    useEffect(() => {
        barcodeRef.current?.focus();
    }, [cart.length]);

    useEffect(() => {
        if (!selectedWarehouse) {
            setWarehouseCartoons([]);
            setSelectedWarehouseCartoon('none');
            return;
        }

        fetchAvailableCartoonsByWarehouse(selectedWarehouse)
            .then((rows) => {
                setWarehouseCartoons(rows);

                if (rows.length === 0) {
                    setSelectedWarehouseCartoon('none');
                    return;
                }

                const stillExists = rows.some((c) => String(c.id) === selectedWarehouseCartoon);
                if (!stillExists) {
                    setSelectedWarehouseCartoon('none');
                }
            })
            .catch(() => {
                setWarehouseCartoons([]);
                setSelectedWarehouseCartoon('none');
            });
    }, [selectedWarehouse, selectedWarehouseCartoon]);

    const selectedRemoteOrder = useMemo(() => {
        if (selectedPendingOrder === 'none') {
            return null;
        }

        return pendingOrders.find((order) => String(order.id) === selectedPendingOrder) || null;
    }, [pendingOrders, selectedPendingOrder]);

    const selectedOrderItems = useMemo(() => {
        return extractSelectedOrderItems(selectedRemoteOrder);
    }, [selectedRemoteOrder]);

    const selectedOrderRequiredQtyByKey = useMemo(() => {
        return selectedOrderItems.reduce((acc, item) => {
            acc[item.matchKey] = (acc[item.matchKey] || 0) + item.quantity;
            return acc;
        }, {});
    }, [selectedOrderItems]);

    const selectedOrderRequiredItems = useMemo(() => {
        const grouped = selectedOrderItems.reduce((acc, item) => {
            const existing = acc[item.matchKey];
            if (existing) {
                existing.quantity += item.quantity;
                return acc;
            }

            acc[item.matchKey] = {
                matchKey: item.matchKey,
                productId: item.productId,
                name: item.name,
                nameKey: item.nameKey,
                color: item.color,
                size: item.size,
                barcode: item.barcode,
                quantity: item.quantity,
            };

            return acc;
        }, {});

        return Object.values(grouped);
    }, [selectedOrderItems]);

    const scannedQtyByOrderKey = useMemo(() => {
        return cart.reduce((acc, item) => {
            const key = item.order_match_key || buildOrderItemKey({
                productId: item.product_id,
                color: item.color,
                size: item.size,
            });

            if (!key) {
                return acc;
            }

            acc[key] = (acc[key] || 0) + Number(item.quantity || 0);
            return acc;
        }, {});
    }, [cart]);

    // Handle approved order selection and reset to scan-driven matching mode.
    const handleSelectPendingOrderChange = (orderIdString) => {
        setSelectedPendingOrder(orderIdString);
        if (orderIdString === 'none') {
            setCart([]);
            setNote('');
            return;
        }

        if (!selectedWarehouse) {
            toast.error('Please select a warehouse before preloading an order.');
            setSelectedPendingOrder('none');
            return;
        }

        const match = pendingOrders.find((order) => String(order.id) === orderIdString);
        if (!match) {
            return;
        }

        setCart([]);
        setNote(match.raw_payload?.notes || match.raw_payload?.comment || '');
        toast.success(`Selected approved order ${match.order_number || match.id}. Scan barcodes to match order items.`);
    };

    useEffect(() => {
        const selection = location?.state?.remoteOrderSelection;
        if (!selection || remoteSelectionHydratedRef.current) {
            return;
        }

        const selectionId = Number.parseInt(selection?.id, 10);
        if (!Number.isInteger(selectionId) || selectionId <= 0) {
            remoteSelectionHydratedRef.current = true;
            return;
        }

        setPendingOrders((previous) => {
            const alreadyPresent = previous.some((order) => Number.parseInt(order?.id, 10) === selectionId);
            if (alreadyPresent) {
                return previous;
            }

            const fallbackOrder = {
                id: selectionId,
                remote_id: Number.parseInt(selection?.remote_id, 10) || null,
                order_number: String(selection?.order_number || '').trim(),
                customer_name: String(selection?.customer_name || '').trim(),
                total: Number.parseFloat(selection?.total || 0) || 0,
                state_tax: Number.parseFloat(selection?.state_tax || 0) || 0,
                stripe_charge: Number.parseFloat(selection?.stripe_charge || 0) || 0,
                delivery_cost: Number.parseFloat(selection?.delivery_cost || 0) || 0,
                processing_fee: Number.parseFloat(selection?.processing_fee || 0) || 0,
                raw_payload: selection?.raw_payload && typeof selection.raw_payload === 'object'
                    ? selection.raw_payload
                    : {},
            };

            return [fallbackOrder, ...previous];
        });

        remoteSelectionHydratedRef.current = true;
    }, [location]);

    useEffect(() => {
        const selection = location?.state?.remoteOrderSelection;
        if (!selection || remoteSelectionAppliedRef.current) {
            return;
        }

        if (!selectedWarehouse) {
            return;
        }

        const selectionId = Number.parseInt(selection?.id, 10);
        if (!Number.isInteger(selectionId) || selectionId <= 0) {
            remoteSelectionAppliedRef.current = true;
            return;
        }

        const match = pendingOrders.find((order) => Number.parseInt(order?.id, 10) === selectionId);
        if (!match) {
            return;
        }

        setSelectedPendingOrder(String(match.id));
        setCart([]);
        setNote(match.raw_payload?.notes || match.raw_payload?.comment || '');
        toast.success(`Selected approved order ${match.order_number || match.id}. Scan barcodes to match order items.`);
        remoteSelectionAppliedRef.current = true;
    }, [location, pendingOrders, selectedWarehouse]);

    useEffect(() => {
        const prefill = location?.state?.remoteOrderPrefill;
        if (!prefill || prefillAppliedRef.current) {
            return;
        }

        if (!selectedWarehouse) {
            return;
        }

        const prefillItems = Array.isArray(prefill.items) ? prefill.items : [];
        if (prefillItems.length === 0) {
            prefillAppliedRef.current = true;
            if (prefill.note) {
                setNote(prefill.note);
            }
            toast.info('Opened from remote order, but no items were provided for POS cart prefill.');
            return;
        }

        prefillAppliedRef.current = true;

        if (prefill.note) {
            setNote(prefill.note);
        }

        const hydrateCartFromPrefill = async () => {
            const warehouseId = Number.parseInt(selectedWarehouse, 10);
            const brandId = selectedBrand !== 'none' ? Number.parseInt(selectedBrand, 10) : null;
            let addedItems = 0;
            let missingBarcodeCount = 0;
            let lookupFailedCount = 0;

            for (const item of prefillItems) {
                const barcode = String(item?.barcode ?? '').trim();
                const requestedQty = Math.max(1, Number.parseInt(item?.quantity ?? 1, 10) || 1);
                const requestedUnitPrice = Number.parseFloat(item?.unit_price ?? 0) || 0;

                if (!barcode) {
                    missingBarcodeCount++;
                    continue;
                }

                try {
                    const product = await lookupBarcode(barcode, warehouseId, brandId);

                    setCart((previous) => {
                        const existing = previous.find((cartItem) => cartItem.stock_id === product.stock_id);
                        const allowedQty = Math.max(1, Math.min(requestedQty, Number(product.available_stock || 1)));
                        const basePrice = requestedUnitPrice > 0 ? requestedUnitPrice : Number(product.unit_price || 0);

                        if (existing) {
                            const nextQty = Math.min(existing.quantity + allowedQty, Number(existing.available_stock || allowedQty));
                            return previous.map((cartItem) => (
                                cartItem.stock_id === product.stock_id
                                    ? { ...cartItem, quantity: nextQty, unit_price: basePrice > 0 ? basePrice : cartItem.unit_price }
                                    : cartItem
                            ));
                        }

                        return [
                            ...previous,
                            {
                                cartKey: `${product.stock_id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
                                stock_id: product.stock_id,
                                product_id: product.product_id,
                                product_name: product.product_name,
                                size: product.size,
                                color: product.color,
                                barcode,
                                quantity: allowedQty,
                                unit_price: basePrice > 0 ? basePrice : Number(product.unit_price || 0),
                                available_stock: Number(product.available_stock || 0),
                                cartoon_id: selectedWarehouseCartoon !== 'none'
                                    ? Number.parseInt(selectedWarehouseCartoon, 10)
                                    : null,
                                cartoons: product.cartoons || [],
                            },
                        ];
                    });

                    addedItems++;
                } catch {
                    // Fail silently
                    lookupFailedCount++;
                }
            }

            if (addedItems > 0) {
                toast.success(`Loaded ${addedItems} item(s) from remote order into POS cart.`);
            }

            if (missingBarcodeCount > 0 || lookupFailedCount > 0) {
                toast.warning(
                    `Some items could not be added automatically. Missing barcode: ${missingBarcodeCount}, not found in stock: ${lookupFailedCount}.`
                );
            }
        };

        hydrateCartFromPrefill();
    }, [location, selectedWarehouse, selectedBrand, selectedWarehouseCartoon]);

    const selectedWarehouseMeta = warehouses.find((warehouse) => String(warehouse.id) === String(selectedWarehouse)) || null;
    const selectedWarehouseBrands = Array.isArray(selectedWarehouseMeta?.brands)
        ? selectedWarehouseMeta.brands.filter((brand) => Number(brand?.id) > 0)
        : [];

    useEffect(() => {
        if (!selectedWarehouse) {
            setSelectedBrand('none');
            return;
        }

        if (selectedWarehouseBrands.length === 0) {
            setSelectedBrand('none');
            return;
        }

        const currentExists = selectedWarehouseBrands.some((brand) => String(brand.id) === selectedBrand);
        if (!currentExists) {
            setSelectedBrand(String(selectedWarehouseBrands[0].id));
        }
    }, [selectedWarehouse, selectedWarehouseBrands, selectedBrand]);

    const applyWarehouseCartoonToCart = (cartoonValue) => {
        setSelectedWarehouseCartoon(cartoonValue);

        const cartoonId = cartoonValue !== 'none' ? Number.parseInt(cartoonValue, 10) : null;
        setCart((prev) =>
            prev.map((item) => ({
                ...item,
                cartoon_id: cartoonId || null,
            }))
        );
    };

    const handleBarcodeScan = useCallback(async (e) => {
        e.preventDefault();
        const code = barcodeInput.trim();
        if (!code) return;

        if (!selectedWarehouse) {
            toast.error('Please select a warehouse first.');
            return;
        }

        if (selectedWarehouseBrands.length > 0 && selectedBrand === 'none') {
            toast.error('Please select a brand first.');
            return;
        }

        setBarcodeInput('');
        setIsLookingUp(true);

        try {
            const product = await lookupBarcode(
                code,
                Number.parseInt(selectedWarehouse, 10),
                selectedBrand !== 'none' ? Number.parseInt(selectedBrand, 10) : null
            );

            const matchedOrderLine = selectedPendingOrder !== 'none'
                ? resolveOrderLineForProduct(product, selectedOrderRequiredItems, scannedQtyByOrderKey)
                : null;

            const orderMatchKey = matchedOrderLine?.matchKey || buildOrderItemKey({
                productId: product.product_id,
                color: product.color,
                size: product.size,
            });

            if (selectedPendingOrder !== 'none') {
                if (!matchedOrderLine) {
                    toast.error('Scanned barcode does not match selected approved order item.');
                    return;
                }

                const requiredQty = Number(selectedOrderRequiredQtyByKey[orderMatchKey] || 0);
                const scannedQty = Number(scannedQtyByOrderKey[orderMatchKey] || 0);

                if (scannedQty >= requiredQty) {
                    toast.warning('Required quantity already scanned for this order item.');
                    return;
                }
            }

            setCart((prev) => {
                const existing = prev.find((item) => item.stock_id === product.stock_id);
                const requiredQty = selectedPendingOrder !== 'none'
                    ? Number(selectedOrderRequiredQtyByKey[orderMatchKey] || 0)
                    : Number.POSITIVE_INFINITY;

                if (existing) {
                    if (existing.quantity >= requiredQty) {
                        toast.warning('Required quantity reached for this order item.');
                        return prev;
                    }

                    if (existing.quantity >= existing.available_stock) {
                        toast.warning(`Only ${existing.available_stock} in stock.`);
                        return prev;
                    }

                    return prev.map((item) =>
                        item.stock_id === product.stock_id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }

                if (requiredQty <= 0) {
                    toast.error('Scanned barcode does not match selected approved order item.');
                    return prev;
                }

                return [
                    ...prev,
                    {
                        cartKey: `${product.stock_id}-${Date.now()}`,
                        stock_id: product.stock_id,
                        product_id: product.product_id,
                        product_name: product.product_name,
                        size: product.size,
                        color: product.color,
                        barcode: code,
                        quantity: 1,
                        unit_price: product.unit_price,
                        available_stock: product.available_stock,
                        order_match_key: orderMatchKey,
                        cartoon_id: selectedWarehouseCartoon !== 'none'
                            ? Number.parseInt(selectedWarehouseCartoon, 10)
                            : null,
                        cartoons: product.cartoons || [],
                    },
                ];
            });

            toast.success(`Added: ${product.product_name}`);
        } catch (err) {
            toast.error(err.message || 'Product not found.');
        } finally {
            setIsLookingUp(false);
            barcodeRef.current?.focus();
        }
    }, [
        barcodeInput,
        scannedQtyByOrderKey,
        selectedOrderRequiredItems,
        selectedOrderRequiredQtyByKey,
        selectedPendingOrder,
        selectedWarehouse,
        selectedWarehouseCartoon,
        selectedBrand,
        selectedWarehouseBrands,
    ]);

    const updateQty = (cartKey, delta) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.cartKey !== cartKey) return item;
                const next = item.quantity + delta;
                if (next <= 0) return item;
                if (next > item.available_stock) {
                    toast.warning(`Max available: ${item.available_stock}`);
                    return item;
                }
                return { ...item, quantity: next };
            })
        );
    };

    const updatePrice = (cartKey, value) => {
        setCart((prev) =>
            prev.map((item) =>
                item.cartKey === cartKey
                    ? { ...item, unit_price: Number.parseFloat(value) || 0 }
                    : item
            )
        );
    };

    const updateCartoon = (cartKey, cartoonId) => {
        setCart((prev) =>
            prev.map((item) =>
                item.cartKey === cartKey
                    ? { ...item, cartoon_id: cartoonId && cartoonId !== 'none' ? Number.parseInt(cartoonId, 10) : null }
                    : item
            )
        );
    };

    const removeItem = (cartKey) => {
        setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
    };

    const clearCart = () => {
        setCart([]);
        setSelectedPendingOrder('none');
    };

    const filteredWarehouseCartoons = (() => {
        if (cart.length === 0) {
            return warehouseCartoons;
        }

        const cartoonIdSets = cart
            .map((item) => new Set((item.cartoons || []).map((c) => Number(c.id)).filter((id) => Number.isInteger(id) && id > 0)))
            .filter((set) => set.size > 0);

        if (cartoonIdSets.length !== cart.length) {
            return [];
        }

        const intersection = [...cartoonIdSets[0]].filter((id) => (
            cartoonIdSets.every((set) => set.has(id))
        ));

        if (intersection.length === 0) {
            return [];
        }

        return warehouseCartoons.filter((cartoon) => intersection.includes(Number(cartoon.id)));
    })();

    useEffect(() => {
        if (selectedWarehouseCartoon === 'none') {
            return;
        }

        const stillAvailable = filteredWarehouseCartoons.some(
            (cartoon) => String(cartoon.id) === selectedWarehouseCartoon
        );

        if (!stillAvailable) {
            setSelectedWarehouseCartoon('none');
        }
    }, [filteredWarehouseCartoons, selectedWarehouseCartoon]);

    const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    // Order-level charges come from the matched remote order and are added on top of product cost.
    const orderCharges = {
        state_tax: Number.parseFloat(selectedRemoteOrder?.state_tax || 0) || 0,
        delivery_cost: Number.parseFloat(selectedRemoteOrder?.delivery_cost || 0) || 0,
        stripe_charge: Number.parseFloat(selectedRemoteOrder?.stripe_charge || 0) || 0,
        processing_fee: Number.parseFloat(selectedRemoteOrder?.processing_fee || 0) || 0,
    };
    const orderChargesTotal = orderCharges.state_tax + orderCharges.delivery_cost + orderCharges.stripe_charge + orderCharges.processing_fee;
    const grandTotal = subtotal + orderChargesTotal;

    const handlePrintCheckoutSummary = () => {
        if (!lastCheckoutSummary) {
            return;
        }

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            toast.error('Unable to open print window. Please allow popups and try again.');
            return;
        }

        const itemRows = (lastCheckoutSummary.items || [])
            .map((item) => `
                <tr>
                    <td>${escapeHtml(item.product_name)}</td>
                    <td style="text-align:right;">${escapeHtml(item.quantity)}</td>
                    <td style="text-align:right;">${formatCurrency(item.unit_price)}</td>
                </tr>
            `)
            .join('');

        printWindow.document.open();
        printWindow.document.write(`
            <!doctype html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>Retail Checkout ${escapeHtml(lastCheckoutSummary.reference_number || '')}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 12px; color: #111; margin: 0; }
                        h1 { font-size: 20px; margin: 0 0 8px; }
                        p { margin: 4px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
                        th, td { padding: 4px 6px; border-bottom: 1px solid #ddd; }
                        th { text-align: left; }
                    </style>
                </head>
                <body>
                    <h1>Retail Checkout Receipt</h1>
                    <p><strong>Order:</strong> ${escapeHtml(lastCheckoutSummary.order_number || 'N/A')}</p>
                    <p><strong>Reference:</strong> ${escapeHtml(lastCheckoutSummary.reference_number || '')}</p>
                    <p><strong>Payment:</strong> ${escapeHtml(lastCheckoutSummary.payment_method || '')}</p>
                    ${lastCheckoutSummary.shipping_level ? `<p><strong>Shipping Level:</strong> ${escapeHtml(lastCheckoutSummary.shipping_carrier ? `${lastCheckoutSummary.shipping_carrier} - ${lastCheckoutSummary.shipping_level}` : lastCheckoutSummary.shipping_level)}</p>` : ''}
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th style="text-align:right;">Qty</th>
                                <th style="text-align:right;">Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemRows}
                        </tbody>
                    </table>
                    <p style="margin-top:12px; font-weight:700;">Grand Total: ${formatCurrency(lastCheckoutSummary.total_amount)}</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    };

    const handleCheckout = async () => {
        if (!selectedWarehouse) {
            toast.error('Select a warehouse.');
            return;
        }

        if (cart.length === 0) {
            toast.error('Cart is empty.');
            return;
        }

        setIsSubmitting(true);
        try {
            const checkoutItems = cart.map((item) => ({
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
            }));

            const sale = await createRetailSale({
                warehouse_id: Number.parseInt(selectedWarehouse, 10),
                brand_id: selectedBrand !== 'none' ? Number.parseInt(selectedBrand, 10) : null,
                payment_method: paymentMethod,
                is_amazon_order: isAmazonOrder,
                note: note || null,
                remote_order_id: selectedPendingOrder !== 'none' ? Number.parseInt(selectedPendingOrder, 10) : null,
                items: cart.map((item) => ({
                    stock_id: item.stock_id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    barcode: item.barcode,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    cartoon_id: item.cartoon_id,
                })),
            });

            let shippingLabel = null;

            if (selectedPendingOrder !== 'none') {
                const pendingOrderId = Number.parseInt(selectedPendingOrder, 10);
                try {
                    await updateRemoteOrderStatus(pendingOrderId, 'ready for shipment');
                } catch (statusError) {
                    toast.warning(statusError.message || 'Sale created, but failed to update remote order status to ready for shipment.');
                }

                try {
                    const booking = await bookRemoteOrderVeeqoShipment(pendingOrderId);
                    const bookedOrder = booking?.order;
                    if (bookedOrder?.shipping_service) {
                        shippingLabel = {
                            shipping_carrier: bookedOrder.shipping_carrier,
                            shipping_level: bookedOrder.shipping_service,
                            tracking_url: bookedOrder.tracking_url,
                            label_url: normalizeVeeqoLabelUrl(bookedOrder.label_url),
                            label_file_url: bookedOrder.label_file_url || null,
                        };
                        toast.success(`Shipment booked with Veeqo. Label purchased: ${bookedOrder.shipping_service}.`);
                    } else {
                        toast.success('Shipment booked with Veeqo (UPS Ground).');
                    }
                } catch (bookingError) {
                    toast.warning(bookingError.message || 'Sale created, but the Veeqo shipment booking failed.');
                }

                // The booking call above can time out client-side while it keeps running on the
                // server (label purchase takes several seconds), so re-fetch the order to make
                // sure the popup always reflects the real Veeqo shipping level once it's saved.
                if (!shippingLabel) {
                    try {
                        const latest = await fetchRemoteOrderById(pendingOrderId);
                        const latestOrder = latest?.order;
                        if (latestOrder?.shipping_service) {
                            shippingLabel = {
                                shipping_carrier: latestOrder.shipping_carrier,
                                shipping_level: latestOrder.shipping_service,
                                tracking_url: latestOrder.tracking_url,
                                label_url: normalizeVeeqoLabelUrl(latestOrder.label_url),
                                label_file_url: latestOrder.label_file_url || null,
                            };
                        }
                    } catch {
                        // Ignore - the popup will simply omit shipping info in this case.
                    }
                }
            }

            setLastCheckoutSummary({
                reference_number: sale.reference_number,
                product_subtotal: subtotal,
                charges: orderCharges,
                total_amount: grandTotal,
                payment_method: paymentMethod,
                items: checkoutItems,
                order_number: selectedRemoteOrder?.order_number || 'N/A',
                ...shippingLabel,
            });
            setCheckoutModalOpen(true);

            toast.success(`Sale complete. Ref: ${sale.reference_number}`);
            setCart([]);
            setNote('');
            setIsAmazonOrder(false);
            setSelectedPendingOrder('none');
            barcodeRef.current?.focus();
        } catch (err) {
            toast.error(err.message || 'Checkout failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
                <Card>
                    <CardContent className="pt-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label>Warehouse</Label>
                                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                    <SelectTrigger disabled={!isSuperAdmin}>
                                        <SelectValue placeholder="Select warehouse..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((warehouse) => (
                                            <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                                {warehouse.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {!isSuperAdmin && selectedWarehouse && (
                                    <p className="text-xs text-muted-foreground">Using your login warehouse</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Brand</Label>
                                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Unassigned</SelectItem>
                                        {selectedWarehouseBrands.map((brand) => (
                                            <SelectItem key={brand.id} value={String(brand.id)}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Added Dropdown: Select Active Pending Order */}
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="flex items-center gap-1.5">
                                    <ClipboardList className="h-3.5 w-3.5" />
                                    Approved Order List
                                </Label>
                                <Select value={selectedPendingOrder} onValueChange={handleSelectPendingOrderChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a pending order to fill cart..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Clear / Manual Scan Selection</SelectItem>
                                        {pendingOrders.map((order) => (
                                            <SelectItem key={order.id} value={String(order.id)}>
                                                {order.order_number} — {order.customer_name} ({formatCurrency(order.total)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {selectedPendingOrder !== 'none' && (
                                    <div className="rounded-md border bg-muted/30 p-2 text-xs">
                                        <p className="mb-1 font-medium">Required items from selected order</p>
                                        {selectedOrderRequiredItems.length === 0 ? (
                                            <p className="text-muted-foreground">No valid order items found in this order payload.</p>
                                        ) : (
                                            <div className="space-y-1">
                                                {selectedOrderRequiredItems.map((item) => {
                                                    const scannedQty = Number(scannedQtyByOrderKey[item.matchKey] || 0);
                                                    return (
                                                        <div key={item.matchKey} className="flex items-center justify-between gap-2">
                                                            <span className="truncate">
                                                                {item.name}
                                                                {item.color ? ` | Color: ${item.color}` : ''}
                                                                {item.size ? ` | Size: ${item.size}` : ''}
                                                            </span>
                                                            <span className="font-mono text-muted-foreground">
                                                                {item.barcode || 'No barcode'}
                                                            </span>
                                                            <span className="font-mono text-muted-foreground">
                                                                {scannedQty}/{item.quantity}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <Label>Scan Barcode</Label>
                                <form onSubmit={handleBarcodeScan} className="flex gap-2">
                                    <Input
                                        ref={barcodeRef}
                                        placeholder="Scan barcode and press Enter"
                                        value={barcodeInput}
                                        onChange={(e) => setBarcodeInput(e.target.value)}
                                        disabled={isLookingUp || !selectedWarehouse}
                                        autoComplete="off"
                                        className="font-mono"
                                    />
                                    <Button type="submit" disabled={isLookingUp || !barcodeInput.trim()}>
                                        <BarcodeIcon className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShoppingCart className="h-5 w-5" />
                            Cart
                        </CardTitle>
                        {cart.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearCart}>
                                <Trash2 className="mr-1 h-4 w-4" /> Clear
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {cart.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Scan a barcode to add product.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {cart.map((item) => (
                                    <div key={item.cartKey} className="space-y-2 rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{item.product_name}</p>
                                                {(item.size || item.color) && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {[item.size, item.color].filter(Boolean).join(' · ')}
                                                    </p>
                                                )}
                                                <p className="font-mono text-xs text-muted-foreground">{item.barcode}</p>
                                            </div>

                                            <div className="relative w-24">
                                                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                                    $
                                                </span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unit_price}
                                                    onChange={(e) => updatePrice(item.cartKey, e.target.value)}
                                                    className="h-8 pl-5 text-right text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.cartKey, -1)}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.cartKey, 1)}>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            <div className="w-24 text-right text-sm font-semibold">
                                                {formatCurrency(item.unit_price * item.quantity)}
                                            </div>

                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.cartKey)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {item.cartoons && item.cartoons.length > 0 && (
                                            <Select value={item.cartoon_id ? String(item.cartoon_id) : 'none'} onValueChange={(val) => updateCartoon(item.cartKey, val)}>
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Select carton to deduct from..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No carton (stock only)</SelectItem>
                                                    {item.cartoons.map((cartoon) => (
                                                        <SelectItem key={cartoon.id} value={String(cartoon.id)}>
                                                            {cartoon.cartoon_number} (Qty: {cartoon.available_quantity})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="h-fit lg:sticky lg:top-4">
                <CardHeader>
                    <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 border-b pb-3">
                        <div className="grid grid-cols-12 gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            <span className="col-span-5">Product</span>
                            <span className="col-span-3 text-right">Unit</span>
                            <span className="col-span-2 text-right">Qty</span>
                            <span className="col-span-2 text-right">Total</span>
                        </div>

                        {cart.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No items yet.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {cart.map((item) => (
                                    <div key={`summary-${item.cartKey}`} className="grid grid-cols-12 gap-2 text-sm">
                                        <span className="col-span-5 truncate" title={item.product_name}>{item.product_name}</span>
                                        <span className="col-span-3 text-right">{formatCurrency(item.unit_price)}</span>
                                        <span className="col-span-2 text-right">{item.quantity}</span>
                                        <span className="col-span-2 text-right font-semibold">{formatCurrency(item.unit_price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between pt-1 text-xs text-muted-foreground">
                            <span>Items</span>
                            <span>{cart.length}</span>
                        </div>
                    </div>

                    <div className="space-y-1 border-b pb-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Product Subtotal</span>
                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        {selectedRemoteOrder && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">State Tax</span>
                                    <span>{formatCurrency(orderCharges.state_tax)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery Charge</span>
                                    <span>{formatCurrency(orderCharges.delivery_cost)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Stripe Charge</span>
                                    <span>{formatCurrency(orderCharges.stripe_charge)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Processing Fee</span>
                                    <span>{formatCurrency(orderCharges.processing_fee)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(grandTotal)}</span>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="transfer">Bank Transfer</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Amazon Order</Label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 text-sm">
                                <input
                                    type="radio"
                                    name="isAmazonOrder"
                                    checked={isAmazonOrder === true}
                                    onChange={() => setIsAmazonOrder(true)}
                                />
                                Yes
                            </label>
                            <label className="flex items-center gap-1.5 text-sm">
                                <input
                                    type="radio"
                                    name="isAmazonOrder"
                                    checked={isAmazonOrder === false}
                                    onChange={() => setIsAmazonOrder(false)}
                                />
                                No
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Warehouse Carton</Label>
                        <Select value={selectedWarehouseCartoon} onValueChange={applyWarehouseCartoonToCart}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select available carton..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No carton (stock only)</SelectItem>
                                {filteredWarehouseCartoons.map((cartoon) => (
                                    <SelectItem key={cartoon.id} value={String(cartoon.id)}>
                                        {cartoon.cartoon_number} (Qty: {Number(cartoon.quantity || 0)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {cart.length > 0 && filteredWarehouseCartoons.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                No common carton contains all products currently in cart.
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Note (optional)</Label>
                        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note" />
                    </div>

                    <Button className="w-full" size="lg" disabled={cart.length === 0 || !selectedWarehouse || isSubmitting} onClick={handleCheckout}>
                        {isSubmitting ? 'Processing...' : `Checkout ${formatCurrency(grandTotal)}`}
                    </Button>
                </CardContent>
            </Card>
            </div>

            <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Checkout Complete</DialogTitle>
                        <DialogDescription>
                            Reference: {lastCheckoutSummary?.reference_number || '-'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 text-sm">
                        <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                            <p>
                                <span className="font-medium">Order:</span> {lastCheckoutSummary?.order_number || 'N/A'}
                            </p>
                            <p>
                                <span className="font-medium">Payment:</span> {lastCheckoutSummary?.payment_method || '-'}
                            </p>
                            {(lastCheckoutSummary?.shipping_level || lastCheckoutSummary?.label_url) && (
                                <div className="sm:col-span-2">
                                    <ShippingLabelSection
                                        carrier={lastCheckoutSummary.shipping_carrier}
                                        service={lastCheckoutSummary.shipping_level}
                                        trackingUrl={lastCheckoutSummary.tracking_url}
                                        labelUrl={lastCheckoutSummary.label_url}
                                        labelFileUrl={lastCheckoutSummary.label_file_url}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="rounded-md border">
                            <div className="grid grid-cols-12 border-b bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                <span className="col-span-6">Product</span>
                                <span className="col-span-2 text-right">Qty</span>
                                <span className="col-span-2 text-right">Unit</span>
                                <span className="col-span-2 text-right">Total</span>
                            </div>
                            <div className="max-h-64 overflow-auto">
                                {(lastCheckoutSummary?.items || []).map((item, index) => (
                                    <div key={`${item.product_name}-${index}`} className="grid grid-cols-12 px-3 py-2 text-sm">
                                        <span className="col-span-6 truncate" title={item.product_name}>{item.product_name}</span>
                                        <span className="col-span-2 text-right">{item.quantity}</span>
                                        <span className="col-span-2 text-right">{formatCurrency(item.unit_price)}</span>
                                        <span className="col-span-2 text-right font-semibold">{formatCurrency(Number(item.quantity || 0) * Number(item.unit_price || 0))}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Product Subtotal</span>
                                <span>{formatCurrency(lastCheckoutSummary?.product_subtotal || 0)}</span>
                            </div>
                            {lastCheckoutSummary?.charges && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">State Tax</span>
                                        <span>{formatCurrency(lastCheckoutSummary.charges.state_tax)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Delivery Charge</span>
                                        <span>{formatCurrency(lastCheckoutSummary.charges.delivery_cost)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Stripe Charge</span>
                                        <span>{formatCurrency(lastCheckoutSummary.charges.stripe_charge)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Processing Fee</span>
                                        <span>{formatCurrency(lastCheckoutSummary.charges.processing_fee)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <p className="text-right text-base font-semibold">
                            Grand Total: {formatCurrency(lastCheckoutSummary?.total_amount || 0)}
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handlePrintCheckoutSummary}>
                            <Printer className="mr-1.5 h-4 w-4" />
                            Print
                        </Button>
                        <Button type="button" onClick={() => setCheckoutModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}