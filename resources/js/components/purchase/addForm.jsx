import * as React from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Check, ChevronDown,Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils'; // Standard Shadcn utility helper
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function AddPurchaseForm({
    form,
    onChange,
    onSelectChange,
    onProductChange,
    onProductSelectChange,
    onAddProduct,
    onRemoveProduct,
    onSubmit,
    onCancel,
    isSubmitting,
    errors = {},
    warehouses = [],
    brands = [],
    productOptions = [],
    isSuperAdmin = false,
    purchaseToLabel,
    availableStatuses = ['pending', 'approved', 'shipped', 'received', 'cancelled'],
    isPurchasePriceLocked = false,
    selectedPurchaseFromWarehouseId = '',
    stockQuantities = {},
    orderSubtotal = 0,
    orderTotal = 0,
    paidAmount = 0,
    dueAmount = 0,
    paymentStatus = 'unpaid',
    shipmentTimeValue = '',
    productionTimeValue = '',
    minExpectedDeliveryDate = '',
    noProductInStock = false,
    canViewWarehouseStock = false,
    onViewWarehouseStock,
}) {
    const minExpectedDate = React.useMemo(() => {
        if (!minExpectedDeliveryDate) {
            return null;
        }

        const parsed = new Date(minExpectedDeliveryDate);
        if (Number.isNaN(parsed.getTime())) {
            return null;
        }

        parsed.setHours(0, 0, 0, 0);
        return parsed;
    }, [minExpectedDeliveryDate]);

    const getProductOptionLabel = (product) => {
        const name = product?.name || `Product #${product?.id}`;
        const size = product?.size?.size || product?.size || product?.size_name;
        const color = product?.color?.color_code || product?.color?.name || product?.color_name;

        return [name, color, size]
            .filter(Boolean)
            .join(' - ');
    };

    const getAvailableStock = (productId) => {
        const warehouseId = Number(selectedPurchaseFromWarehouseId);
        const selectedProductId = Number(productId);

        if (!Number.isInteger(warehouseId) || warehouseId <= 0) {
            return 0;
        }

        if (!Number.isInteger(selectedProductId) || selectedProductId <= 0) {
            return 0;
        }

        const key = `${warehouseId}:${selectedProductId}`;
        return Math.max(0, Number(stockQuantities?.[key] ?? 0));
    };

    const getLineTotal = (row) => {
        const quantity = Number(row?.quantity ?? 0);
        const purchasePrice = Number(row?.purchase_price ?? 0);

        if (!Number.isFinite(quantity) || !Number.isFinite(purchasePrice)) {
            return 0;
        }

        return Math.max(0, quantity) * Math.max(0, purchasePrice);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Purchase</CardTitle>
                <CardDescription>Add purchase details for the selected warehouse and products.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    {/* Warehouse selectors */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="purchase_form">Purchase From</Label>
                            <Select value={form.purchase_form} onValueChange={(value) => onSelectChange('purchase_form', value)}>
                                <SelectTrigger id="purchase_form" className="w-full">
                                    <SelectValue placeholder="Select warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                            {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.purchase_form && <p className="text-xs text-destructive">{errors.purchase_form[0]}</p>}
                            {!errors.purchase_form && noProductInStock && (
                                <p className="text-xs text-destructive">No product in stock.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purchase_to">Purchase To {isSuperAdmin ? '' : '(Login Warehouse)'}</Label>
                            {isSuperAdmin ? (
                                <>
                                    <Select value={form.purchase_to} onValueChange={(value) => onSelectChange('purchase_to', value)}>
                                        <SelectTrigger id="purchase_to" className="w-full">
                                            <SelectValue placeholder="Select warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                                    {warehouse.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.purchase_to && <p className="text-xs text-destructive">{errors.purchase_to[0]}</p>}
                                </>
                            ) : (
                                <Input value={purchaseToLabel} disabled />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="po_number">PO Number</Label>
                            <Input
                                id="po_number"
                                name="po_number"
                                value={form.po_number}
                                onChange={onChange}
                                placeholder="e.g. PO-2026-001"
                            />
                            {errors.po_number && <p className="text-xs text-destructive">{errors.po_number[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand_id">Brand</Label>
                            <Select value={form.brand_id} onValueChange={(value) => onSelectChange('brand_id', value)}>
                                <SelectTrigger id="brand_id" className="w-full">
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={String(brand.id)}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.brand_id && <p className="text-xs text-destructive">{errors.brand_id[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={form.status} onValueChange={(value) => onSelectChange('status', value)}>
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableStatuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!availableStatuses.includes('approved') && (
                                <p className="text-xs text-amber-600">Warehouse access required to approve</p>
                            )}
                            {errors.status && <p className="text-xs text-destructive">{errors.status[0]}</p>}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="expected_delivery_date"
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !form.expected_delivery_date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {form.expected_delivery_date ? (
                                            // Format the saved string date cleanly for the user UI
                                            format(new Date(form.expected_delivery_date), "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={form.expected_delivery_date ? new Date(form.expected_delivery_date) : undefined}
                                        disabled={(date) => {
                                            if (!minExpectedDate) {
                                                return false;
                                            }

                                            const candidate = new Date(date);
                                            candidate.setHours(0, 0, 0, 0);
                                            return candidate < minExpectedDate;
                                        }}
                                        onSelect={(date) => {
                                            // Convert date object to 'YYYY-MM-DD' string to match your backend expectations
                                            const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
                                            onSelectChange('expected_delivery_date', formattedDate);
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.expected_delivery_date && (
                                <p className="text-xs text-destructive">{errors.expected_delivery_date[0]}</p>
                            )}
                           
                           <p className="text-xs text-red-500">
                               For new orders(if the stock is not available) Minimum Production Time(In Days): {String(productionTimeValue || '-')} days
                            </p>
                        </div>
                    </div>

                    {/* Products repeater */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Products</Label>
                            <div className="flex items-center gap-2">
                                {canViewWarehouseStock && (
                                    <Button type="button" variant="secondary" size="sm" onClick={onViewWarehouseStock}>
                                        View Warehouse Stock
                                    </Button>
                                )}
                                <Button type="button" variant="outline" size="sm" onClick={onAddProduct}>
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add Product
                                </Button>
                            </div>
                        </div>

                        {errors.products && typeof errors.products === 'string' && (
                            <p className="text-xs text-destructive">{errors.products}</p>
                        )}
                        {Array.isArray(errors.products) && errors.products[0] && (
                            <p className="text-xs text-destructive">{errors.products[0]}</p>
                        )}

                        <div className="space-y-3">
                            {(form.products ?? []).map((row, index) => (
                                (() => {
                                    // Parse current selections safely to an array of strings
                                    const selectedProductIds = Array.isArray(row.product_id)
                                        ? row.product_id.map(String)
                                        : row.product_id ? [String(row.product_id)] : [];

                                    // Build set of cross-row choices if you wish to enforce absolute row exclusivity
                                    const selectedInOtherRows = new Set(
                                        (form.products ?? [])
                                            .flatMap((item, itemIndex) => {
                                                if (itemIndex === index) return [];
                                                return Array.isArray(item?.product_id) 
                                                    ? item.product_id.map(String) 
                                                    : item?.product_id ? [String(item.product_id)] : [];
                                            })
                                            .filter(Boolean)
                                    );

                                    const availableProductOptions = productOptions.filter((product) => {
                                        const productId = String(product?.id ?? '');
                                        return selectedProductIds.includes(productId) || !selectedInOtherRows.has(productId);
                                    });

                                    // For total available stock metrics estimation, take first selection or look up selectively
                                    const firstProductId = selectedProductIds[0] || '';
                                    const availableStock = getAvailableStock(firstProductId);

                                    return (
                                        <div
                                            key={index}
                                            className="relative rounded-lg border bg-muted/30 p-4"
                                        >
                                            {/* Row header */}
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Item {index + 1}
                                                </span>
                                                {(form.products ?? []).length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => onRemoveProduct(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                {/* Modified Select Segment to Multi-Popover */}
                                                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                                    <Label>Products</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className="w-full justify-between font-normal text-left min-h-[40px] h-auto wrap bg-background"
                                                            >
                                                                <span className="truncate max-w-[200px]">
                                                                    {selectedProductIds.length === 0
                                                                        ? "Select products..."
                                                                        : selectedProductIds.length === 1
                                                                        ? getProductOptionLabel(productOptions.find(p => String(p.id) === selectedProductIds[0]))
                                                                        : `${selectedProductIds.length} items selected`}
                                                                </span>
                                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[320px] p-0" align="start">
                                                            <Command>
                                                                <CommandInput placeholder="Search product..." />
                                                                <CommandList>
                                                                    <CommandEmpty>No product found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {availableProductOptions.map((product) => {
                                                                            const pIdStr = String(product.id);
                                                                            const isSelected = selectedProductIds.includes(pIdStr);
                                                                            return (
                                                                                <CommandItem
                                                                                    key={product.id}
                                                                                    value={getProductOptionLabel(product)}
                                                                                    onSelect={() => {
                                                                                        let nextValue;
                                                                                        if (isSelected) {
                                                                                            nextValue = selectedProductIds.filter(id => id !== pIdStr);
                                                                                        } else {
                                                                                            nextValue = [...selectedProductIds, pIdStr];
                                                                                        }
                                                                                        // Bubbles updated array up to parent component state
                                                                                        onProductSelectChange(index, nextValue);
                                                                                    }}
                                                                                    className="cursor-pointer flex items-center justify-between"
                                                                                >
                                                                                    <span className="text-xs pr-2">{getProductOptionLabel(product)}</span>
                                                                                    <div className={cn(
                                                                                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary",
                                                                                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                                                    )}>
                                                                                        <Check className="h-3 w-3" />
                                                                                    </div>
                                                                                </CommandItem>
                                                                            );
                                                                        })}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                    {errors[`products.${index}.product_id`] && (
                                                        <p className="text-xs text-destructive">
                                                            {errors[`products.${index}.product_id`][0]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Quantity</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={row.quantity}
                                                        onChange={(e) => onProductChange(index, 'quantity', e.target.value)}
                                                        placeholder="e.g. 100"
                                                    />
                                                    {selectedProductIds.length > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Stock (1st item): {availableStock}
                                                        </p>
                                                    )}
                                                    {errors[`products.${index}.quantity`] && (
                                                        <p className="text-xs text-destructive">
                                                            {errors[`products.${index}.quantity`][0]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Purchase Price</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={row.purchase_price}
                                                        onChange={(e) => onProductChange(index, 'purchase_price', e.target.value)}
                                                        disabled={isPurchasePriceLocked}
                                                        placeholder="e.g. 350.00"
                                                    />
                                                    {isPurchasePriceLocked && (
                                                        <p className="text-xs text-muted-foreground">Auto from selected warehouse stock selling price.</p>
                                                    )}
                                                    {errors[`products.${index}.purchase_price`] && (
                                                        <p className="text-xs text-destructive">
                                                            {errors[`products.${index}.purchase_price`][0]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Line Total</Label>
                                                    <Input
                                                        value={getLineTotal(row).toFixed(2)}
                                                        disabled
                                                    />
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })()
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 rounded-lg border bg-muted/20 p-4 lg:grid-cols-3">
                        <div className="space-y-5 lg:col-span-2">
                            <div className="space-y-2">
                                <Label htmlFor="payment_method">Payment Method</Label>
                                <Select value={form.payment_method || ''} onValueChange={(value) => onSelectChange('payment_method', value)}>
                                    <SelectTrigger id="payment_method" className="w-full">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank">Bank</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="mobile">Mobile Banking</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="paid_amount">Paid Amount</Label>
                                    <Input
                                        id="paid_amount"
                                        name="paid_amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.paid_amount ?? '0'}
                                        onChange={onChange}
                                        placeholder="0.00"
                                    />
                                    {errors.paid_amount && <p className="text-xs text-destructive">{errors.paid_amount[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Payment Status</Label>
                                    <Input value={String(paymentStatus || 'unpaid').toUpperCase()} disabled />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border bg-background p-4 lg:col-span-1">
                            <p className="text-sm font-semibold">Order Summary</p>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{Number(orderSubtotal ?? 0).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Total PO Amount</span>
                                    <span className="font-semibold">{Number(orderTotal ?? 0).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Paid</span>
                                    <span>{Number(paidAmount ?? 0).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between border-t pt-3">
                                    <span className="font-medium">Due</span>
                                    <span className="text-base font-bold">{Number(dueAmount ?? 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Purchase'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}