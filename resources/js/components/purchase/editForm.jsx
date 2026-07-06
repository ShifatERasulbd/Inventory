import { Plus, Trash2, Check, ChevronsUpDown, Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils"; // Standard shadcn utility for merging classnames

export default function EditPurchaseForm({
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
    orderSubtotal = 0,
    orderTotal = 0,
    dueAmount = 0,
    paymentStatus = 'unpaid',
    minExpectedDeliveryDate = '',
    shipmentTimeValue = '',
    productionTimeValue = '',
}) {
    // State to track which product popover row is open
    const [openPopoverIndex, setOpenPopoverIndex] = React.useState(null);

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
                <CardTitle>Edit Purchase</CardTitle>
                <CardDescription>Update purchase details for the selected warehouse and products.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
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
                            <Label htmlFor="expected_delivery_date">Required Delivery Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="expected_delivery_date"
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !form.expected_delivery_date && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {form.expected_delivery_date ? (
                                            format(new Date(form.expected_delivery_date), 'PPP')
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
                                            const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
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

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="note">Note</Label>
                            <RichTextEditor
                                value={form.note || ''}
                                onChange={(value) => onSelectChange('note', value)}
                                placeholder="Add note for this purchase order"
                            />
                            {errors.note && <p className="text-xs text-destructive">{errors.note[0]}</p>}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Products</Label>
                            <Button type="button" variant="outline" size="sm" onClick={onAddProduct}>
                                <Plus className="mr-1 h-4 w-4" />
                                Add Product
                            </Button>
                        </div>

                        {errors.products && typeof errors.products === 'string' && (
                            <p className="text-xs text-destructive">{errors.products}</p>
                        )}
                        {Array.isArray(errors.products) && errors.products[0] && (
                            <p className="text-xs text-destructive">{errors.products[0]}</p>
                        )}

                        <div className="space-y-3">
                            {(form.products ?? []).map((row, index) => {
                                const selectedProduct = productOptions.find(
                                    (p) => String(p.id) === String(row.product_id)
                                );

                                return (
                                    <div
                                        key={index}
                                        className="relative rounded-lg border bg-muted/30 p-4"
                                    >
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
                                            {/* Searchable Select2 Product Dropdown Field */}
                                            <div className="space-y-2 sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
                                                <Label>Product</Label>
                                                <Popover 
                                                    open={openPopoverIndex === index} 
                                                    onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={openPopoverIndex === index}
                                                            className="w-full justify-between font-normal"
                                                        >
                                                            <span className="truncate">
                                                                {selectedProduct 
                                                                    ? getProductOptionLabel(selectedProduct) 
                                                                    : "Select product..."}
                                                            </span>
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                                        <Command>
                                                            <CommandInput placeholder="Search product..." />
                                                            <CommandList>
                                                                <CommandEmpty>No product found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {productOptions.map((product) => {
                                                                        const label = getProductOptionLabel(product);
                                                                        const isSelected = String(row.product_id) === String(product.id);
                                                                        return (
                                                                            <CommandItem
                                                                                key={product.id}
                                                                                value={label} // Allows searching by full configured label text
                                                                                onSelect={() => {
                                                                                    onProductSelectChange(index, String(product.id));
                                                                                    setOpenPopoverIndex(null);
                                                                                }}
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
                                                                                        isSelected ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                <span className="truncate">{label}</span>
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
                                                    placeholder="e.g. 350.00"
                                                />
                                                {errors[`products.${index}.purchase_price`] && (
                                                    <p className="text-xs text-destructive">
                                                        {errors[`products.${index}.purchase_price`][0]}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Line Total</Label>
                                                <Input value={getLineTotal(row).toFixed(2)} disabled />
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 rounded-lg border bg-muted/20 p-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Total PO Amount</Label>
                            <Input value={Number(orderTotal ?? 0).toFixed(2)} disabled />
                            <p className="text-xs text-muted-foreground">Subtotal: {Number(orderSubtotal ?? 0).toFixed(2)}</p>
                        </div>

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

                        <div className="space-y-2 md:col-span-2">
                            <Label>Due Amount</Label>
                            <Input value={Number(dueAmount ?? 0).toFixed(2)} disabled />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Purchase'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}