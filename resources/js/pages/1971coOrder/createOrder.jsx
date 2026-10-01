import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import Preloader from '@/components/Preloader';

import { createRemoteOrder, fetchProductOptions } from './api';

const STATUS_OPTIONS = ['pending', 'waiting for shipment', 'ready for shipment', 'shipped', 'delivered', 'cancelled', 'refunded'];

function emptyItem() {
    return { name: '', color_id: '', size_id: '', quantity: 1, price: '' };
}

export default function CreateRemoteOrderPage({
    orderFrom = 'amazon',
    pageTitle = 'Create Amazon Order',
    heading = 'New Amazon Order',
    backPath = '/amazon-orders',
    sourceLabel = 'Amazon',
} = {}) {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [variants, setVariants] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [form, setForm] = useState({
        order_number: '',
        status: 'pending',
        customer_name: '',
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

    const [items, setItems] = useState([emptyItem()]);

    useEffect(() => {
        setPageTitle(pageTitle);
    }, [setPageTitle, pageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadOptions() {
            setIsLoadingOptions(true);

            try {
                const payload = await fetchProductOptions();
                if (!ignore) {
                    setVariants(Array.isArray(payload?.variants) ? payload.variants : []);
                }
            } catch (error) {
                if (!ignore) {
                    toast.error(error.message || 'Failed to load product options.');
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
    }, []);

    const productNames = useMemo(() => {
        const names = new Set();
        variants.forEach((variant) => {
            if (variant?.name) names.add(variant.name);
        });
        return Array.from(names).sort((a, b) => a.localeCompare(b));
    }, [variants]);

    function colorsForProduct(name) {
        const seen = new Map();
        variants
            .filter((variant) => variant.name === name && variant.color_id)
            .forEach((variant) => {
                seen.set(String(variant.color_id), variant.color_name || `Color #${variant.color_id}`);
            });
        return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
    }

    function sizesForProduct(name, colorId) {
        const seen = new Map();
        variants
            .filter((variant) => (
                variant.name === name
                && variant.size_id
                && (colorId ? String(variant.color_id) === String(colorId) : true)
            ))
            .forEach((variant) => {
                seen.set(String(variant.size_id), variant.size_name || `Size #${variant.size_id}`);
            });
        return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
    }

    function findVariant(name, colorId, sizeId) {
        return variants.find((variant) => (
            variant.name === name
            && (colorId ? String(variant.color_id) === String(colorId) : !variant.color_id)
            && (sizeId ? String(variant.size_id) === String(sizeId) : !variant.size_id)
        )) || null;
    }

    function updateField(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
    }

    function updateItem(index, field, value) {
        setItems((previous) => previous.map((item, i) => {
            if (i !== index) return item;

            const next = { ...item, [field]: value };

            if (field === 'name') {
                next.color_id = '';
                next.size_id = '';
            } else if (field === 'color_id') {
                next.size_id = '';
            }

            if (field === 'name' || field === 'color_id' || field === 'size_id') {
                const variant = findVariant(next.name, next.color_id, next.size_id);
                if (variant && variant.selling_price && !item.price) {
                    next.price = String(variant.selling_price);
                }
            }

            return next;
        }));
    }

    function addItem() {
        setItems((previous) => [...previous, emptyItem()]);
    }

    function removeItem(index) {
        setItems((previous) => (previous.length > 1 ? previous.filter((_, i) => i !== index) : previous));
    }

    const itemsSubtotal = useMemo(() => items.reduce((sum, item) => {
        const qty = Number.parseInt(item.quantity, 10) || 0;
        const price = Number.parseFloat(item.price) || 0;
        return sum + (qty * price);
    }, 0), [items]);

    function handleUseAsTotal() {
        updateField('total', itemsSubtotal.toFixed(2));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage('');

        if (!form.customer_name.trim() && !form.first_name.trim() && !form.last_name.trim()) {
            setErrorMessage('Enter a customer name for this order.');
            return;
        }

        const cleanedItems = items
            .filter((item) => item.name.trim() !== '')
            .map((item) => {
                const variant = findVariant(item.name, item.color_id, item.size_id);
                return {
                    name: item.name.trim(),
                    selected_color: variant?.color_name || '',
                    selected_size: variant?.size_name || '',
                    quantity: Number.parseInt(item.quantity, 10) || 1,
                    price: Number.parseFloat(item.price) || 0,
                };
            });

        if (cleanedItems.length === 0) {
            setErrorMessage('Add at least one product to this order.');
            return;
        }

        setIsSaving(true);

        try {
            await createRemoteOrder({
                order_from: orderFrom,
                order_number: form.order_number.trim(),
                customer_name: form.customer_name.trim(),
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
                status: form.status,
                notes: form.notes.trim(),
                items: cleanedItems,
            });

            toast.success(`${sourceLabel} order created successfully.`);
            navigate(backPath);
        } catch (error) {
            const message = error.message || 'Failed to create order.';
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoadingOptions) {
        return (
            <div className="relative min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl bg-background">
                <Preloader message="Loading product options..." fullScreen={false} />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">{heading}</h2>
                    <p className="text-sm text-muted-foreground">
                        Manually create an order in the local Inventory database.
                    </p>
                </div>
                <Button type="button" variant="outline" onClick={() => navigate(backPath)}>
                    Back to Orders
                </Button>
            </div>

            {!!errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>Fill in the details for the new {sourceLabel} order.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label>Order Number</Label>
                        <Input value={form.order_number} onChange={(e) => updateField('order_number', e.target.value)} placeholder="Auto-generated if left blank" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <select
                            value={form.status}
                            onChange={(e) => updateField('status', e.target.value)}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                        >
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Customer Name</Label>
                        <Input value={form.customer_name} onChange={(e) => updateField('customer_name', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Total</Label>
                        <Input type="number" min="0" step="0.01" value={form.total} onChange={(e) => updateField('total', e.target.value)} placeholder="Auto-calculated if left blank" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>First Name</Label>
                        <Input value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Last Name</Label>
                        <Input value={form.last_name} onChange={(e) => updateField('last_name', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Email</Label>
                        <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Phone</Label>
                        <Input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label>Address Line 1</Label>
                        <Input value={form.address_line_1} onChange={(e) => updateField('address_line_1', e.target.value)} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label>Address Line 2</Label>
                        <Input value={form.address_line_2} onChange={(e) => updateField('address_line_2', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>City</Label>
                        <Input value={form.city} onChange={(e) => updateField('city', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>State</Label>
                        <Input value={form.state} onChange={(e) => updateField('state', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Postal Code</Label>
                        <Input value={form.postal_code} onChange={(e) => updateField('postal_code', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Country</Label>
                        <Input value={form.country} onChange={(e) => updateField('country', e.target.value)} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label>Notes</Label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => updateField('notes', e.target.value)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Order Items</CardTitle>
                        <CardDescription>Select a product, color and size for each item in this order.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="py-2 pr-2 font-medium">Product</th>
                                    <th className="py-2 pr-2 font-medium">Color</th>
                                    <th className="py-2 pr-2 font-medium">Size</th>
                                    <th className="py-2 pr-2 font-medium">Quantity</th>
                                    <th className="py-2 pr-2 font-medium">Unit Price</th>
                                    <th className="py-2 font-medium" />
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => {
                                    const colorOptions = colorsForProduct(item.name);
                                    const sizeOptions = sizesForProduct(item.name, item.color_id);

                                    return (
                                        <tr key={index} className="border-b last:border-0">
                                            <td className="py-2 pr-2">
                                                <select
                                                    value={item.name}
                                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                                                >
                                                    <option value="">Select product...</option>
                                                    {productNames.map((name) => (
                                                        <option key={name} value={name}>{name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-2 pr-2">
                                                <select
                                                    value={item.color_id}
                                                    onChange={(e) => updateItem(index, 'color_id', e.target.value)}
                                                    disabled={!item.name || colorOptions.length === 0}
                                                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                                                >
                                                    <option value="">Select color...</option>
                                                    {colorOptions.map((option) => (
                                                        <option key={option.id} value={option.id}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-2 pr-2">
                                                <select
                                                    value={item.size_id}
                                                    onChange={(e) => updateItem(index, 'size_id', e.target.value)}
                                                    disabled={!item.name || sizeOptions.length === 0}
                                                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                                                >
                                                    <option value="">Select size...</option>
                                                    {sizeOptions.map((option) => (
                                                        <option key={option.id} value={option.id}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-2 pr-2">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    className="w-20"
                                                />
                                            </td>
                                            <td className="py-2 pr-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.price}
                                                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                                                    className="w-28"
                                                />
                                            </td>
                                            <td className="py-2 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => removeItem(index)}
                                                    disabled={items.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Items Subtotal: {itemsSubtotal.toFixed(2)}
                        </span>
                        <Button type="button" variant="outline" size="sm" onClick={handleUseAsTotal}>
                            Use as Total
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate(backPath)} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Creating...' : 'Create Order'}
                </Button>
            </div>
        </form>
    );
}
