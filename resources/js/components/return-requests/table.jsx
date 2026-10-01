import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Eye, FileText, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchReturnShippingLabelBlob } from '@/pages/ReturnRequests/api';

const STATUS_VARIANTS = {
    pending: 'secondary',
    approved_return: 'success',
    product_received: 'default',
    rejected: 'destructive',
    refund_initiated: 'default',
};

const LABEL_ELIGIBLE_STATUSES = ['approved_return', 'product_received', 'refund_initiated'];

export function ReturnRequestTable({
    returnRequests = [],
    onView,
    onSync,
    isLoading,
    isSyncing,
    canSync = false,
}) {
    const [search, setSearch] = useState('');
    const [labelModalRequest, setLabelModalRequest] = useState(null);
    const [labelUrl, setLabelUrl] = useState(null);
    const [isLoadingLabel, setIsLoadingLabel] = useState(false);
    const [labelError, setLabelError] = useState('');

    const handleViewShippingLabel = async (returnRequest) => {
        setLabelModalRequest(returnRequest);
        setLabelUrl(null);
        setLabelError('');
        setIsLoadingLabel(true);

        try {
            const blob = await fetchReturnShippingLabelBlob(returnRequest.id);
            setLabelUrl(URL.createObjectURL(blob));
        } catch (error) {
            const message = error.message || 'Failed to load return shipping label.';
            setLabelError(message);
            toast.error(message, { style: { color: '#dc2626' } });
        } finally {
            setIsLoadingLabel(false);
        }
    };

    const closeLabelModal = (open) => {
        if (!open) {
            if (labelUrl) {
                URL.revokeObjectURL(labelUrl);
            }
            setLabelModalRequest(null);
            setLabelUrl(null);
            setLabelError('');
        }
    };

    const filtered = returnRequests.filter((item) => {
        const q = search.toLowerCase();
        return (
            item.order_number?.toLowerCase().includes(q) ||
            item.request_reason?.toLowerCase().includes(q) ||
            item.status?.toLowerCase().includes(q)
        );
    });


    return (
        <>
            <div className="flex items-center gap-3 justify-between">
                <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Return Requests..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9"
                    />
                </div>
                {canSync && (
                    <Button className="shrink-0 gap-2" onClick={onSync} disabled={isSyncing}>
                        <RefreshCw className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'Syncing...' : 'Sync from 1971co'}
                    </Button>
                )}
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">SL No.</TableHead>
                            <TableHead>Order Number</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Wants Size Replacement</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead className="w-[100px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    Loading Return Requests...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && returnRequests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No return requests found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && returnRequests.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No return requests match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            filtered.map((returnRequest, index) => (
                                <TableRow key={returnRequest.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{returnRequest.order_number || 'N/A'}</TableCell>
                                    <TableCell>{returnRequest.request_reason || 'N/A'}</TableCell>
                                    <TableCell className="capitalize">{returnRequest.wants_size_replacement || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={STATUS_VARIANTS[returnRequest.status] || 'secondary'} className="capitalize">
                                            {returnRequest.status || 'pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {returnRequest.created_at ? new Date(returnRequest.created_at).toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label="View Return Request"
                                                            onClick={() => onView(returnRequest.id)}
                                                        >
                                                            <Eye />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                        <p>View</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            {LABEL_ELIGIBLE_STATUSES.includes(returnRequest.status) ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label="View Return Shipping Label"
                                                                onClick={() => handleViewShippingLabel(returnRequest)}
                                                            >
                                                                <FileText />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom">
                                                            <p>Return Label</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label="View Return Shipping Label"
                                                                onClick={() => handleViewShippingLabel(returnRequest)}
                                                            >
                                                                <FileText className="text-muted-foreground" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom">
                                                            <p>Return Label (approve the return first)</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={Boolean(labelModalRequest)} onOpenChange={closeLabelModal}>
                <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            Return Shipping Label - {labelModalRequest?.order_number || ''}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden rounded-md border bg-muted/10">
                        {isLoadingLabel && (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                Loading return label...
                            </div>
                        )}

                        {!isLoadingLabel && labelError && (
                            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-destructive">
                                {labelError}
                            </div>
                        )}

                        {!isLoadingLabel && !labelError && labelUrl && (
                            <iframe title="Return Shipping Label" src={labelUrl} className="h-full w-full" />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
