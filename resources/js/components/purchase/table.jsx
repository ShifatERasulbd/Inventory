import { Pencil, Search, FileText, Trash2, DollarSign, Package, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function PurchaseTable({
    purchases = [],
    isLoading,
    onViewPdf,
    onEdit,
    onRequestDelete,
    deletingId,
    onAddNew,
    statusDrafts = {},
    updatingStatusId = null,
    onStatusDraftChange,
    onUpdateStatus,
    onPayRemaining,
    onViewDetails,
    onPackingList,
    onUploadPackingList,
    uploadProgressByPurchaseId = {},
    uploadingPackingListId = null,
    userWarehouseIds = [],
    isSuperAdmin = false,
}) {
    const [search, setSearch] = useState('');
    const [activeStatus, setActiveStatus] = useState('all');
    const [activeBrand, setActiveBrand] = useState('all');
    const [fileDrafts, setFileDrafts] = useState({});
    const [viewingPdf, setViewingPdf] = useState(null);
    

        const handlePackingList = async (purchase) => {
            await onPackingList?.(purchase);
        };


    const handleFileChange = (purchaseId, file) => {
        setFileDrafts(prev => ({
            ...prev,
            [purchaseId]: file
        }));
    };
    const normalizeStatus = (value) => {
        const normalized = String(value || '').trim().toLowerCase();
        if (normalized === 'canceled') {
            return 'cancelled';
        }

        return normalized;
    };

    const preferredStatusOrder = ['pending', 'approved', 'shipped', 'received', 'cancelled', 'rejected'];
    const requiredStatusTabs = ['pending', 'approved', 'shipped', 'received', 'cancelled'];

    const statusCounts = purchases.reduce((accumulator, purchase) => {
        const key = normalizeStatus(purchase.status);
        if (!key) {
            return accumulator;
        }

        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
    }, {});

    const dynamicStatuses = Array.from(new Set([
        ...Object.keys(statusCounts),
        ...requiredStatusTabs,
    ]));
    const orderedStatuses = [
        ...preferredStatusOrder.filter((status) => dynamicStatuses.includes(status)),
        ...dynamicStatuses
            .filter((status) => !preferredStatusOrder.includes(status))
            .sort((a, b) => a.localeCompare(b)),
    ];

    const statusTabs = [
        { value: 'all', label: 'All', count: purchases.length },
        ...orderedStatuses.map((status) => ({
            value: status,
            label: status.charAt(0).toUpperCase() + status.slice(1),
            count: statusCounts[status] || 0,
        })),
    ];

    const brandCounts = purchases.reduce((accumulator, purchase) => {
        const rawBrandId = Number(purchase.brand_id);
        const hasBrandId = Number.isInteger(rawBrandId) && rawBrandId > 0;
        const key = hasBrandId ? String(rawBrandId) : 'none';
        const label = hasBrandId
            ? String(purchase.brand_name || `Brand #${rawBrandId}`)
            : 'Unassigned';

        if (!accumulator[key]) {
            accumulator[key] = {
                value: key,
                label,
                count: 0,
            };
        }

        accumulator[key].count += 1;
        return accumulator;
    }, {});

    const brandTabs = [
        { value: 'all', label: 'All Brands', count: purchases.length },
        ...Object.values(brandCounts).sort((a, b) => a.label.localeCompare(b.label)),
    ];

    const filtered = purchases.filter((purchase) => {
        const query = search.toLowerCase();
        const poNumber = String(purchase.po_number || '').toLowerCase();
        const productName = (purchase.products || [])
            .map((item) => String(item.product_name || `Product #${item.product_id || ''}`).toLowerCase())
            .join(' ');
        const status = String(purchase.status || '').toLowerCase();

        const matchesStatus = activeStatus === 'all' || normalizeStatus(purchase.status) === activeStatus;
        const brandKey = Number.isInteger(Number(purchase.brand_id)) && Number(purchase.brand_id) > 0
            ? String(Number(purchase.brand_id))
            : 'none';
        const matchesBrand = activeBrand === 'all' || brandKey === activeBrand;

        if (!matchesStatus || !matchesBrand) {
            return false;
        }

        return poNumber.includes(query) || productName.includes(query) || status.includes(query);
    });

    return (
        <>
            <div className="flex items-center gap-3 justify-between">
                <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search PO, product, status..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full pl-9"
                    />
                </div>

                <Button type="button" onClick={onAddNew}>Add Purchase</Button>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-flex min-w-full gap-2 pb-1">
                    {statusTabs.map((tab) => {
                        const isActive = activeStatus === tab.value;

                        return (
                            <Button
                                key={tab.value}
                                type="button"
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                className="whitespace-nowrap"
                                onClick={() => setActiveStatus(tab.value)}
                            >
                                {tab.label} ({tab.count})
                            </Button>
                        );
                    })}
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-flex min-w-full gap-2 pb-1">
                    {brandTabs.map((tab) => {
                        const isActive = activeBrand === tab.value;

                        return (
                            <Button
                                key={tab.value}
                                type="button"
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                className="whitespace-nowrap"
                                onClick={() => setActiveBrand(tab.value)}
                            >
                                {tab.label} ({tab.count})
                            </Button>
                        );
                    })}
                </div>
            </div>

            <Card>
                <Table className="min-w-[1320px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">SL No.</TableHead>
                            <TableHead className="w-[150px]">PO Number</TableHead>
                            <TableHead className="w-[110px]">PO Date</TableHead>
                            <TableHead className="w-[90px]">Brand</TableHead>
                            <TableHead className="w-[140px]">Required Delivery Date</TableHead>
                            <TableHead className="w-[130px]">Purchase From</TableHead>
                            <TableHead className="w-[130px]">Purchase To</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[110px]">Shipping Date</TableHead>
                            <TableHead className="w-[110px]">Received Date</TableHead>
                            
                            <TableHead className="sticky right-0 z-10 w-[100px] bg-background text-left">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={12} className="text-center text-muted-foreground">
                                    Loading purchases...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && purchases.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={12} className="text-center text-muted-foreground">
                                    No purchases found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && purchases.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={12} className="text-center text-muted-foreground">
                                    No purchases match your current status tab/search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            filtered.map((purchase, index) => (
                                <TableRow key={purchase.id}>
                                    {(() => {
                                        const normalizedStatus = String(purchase.status || '').toLowerCase();
                                        const purchaseToId = Number(purchase.purchase_to ?? 0);
                                        const canReceive = normalizedStatus === 'shipped' && (
                                            isSuperAdmin || userWarehouseIds.includes(purchaseToId)
                                        );
                                        const canShip = normalizedStatus === 'approved';
                                        const canHandlePendingRequest = normalizedStatus === 'pending';
                                        const showStatusAction = canShip || canReceive || canHandlePendingRequest;

                                        let statusOptions = [];
                                        if (canHandlePendingRequest) {
                                            statusOptions = ['pending', 'approved', 'rejected', 'completed'];
                                        }
                                        if (canShip) {
                                            statusOptions = ['approved', 'shipped'];
                                        }
                                        if (canReceive) {
                                            statusOptions = ['shipped', 'received'];
                                        }

                                        const currentStatusValue = statusDrafts[purchase.id] ?? purchase.status;

                                        return (
                                            <>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell className="max-w-[150px] truncate">{purchase.po_number}</TableCell>
                                    <TableCell>{formatDate(purchase.po_date)}</TableCell>
                                    <TableCell>{purchase.brand_name || 'N/A'}</TableCell>
                                    <TableCell>{formatDate(purchase.expected_delivery_date)}</TableCell>
                                    <TableCell className="max-w-[130px] truncate">{purchase.purchase_form_name || `Warehouse #${purchase.purchase_form}`}</TableCell>
                                    <TableCell className="max-w-[130px] truncate">{purchase.purchase_to_name || `Warehouse #${purchase.purchase_to}`}</TableCell>
                                    <TableCell className="w-[120px] capitalize">
                                   {showStatusAction ? (
                                        <div className="flex flex-col gap-4">
                                            {/* Status Selection */}
                                            <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium">Status</label>
                                            <Select
                                                value={currentStatusValue}
                                                onValueChange={(value) => onStatusDraftChange?.(purchase.id, value)}
                                            >
                                                <SelectTrigger className="h-9 w-full">
                                                <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                {statusOptions.map((statusOption) => (
                                                    <SelectItem key={`${purchase.id}-${statusOption}`} value={statusOption}>
                                                    {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                                    </SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                            </div>

                                            {/* File Upload Field */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium">Packing List (PDF)</label>
                                                    <input
                                                        type="file"
                                                        required
                                                        accept="application/pdf"
                                                        disabled={uploadingPackingListId === purchase.id}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;

                                                            // 1. Update the state using your custom helper
                                                            handleFileChange(purchase.id, file);

                                                            // 2. Perform the upload action
                                                            await onUploadPackingList?.({ purchaseId: purchase.id, file });

                                                            // 3. Reset the input value to allow re-uploading the same file
                                                            e.target.value = '';
                                                        }}
                                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    />
                                                {typeof uploadProgressByPurchaseId[purchase.id] === 'number' && (
                                                    <div className="space-y-1">
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                                            <div
                                                                className="h-full rounded-full bg-black transition-all duration-200"
                                                                style={{ width: `${uploadProgressByPurchaseId[purchase.id]}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Uploading {uploadProgressByPurchaseId[purchase.id]}%
                                                        </p>
                                                    </div>
                                                )}
                                            </div>


                                            {/* Update Action */}
                                            <Button
                                            type="button"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => onUpdateStatus?.(purchase.id, purchase.status)}
                                            disabled={updatingStatusId === purchase.id}
                                            >
                                            {updatingStatusId === purchase.id ? 'Updating...' : 'Update Record'}
                                            </Button>
                                        </div>
                                        ) : (
                                        purchase.status
                                        )}
                                    </TableCell>
                                    <TableCell className="w-[110px]">{formatDate(purchase.shipping_date)}</TableCell>
                                    <TableCell className="w-[110px]">{formatDate(purchase.received_date)}</TableCell>
                                    <TableCell className="sticky right-0 z-10 bg-background shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.35)]">
                                        <div className="flex items-center gap-2">
                                            {String(purchase.payment_status || '').toLowerCase() !== 'paid' && Number(purchase.due_amount ?? 0) > 0 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label={`Pay due amount for purchase ${purchase.po_number}`}
                                                                onClick={() => onPayRemaining?.(purchase)}
                                                            >
                                                                <DollarSign />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom">
                                                            <p>Pay Due</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Invoice for purchase ${purchase.po_number}`}
                                                        onClick={() => onInvoice?.(purchase)}
                                                    >
                                                        <FileText />
                                                    </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                    <p>Invoice</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                        {purchase.packing_list_path && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                // Use the prop 'onViewPdf' passed from the parent
                                                                onClick={() => onViewPdf(`/${purchase.packing_list_path}`)}
                                                            >
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>View Packing List</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                            {normalizedStatus === 'approved' && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label={`Packing list for purchase ${purchase.po_number}`}
                                                                onClick={() => handlePackingList(purchase)}
                                                            >
                                                                <Package />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom">
                                                            <p>Packing List</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`View details for purchase ${purchase.po_number}`}
                                                            onClick={() => onViewDetails?.(purchase.id)}
                                                        >
                                                            <Eye />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                        <p>View Details</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                   <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Edit purchase ${purchase.po_number}`}
                                                        onClick={() => onEdit(purchase.id)}
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                    <p>Edit</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>


                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Delete purchase ${purchase.po_number}`}
                                                            onClick={() => onRequestDelete(purchase)}
                                                            disabled={deletingId === purchase.id}
                                                        >
                                                            <Trash2 />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                    <p>Delete</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            
                                            
                                            
                                        </div>
                                    </TableCell>
                                            </>
                                        );
                                    })()}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </Card>


       
        </>
    );
}