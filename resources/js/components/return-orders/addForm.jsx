import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';  
import { Search, ChevronDown } from 'lucide-react';

export default function AddForm({ form, onChange, onSubmit, onCancel, remoteOrders = [], isSubmitting, errors = {} }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Filter remote orders based on search input
    const filteredOrders = remoteOrders.filter((order) => {
        const q = searchTerm.toLowerCase();
        const orderNum = order.order_number?.toLowerCase() || '';
        const customer = order.customer_name?.toLowerCase() || '';
        return orderNum.includes(q) || customer.includes(q);
    });

    // Find currently selected order object to display its label
    const selectedOrder = remoteOrders.find((o) => String(o.id) === String(form.order_number_id));

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper function to trigger parent's onChange handler programmatically
    const handleSelectOrder = (orderId) => {
        const syntheticEvent = {
            target: {
                name: 'order_number_id',
                value: orderId,
            },
        };
        onChange(syntheticEvent);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Return Orders</CardTitle>
                <CardDescription>Fill in the order details and save to create a new record.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        
                        {/* Searchable Order Number Dropdown */}
                        <div className="space-y-2 relative" ref={dropdownRef}>
                            <Label htmlFor="order_number_id">Order Number</Label>
                            
                            {/* Trigger Button mimicking an Input */}
                            <div
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <span className={selectedOrder ? "text-foreground" : "text-muted-foreground"}>
                                    {selectedOrder 
                                        ? `${selectedOrder.order_number} ${selectedOrder.customer_name ? `(${selectedOrder.customer_name})` : ''}` 
                                        : "Select Order Number"}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </div>

                            {/* Dropdown Popup Panel */}
                            {isOpen && (
                                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
                                    <div className="p-2 border-b flex items-center gap-2">
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search by order number or customer..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto p-1">
                                        {filteredOrders.length === 0 ? (
                                            <div className="py-3 text-center text-sm text-muted-foreground">
                                                No orders found.
                                            </div>
                                        ) : (
                                            filteredOrders.map((order) => (
                                                <div
                                                    key={order.id}
                                                    onClick={() => handleSelectOrder(order.id)}
                                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    {order.order_number} {order.customer_name ? `(${order.customer_name})` : ''}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {errors.order_number_id && <p className="text-xs text-destructive">{errors.order_number_id[0]}</p>}
                        </div>

                        {/* Reason Input */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Input
                                id="reason"
                                name="reason"
                                value={form.reason}
                                onChange={onChange}
                                placeholder="e.g. Damaged item, Wrong size..."
                            />
                            {errors.reason && <p className="text-xs text-destructive">{errors.reason[0]}</p>}
                        </div>

                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Return Order'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}