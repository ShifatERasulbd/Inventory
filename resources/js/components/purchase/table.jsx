import { Pencil, Search, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
    onEdit,
    onRequestDelete,
    deletingId,
    onAddNew,
    onInvoice,
    statusDrafts = {},
    updatingStatusId = null,
    onStatusDraftChange,
    onUpdateStatus,
    userWarehouseIds = [],
    isSuperAdmin = false,
}) {
    const [search, setSearch] = useState('');

    const filtered = purchases.filter((purchase) => {
        const query = search.toLowerCase();
        const poNumber = String(purchase.po_number || '').toLowerCase();
        const productName = (purchase.products || [])
            .map((item) => String(item.product_name || `Product #${item.product_id || ''}`).toLowerCase())
            .join(' ');
        const status = String(purchase.status || '').toLowerCase();

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

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">SL No.</TableHead>
                            <TableHead>PO Number</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Purchase From</TableHead>
                            <TableHead>Purchase To</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Note</TableHead>
                            <TableHead className="w-[120px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground">
                                    Loading purchases...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && purchases.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground">
                                    No purchases found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && purchases.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground">
                                    No purchases match your search.
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
                                        const showStatusAction = canShip || canReceive;

                                        let statusOptions = [];
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
                                    <TableCell>{purchase.po_number}</TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            {(purchase.products || []).map((item, itemIndex) => (
                                                <div key={`${purchase.id}-${itemIndex}`} className="rounded-md border border-border/60 px-3 py-2 text-sm">
                                                    <div className="font-medium">
                                                        {item.product_name || `Product #${item.product_id}`}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        Qty: {Number(item.quantity ?? 0)} | Size: {item.size || item.size_name || item?.size?.size || 'N/A'} | Color: {item.color || item.color_name || item?.color?.name || 'N/A'} | Purchase: {Number(item.purchase_price ?? 0).toFixed(2)} | Selling: {Number(item.selling_price ?? 0).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>{purchase.purchase_form_name || `Warehouse #${purchase.purchase_form}`}</TableCell>
                                    <TableCell>{purchase.purchase_to_name || `Warehouse #${purchase.purchase_to}`}</TableCell>
                                    <TableCell className="capitalize">
                                        {showStatusAction ? (
                                            <div className="flex flex-col gap-2">
                                                <Select
                                                    value={currentStatusValue}
                                                    onValueChange={(value) => onStatusDraftChange?.(purchase.id, value)}
                                                >
                                                    <SelectTrigger className="h-9 w-[140px]">
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
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="w-fit"
                                                    onClick={() => onUpdateStatus?.(purchase.id, purchase.status)}
                                                    disabled={updatingStatusId === purchase.id}
                                                >
                                                    {updatingStatusId === purchase.id ? 'Updating...' : 'Update'}
                                                </Button>
                                            </div>
                                        ) : (
                                            purchase.status
                                        )}
                                    </TableCell>
                                    <TableCell>{purchase.note || 'No note'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
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
