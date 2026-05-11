import { useCallback, useEffect, useRef, useState } from 'react';
import { Barcode, ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import { createRetailSale, fetchAvailableCartoonsByWarehouse, fetchWarehouses, lookupBarcode } from './api';

export default function RetailPOS() {
    const { setPageTitle, user } = useAppContext();

    const isSuperAdmin = Array.isArray(user?.role_slugs) && user.role_slugs.includes('super-admin');
    const userWarehouseIds = Array.isArray(user?.warehouse_ids)
        ? user.warehouse_ids.map((id) => Number.parseInt(id, 10)).filter((id) => Number.isInteger(id) && id > 0)
        : [];

    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [note, setNote] = useState('');
    const [warehouseCartoons, setWarehouseCartoons] = useState([]);
    const [selectedWarehouseCartoon, setSelectedWarehouseCartoon] = useState('none');
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const barcodeRef = useRef(null);

    useEffect(() => {
        setPageTitle('Retail POS');
    }, [setPageTitle]);

    useEffect(() => {
        fetchWarehouses()
            .then((data) => {
                let filtered = data;
                if (!isSuperAdmin && userWarehouseIds.length > 0) {
                    filtered = data.filter((w) => userWarehouseIds.includes(Number(w.id)));
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
            .catch(() => {});
    }, [isSuperAdmin, userWarehouseIds]);

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
    }, [selectedWarehouse]);

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

        setBarcodeInput('');
        setIsLookingUp(true);

        try {
            const product = await lookupBarcode(code, Number.parseInt(selectedWarehouse, 10));

            setCart((prev) => {
                const existing = prev.find((item) => item.stock_id === product.stock_id);
                if (existing) {
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
    }, [barcodeInput, selectedWarehouse, selectedWarehouseCartoon]);

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
    };

    const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

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
            const sale = await createRetailSale({
                warehouse_id: Number.parseInt(selectedWarehouse, 10),
                payment_method: paymentMethod,
                note: note || null,
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

            toast.success(`Sale complete. Ref: ${sale.reference_number}`);
            setCart([]);
            setNote('');
            barcodeRef.current?.focus();
        } catch (err) {
            toast.error(err.message || 'Checkout failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
                                        <Barcode className="h-4 w-4" />
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

                                            <div className="w-24">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unit_price}
                                                    onChange={(e) => updatePrice(item.cartKey, e.target.value)}
                                                    className="h-8 text-right text-sm"
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

                                            <div className="w-20 text-right text-sm font-semibold">
                                                {(item.unit_price * item.quantity).toFixed(2)}
                                            </div>

                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.cartKey)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {item.cartoons && item.cartoons.length > 0 && (
                                            <Select value={item.cartoon_id ? String(item.cartoon_id) : 'none'} onValueChange={(val) => updateCartoon(item.cartKey, val)}>
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Select cartoon to deduct from..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No cartoon (stock only)</SelectItem>
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
                    <div className="flex justify-between border-b pb-2 text-sm">
                        <span>Items</span>
                        <span>{cart.length}</span>
                    </div>

                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{subtotal.toFixed(2)}</span>
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
                        <Label>Warehouse Cartoon</Label>
                        <Select value={selectedWarehouseCartoon} onValueChange={applyWarehouseCartoonToCart}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select available cartoon..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No cartoon (stock only)</SelectItem>
                                {warehouseCartoons.map((cartoon) => (
                                    <SelectItem key={cartoon.id} value={String(cartoon.id)}>
                                        {cartoon.cartoon_number} (Qty: {Number(cartoon.quantity || 0)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Note (optional)</Label>
                        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note" />
                    </div>

                    <Button className="w-full" size="lg" disabled={cart.length === 0 || !selectedWarehouse || isSubmitting} onClick={handleCheckout}>
                        {isSubmitting ? 'Processing...' : `Checkout ${subtotal.toFixed(2)}`}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
