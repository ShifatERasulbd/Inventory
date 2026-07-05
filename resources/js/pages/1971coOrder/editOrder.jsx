import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';

import { fetchRemoteOrder, updateRemoteOrder } from './api';

function formatMoney(value) {
    return Number(value || 0).toFixed(2);
}

function normalizeCourierCompany(value) {
    const normalized = String(value || '').trim().toLowerCase();

    if (normalized === 'ups') {
        return 'UPS';
    }

    if (normalized === 'shipstation') {
        return 'ShipStation';
    }

    return '';
}

function buildRetailPosPrefill(order, fallbackForm = {}) {
    const raw = order?.raw_payload || {};
    const rawItems = Array.isArray(raw?.items) ? raw.items : [];

    const items = rawItems.map((item, index) => {
        const barcode = String(
            item?.barcode
            ?? item?.barCode
            ?? item?.sku
            ?? item?.product_code
            ?? ''
        ).trim();

        return {
            key: String(item?.lineId ?? item?.line_id ?? item?.id ?? index),
            name: String(item?.name ?? item?.title ?? `Item ${index + 1}`),
            barcode,
            quantity: Math.max(1, Number.parseInt(item?.quantity ?? item?.qty ?? 1, 10) || 1),
            unit_price: Number.parseFloat(
                item?.priceValue
                ?? item?.price
                ?? item?.unit_price
                ?? item?.unitPrice
                ?? 0
            ) || 0,
        };
    });

    const customerName = [
        raw?.first_name,
        raw?.last_name,
    ].filter(Boolean).join(' ').trim() || order?.customer_name || fallbackForm?.customer_name || '';

    return {
        source: 'remote-order',
        remote_order_id: order?.remote_id ?? order?.id,
        order_number: order?.order_number || fallbackForm?.order_number || '',
        customer_name: customerName,
        note: `Imported from 1971co order ${order?.order_number || ''}${customerName ? ` | Customer: ${customerName}` : ''}`.trim(),
        items,
    };
}

export default function EditRemoteOrderPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [record, setRecord] = useState(null);
    const [form, setForm] = useState({
        order_number: '',
        customer_name: '',
        status: '',
        courier_company: '',
        total: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        notes: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setPageTitle('Edit 1971co Order');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadOrder() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const payload = await fetchRemoteOrder(id);
                if (!ignore) {
                    const nextOrder = payload?.order || null;
                    const raw = nextOrder?.raw_payload || {};

                    setRecord(nextOrder);
                    setForm({
                        order_number: nextOrder?.order_number || raw?.order_number || '',
                        customer_name: nextOrder?.customer_name || '',
                        status: nextOrder?.status || raw?.status || 'pending',
                        courier_company: normalizeCourierCompany(
                            nextOrder?.courier_company || raw?.courier_company || raw?.courier_service
                        ),
                        total: String(nextOrder?.total ?? raw?.total ?? ''),
                        first_name: raw?.first_name || '',
                        last_name: raw?.last_name || '',
                        email: raw?.email || '',
                        phone: raw?.phone || '',
                        address_line_1: raw?.address_line_1 || '',
                        address_line_2: raw?.address_line_2 || '',
                        city: raw?.city || '',
                        state: raw?.state || '',
                        postal_code: raw?.postal_code || '',
                        country: raw?.country || '',
                        notes: raw?.notes || '',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load remote order.');
                    toast.error(error.message || 'Failed to load remote order.', {
                        style: { color: '#dc2626' },
                    });
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadOrder();

        return () => {
            ignore = true;
        };
    }, [id]);

    function onChangeField(field, value) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setFieldErrors((previous) => {
            if (!previous[field]) {
                return previous;
            }

            const next = { ...previous };
            delete next[field];
            return next;
        });
    }

    async function onSave(event) {
        event.preventDefault();

        setIsSaving(true);
        setFieldErrors({});
        setErrorMessage('');

        const wasProcessing = String(record?.status || '').trim().toLowerCase() === 'processing';

        try {
            const payload = {
                order_number: form.order_number.trim(),
                customer_name: form.customer_name.trim(),
                status: form.status.trim(),
                courier_company: form.courier_company.trim(),
                total: form.total === '' ? null : Number(form.total),
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                address_line_1: form.address_line_1.trim(),
                address_line_2: form.address_line_2.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                postal_code: form.postal_code.trim(),
                country: form.country.trim(),
                notes: form.notes.trim(),
            };

            const response = await updateRemoteOrder(id, payload);
            const nextOrder = response?.order || record;
            const raw = nextOrder?.raw_payload || {};

            setRecord(nextOrder);
            setForm((previous) => ({
                ...previous,
                order_number: nextOrder?.order_number || previous.order_number,
                customer_name: nextOrder?.customer_name || previous.customer_name,
                status: nextOrder?.status || previous.status,
                courier_company: normalizeCourierCompany(
                    nextOrder?.courier_company || raw?.courier_company || raw?.courier_service || previous.courier_company
                ),
                total: String(nextOrder?.total ?? previous.total),
                first_name: raw?.first_name || previous.first_name,
                last_name: raw?.last_name || previous.last_name,
                email: raw?.email || previous.email,
                phone: raw?.phone || previous.phone,
                address_line_1: raw?.address_line_1 || previous.address_line_1,
                address_line_2: raw?.address_line_2 || previous.address_line_2,
                city: raw?.city || previous.city,
                state: raw?.state || previous.state,
                postal_code: raw?.postal_code || previous.postal_code,
                country: raw?.country || previous.country,
                notes: raw?.notes || previous.notes,
            }));

            toast.success(response?.message || 'Order updated successfully.', {
                style: { color: '#16a34a' },
            });

            const isProcessing = String(nextOrder?.status || form.status || '').trim().toLowerCase() === 'processing';
            if (isProcessing && !wasProcessing) {
                navigate('/retail', {
                    state: {
                        remoteOrderPrefill: buildRetailPosPrefill(nextOrder, form),
                    },
                });
                return;
            }
        } catch (error) {
            setFieldErrors(error?.payload?.errors || {});
            const message = error.message || 'Failed to update remote order.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSaving(false);
        }
    }

    const order = record?.raw_payload || {};
    const items = Array.isArray(order?.items) ? order.items : [];
    const customerName = useMemo(() => {
        const fullName = `${order?.first_name || ''} ${order?.last_name || ''}`.trim();
        return fullName || record?.customer_name || '-';
    }, [order, record]);

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading remote order...</p>;
    }

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">Remote Order {record?.order_number || `#${id}`}</h2>
                    <p className="text-sm text-muted-foreground">Synced from 1971co and stored in the local Inventory database.</p>
                </div>
                <Button type="button" variant="outline" onClick={() => navigate('/remote-orders')}>
                    Back to Orders
                </Button>
            </div>

            <form onSubmit={onSave} className="space-y-5">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Form</CardTitle>
                        <CardDescription>Update local 1971co order data saved in Inventory.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Order Number</label>
                            <input
                                value={form.order_number}
                                onChange={(event) => onChangeField('order_number', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.order_number && <p className="mt-1 text-xs text-destructive">{fieldErrors.order_number[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Status</label>
                            <select
                                value={form.status}
                                onChange={(event) => onChangeField('status', event.target.value)}
                                className="h-9 w-full rounded-md border bg-white px-3 text-sm"
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            {fieldErrors.status && <p className="mt-1 text-xs text-destructive">{fieldErrors.status[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Courier Company</label>
                            <select
                                value={form.courier_company}
                                onChange={(event) => onChangeField('courier_company', event.target.value)}
                                className="h-9 w-full rounded-md border bg-white px-3 text-sm"
                            >
                                <option value="">Select courier</option>
                                <option value="UPS">UPS</option>
                                <option value="ShipStation">ShipStation</option>
                            </select>
                            {fieldErrors.courier_company && <p className="mt-1 text-xs text-destructive">{fieldErrors.courier_company[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Customer Name</label>
                            <input
                                value={form.customer_name}
                                onChange={(event) => onChangeField('customer_name', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.customer_name && <p className="mt-1 text-xs text-destructive">{fieldErrors.customer_name[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Total</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.total}
                                onChange={(event) => onChangeField('total', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.total && <p className="mt-1 text-xs text-destructive">{fieldErrors.total[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">First Name</label>
                            <input
                                value={form.first_name}
                                onChange={(event) => onChangeField('first_name', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.first_name && <p className="mt-1 text-xs text-destructive">{fieldErrors.first_name[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Last Name</label>
                            <input
                                value={form.last_name}
                                onChange={(event) => onChangeField('last_name', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.last_name && <p className="mt-1 text-xs text-destructive">{fieldErrors.last_name[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(event) => onChangeField('email', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.email && <p className="mt-1 text-xs text-destructive">{fieldErrors.email[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Phone</label>
                            <input
                                value={form.phone}
                                onChange={(event) => onChangeField('phone', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.phone && <p className="mt-1 text-xs text-destructive">{fieldErrors.phone[0]}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium">Address Line 1</label>
                            <input
                                value={form.address_line_1}
                                onChange={(event) => onChangeField('address_line_1', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.address_line_1 && <p className="mt-1 text-xs text-destructive">{fieldErrors.address_line_1[0]}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium">Address Line 2</label>
                            <input
                                value={form.address_line_2}
                                onChange={(event) => onChangeField('address_line_2', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.address_line_2 && <p className="mt-1 text-xs text-destructive">{fieldErrors.address_line_2[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">City</label>
                            <input
                                value={form.city}
                                onChange={(event) => onChangeField('city', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.city && <p className="mt-1 text-xs text-destructive">{fieldErrors.city[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">State</label>
                            <input
                                value={form.state}
                                onChange={(event) => onChangeField('state', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.state && <p className="mt-1 text-xs text-destructive">{fieldErrors.state[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Postal Code</label>
                            <input
                                value={form.postal_code}
                                onChange={(event) => onChangeField('postal_code', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.postal_code && <p className="mt-1 text-xs text-destructive">{fieldErrors.postal_code[0]}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Country</label>
                            <input
                                value={form.country}
                                onChange={(event) => onChangeField('country', event.target.value)}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                            />
                            {fieldErrors.country && <p className="mt-1 text-xs text-destructive">{fieldErrors.country[0]}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium">Notes</label>
                            <textarea
                                rows={4}
                                value={form.notes}
                                onChange={(event) => onChangeField('notes', event.target.value)}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                            {fieldErrors.notes && <p className="mt-1 text-xs text-destructive">{fieldErrors.notes[0]}</p>}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => navigate('/remote-orders')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>

           
            <Card>
                <CardHeader>
                    <CardTitle>Items</CardTitle>
                    <CardDescription>Products included in the synced remote order.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {items.length === 0 && <p className="text-sm text-muted-foreground">No items available.</p>}
                        {items.map((item, index) => (
                            <div key={item.lineId || `${item.productId || 'item'}-${index}`} className="rounded-md border p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-medium">{item.name || `Item ${index + 1}`}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Qty: {item.quantity || 0}
                                            {item.selectedColor ? ` | Color: ${item.selectedColor}` : ''}
                                            {item.selectedSize ? ` | Size: ${item.selectedSize}` : ''}
                                        </p>
                                    </div>
                                    <p className="font-medium">{formatMoney(item.priceValue)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
