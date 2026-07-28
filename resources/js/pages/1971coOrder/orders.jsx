import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Download } from 'lucide-react'; 

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import OrdersTable from '@/components/1971coOrders/table';
import StockLocationModal from '@/components/1971coOrders/stockLocationModal';

import { fetchRemoteOrders, syncRemoteOrders, bulkUpdateStatus, bulkDelete, fetchStockLocationsForOrder } from './api';
import Preloader from '@/components/Preloader';

// Packages for handling PDF generation
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const BULK_STATUS_OPTIONS = ['pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const STATUS_TABS = ['all', 'pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

function firstNonEmptyString(...values) {
    for (const value of values) {
        if (typeof value === 'string' && value.trim() !== '') {
            return value.trim();
        }
    }
    return '';
}

function extractVariantValue(item, keys = []) {
    if (!item || typeof item !== 'object') {
        return '';
    }

    const direct = firstNonEmptyString(...keys.map((key) => item[key]));
    if (direct) {
        return direct;
    }

    const selectedOptions = Array.isArray(item.selected_options)
        ? item.selected_options
        : (Array.isArray(item.options) ? item.options : []);

    for (const option of selectedOptions) {
        if (!option || typeof option !== 'object') {
            continue;
        }

        const name = String(option.name || option.label || option.key || '').toLowerCase();
        const value = firstNonEmptyString(option.value, option.option_value, option.display_value);

        if (!value) {
            continue;
        }

        if (keys.some((key) => name.includes(String(key).toLowerCase().replace('_', '')))) {
            return value;
        }
    }

    return '';
}

function formatProductLineWithVariants(item) {
    const productName = firstNonEmptyString(item?.name, item?.title) || 'Unknown Product';
    const color = extractVariantValue(item, ['selectedColor', 'selected_color', 'color', 'colour']);
    const size = extractVariantValue(item, ['selectedSize', 'selected_size', 'size']);

    const meta = [
        color ? `Color: ${color}` : '',
        size ? `Size: ${size}` : '',
    ].filter(Boolean).join(' | ');

    return meta ? `${productName} | ${meta}` : productName;
}

function normalizeDateRange(dateFrom, dateTo) {
    if (!dateFrom || !dateTo) {
        return { dateFrom, dateTo, wasSwapped: false };
    }

    if (String(dateFrom) <= String(dateTo)) {
        return { dateFrom, dateTo, wasSwapped: false };
    }

    return {
        dateFrom: dateTo,
        dateTo: dateFrom,
        wasSwapped: true,
    };
}

export default function RemoteOrdersPage() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    
    const [orders, setOrders] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [activeStatus, setActiveStatus] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [stockLocationOpen, setStockLocationOpen] = useState(false);
    const [stockLocationLoading, setStockLocationLoading] = useState(false);
    const [stockLocationError, setStockLocationError] = useState('');
    const [stockLocationOrder, setStockLocationOrder] = useState(null);
    const [stockLocationItems, setStockLocationItems] = useState([]);

    const loadOrdersRef = useRef(null);
    const paginationRef = useRef({ current_page: 1 });
    const autoSyncInProgressRef = useRef(false);
    const autoSyncTimerRef = useRef(null);

    useEffect(() => {
        setPageTitle('1971co Orders');
    }, [setPageTitle]);

    const statusSummary = useMemo(() => {
        return orders.reduce((acc, order) => {
            const status = String(order?.status || 'pending');
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }, [orders]);

    async function loadOrders(page = 1, filters = {}) {
        // Fix evaluation to accept empty strings when a filter is cleared
        const nextSearch = filters.hasOwnProperty('search') ? filters.search : search;
        const nextStatus = filters.hasOwnProperty('status') ? filters.status : (activeStatus === 'all' ? '' : activeStatus);
        const nextDateFrom = filters.hasOwnProperty('date_from') ? filters.date_from : dateFrom;
        const nextDateTo = filters.hasOwnProperty('date_to') ? filters.date_to : dateTo;
        const normalizedRange = normalizeDateRange(nextDateFrom, nextDateTo);

        if (normalizedRange.wasSwapped) {
            if (filters.hasOwnProperty('date_from')) {
                setDateFrom(normalizedRange.dateFrom);
            }

            if (filters.hasOwnProperty('date_to')) {
                setDateTo(normalizedRange.dateTo);
            }

            toast.warning('Date From was after Date To, so the range was swapped automatically.');
        }

        setIsLoading(true);
        setErrorMessage('');
        setSelectedIds([]); 

        try {
            const payload = await fetchRemoteOrders({
                page,
                per_page: 20,
                search: nextSearch || undefined,
                status: nextStatus || undefined,
                date_from: normalizedRange.dateFrom || undefined,
                date_to: normalizedRange.dateTo || undefined,
            });

            setOrders(Array.isArray(payload?.data) ? payload.data : []);
            setPagination({
                current_page: Number(payload?.current_page || 1),
                last_page: Number(payload?.last_page || 1),
                total: Number(payload?.total || 0),
            });
        } catch (error) {
            setErrorMessage(error.message || 'Failed to load remote orders.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadOrdersRef.current = loadOrders;
    }, [loadOrders]);

    useEffect(() => {
        paginationRef.current = pagination;
    }, [pagination]);

    useEffect(() => {
        loadOrders(1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const runAutoSync = async () => {
            if (autoSyncInProgressRef.current) {
                return;
            }

            autoSyncInProgressRef.current = true;

            try {
                await syncRemoteOrders({ since_id: 0, limit: 200 });

                if (!cancelled) {
                    const currentPage = Number(paginationRef.current?.current_page || 1);
                    await loadOrdersRef.current?.(currentPage);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Auto sync failed', error);
                }
            } finally {
                autoSyncInProgressRef.current = false;
            }
        };

        runAutoSync();
        autoSyncTimerRef.current = window.setInterval(runAutoSync, 60_000);

        return () => {
            cancelled = true;
            if (autoSyncTimerRef.current) {
                window.clearInterval(autoSyncTimerRef.current);
                autoSyncTimerRef.current = null;
            }
        };
    }, []);

    if (isLoading) {  
         return (
                           <div className="relative min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl bg-background">
                               <Preloader message="Loading 1971 Orders..." fullScreen={false} />
                           </div>
                       );
    }

    // Selection Handlers
    function handleSelectOrder(id, isChecked) {
        setSelectedIds(prev => 
            isChecked ? [...prev, id] : prev.filter(item => item !== id)
        );
    }

    // Pagination helper keeping context intact
    function handlePageChange(nextPage) {
        loadOrders(nextPage, {
            search,
            status: activeStatus === 'all' ? '' : activeStatus,
            date_from: dateFrom,
            date_to: dateTo
        });
    }

    function handleSelectAllOrders(isChecked) {
        setSelectedIds(isChecked ? orders.map(o => o.id) : []);
    }

    // Bulk Event Actions
    async function handleBulkStatusChange(status) {
        if (selectedIds.length === 0 || isBulkProcessing) return;
        setIsBulkProcessing(true);
        try {
            await bulkUpdateStatus({ ids: selectedIds, status });
            toast.success(`Successfully updated status for ${selectedIds.length} orders.`);
            await loadOrders(pagination.current_page);
        } catch (error) {
            toast.error(error.message || 'Failed processing bulk status change.');
        } finally {
            setIsBulkProcessing(false);
        }
    }

    async function handleBulkDelete() {
        if (selectedIds.length === 0 || isBulkProcessing) return;
        if (!confirm(`Are you absolutely sure you want to delete ${selectedIds.length} locally cached orders?`)) return;
        
        setIsBulkProcessing(true);
        try {
            await bulkDelete({ ids: selectedIds });
            toast.success(`Successfully deleted ${selectedIds.length} orders.`);
            await loadOrders(1);
        } catch (error) {
            toast.error(error.message || 'Failed running bulk deletion sequence.');
        } finally {
            setIsBulkProcessing(false);
        }
    }

    async function handleSync() {
        setIsSyncing(true);
        setErrorMessage('');
        try {
            const result = await syncRemoteOrders({ since_id: 0, limit: 200 });
            toast.success(`Synced ${result?.synced_count || 0} orders successfully.`, {
                style: { color: '#16a34a' },
            });
            await loadOrders(1);
        } catch (error) {
            const message = error.message || 'Failed to sync remote orders.';
            setErrorMessage(message);
            toast.error(message, { style: { color: '#dc2626' } });
        } finally {
            setIsSyncing(false);
        }
    }

    function handleSearchSubmit(event) {
        event.preventDefault();
        const nextSearch = searchInput.trim();
        setSearch(nextSearch);
        loadOrders(1, {
            search: nextSearch,
            status: activeStatus === 'all' ? '' : activeStatus,
            date_from: dateFrom,
            date_to: dateTo,
        });
    }

    function handleStatusTabChange(status) {
        setActiveStatus(status);
        loadOrders(1, {
            search,
            status: status === 'all' ? '' : status,
            date_from: dateFrom,
            date_to: dateTo,
        });
    }

    // PDF Download Engine Handler
    function handleDownloadPDF() {
        if (orders.length === 0) {
            toast.error("No orders available to export.");
            return;
        }

        try {
            const doc = new jsPDF('l', 'mm', 'a4');

            doc.setFontSize(16);
            doc.text('1971co  Orders Report', 14, 15);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()} | Total Table Items: ${orders.length}`, 14, 22);

            const tableHeaders = [
                ['Order #', 'Customer', 'Products', 'Qty', 'Status', 'Courier', 'Total', 'Updated']
            ];

            const tableRows = orders.map(order => {
                const items = order.items || order.raw_payload?.items || [];

                const productNames = items.map((item) => formatProductLineWithVariants(item)).join('\n');
                const productQuantities = items.map(i => i.quantity || i.qty || 1).join('\n');
                const courier = order.courier_company || order.raw_payload?.courier_company || order.raw_payload?.courier_service || '-';
                const dateStr = order.updated_at ? new Date(order.updated_at).toLocaleString() : '-';

                return [
                    order.order_number || '-',
                    order.customer_name || '-',
                    productNames,
                    productQuantities,
                    order.status || '-',
                    courier,
                    `$${Number(order.total || 0).toFixed(2)}`,
                    dateStr
                ];
            });

            autoTable(doc, {
                startY: 26,
                head: tableHeaders,
                body: tableRows,
                theme: 'striped',
                styles: { fontSize: 8, overflow: 'linebreak' },
                columnStyles: {
                    2: { cellWidth: 60 }, 
                    3: { cellWidth: 15 }  
                }
            });

            doc.save(`Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("PDF document downloaded successfully.");
        } catch (error) {
            console.error('Failed to generate PDF report', error);
            toast.error('Failed to generate PDF. Please try again.');
        }
    }

    async function handleViewStockLocations(order) {
        const items = Array.isArray(order?.raw_payload?.items) ? order.raw_payload.items : [];

        setStockLocationOrder(order);
        setStockLocationItems([]);
        setStockLocationError('');
        setStockLocationOpen(true);
        setStockLocationLoading(true);

        try {
            const payload = await fetchStockLocationsForOrder(items);
            setStockLocationItems(Array.isArray(payload?.items) ? payload.items : []);
        } catch (error) {
            setStockLocationError(error.message || 'Failed to load stock locations.');
        } finally {
            setStockLocationLoading(false);
        }
    }

    return (
        <div className="space-y-5">
            <Card>
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>1971co Remote Orders</CardTitle>
                        <CardDescription>
                            Orders are saved into the local Inventory database and auto-synced every minute.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={handleDownloadPDF} className="gap-1.5">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                        <Button type="button" onClick={handleSync} disabled={isSyncing}>
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {STATUS_TABS.map((status) => {
                            const isActive = activeStatus === status;
                            const label = status === 'all'
                                ? 'All'
                                : status.charAt(0).toUpperCase() + status.slice(1);

                            return (
                                <Button
                                    key={status}
                                    type="button"
                                    variant={isActive ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusTabChange(status)}
                                >
                                    {label}
                                </Button>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-3 justify-between md:flex-row">
                        <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-wrap items-center gap-2">
                            <Input
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Search by order number, customer, or status"
                                className="w-full md:w-[300px]"
                            />
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(event) => setDateFrom(event.target.value)}
                                className="w-full md:w-[170px]"
                            />
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(event) => setDateTo(event.target.value)}
                                className="w-full md:w-[170px]"
                            />
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>

                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted animate-in fade-in-50 duration-200">
                                <span className="text-xs font-medium px-2 text-muted-foreground">
                                    {selectedIds.length} Selected
                                </span>
                                <select
                                    disabled={isBulkProcessing}
                                    onChange={(e) => {
                                        if(e.target.value) {
                                            handleBulkStatusChange(e.target.value);
                                            e.target.value = ''; 
                                        }
                                    }}
                                    className="h-8 text-xs rounded border border-input bg-background px-2 outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <option value="">Update Status...</option>
                                    {BULK_STATUS_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>
                                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="h-8 text-xs"
                                    disabled={isBulkProcessing}
                                    onClick={handleBulkDelete}
                                >
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>

                    {!!errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

                    <div className="text-sm text-muted-foreground">
                        Total: {pagination.total}
                        {Object.keys(statusSummary).length > 0 && (
                            <span className="ml-3">
                                {Object.entries(statusSummary)
                                    .map(([status, count]) => `${status}: ${count}`)
                                    .join(' | ')}
                            </span>
                        )}
                    </div>

                    <OrdersTable 
                        orders={orders} 
                        isLoading={isLoading} 
                        selectedIds={selectedIds}
                        onSelectOrder={handleSelectOrder}
                        onSelectAllOrders={handleSelectAllOrders}
                        onEdit={(order) => navigate(`/remote-orders/${order.remote_id ?? order.id}/edit`)}
                        onViewStockLocations={handleViewStockLocations}
                    />

                    <StockLocationModal
                        open={stockLocationOpen}
                        onOpenChange={setStockLocationOpen}
                        orderNumber={stockLocationOrder?.order_number || stockLocationOrder?.remote_id || ''}
                        items={stockLocationItems}
                        isLoading={stockLocationLoading}
                        errorMessage={stockLocationError}
                    />

                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={pagination.current_page <= 1 || isLoading}
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={pagination.current_page >= pagination.last_page || isLoading}
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}