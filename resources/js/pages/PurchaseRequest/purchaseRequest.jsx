import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

async function fetchPurchaseRequests() {
    const response = await fetch('/api/purchase-requests', {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch purchase requests');
    }

    return response.json();
}

async function updatePurchaseRequestStatus(id, status) {
    const response = await fetch(`/api/purchases/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        throw new Error('Failed to update purchase request status');
    }

    return response.json();
}

async function deletePurchase(id) {
    const response = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete purchase request');
    }

    return response.json();
}

function PurchaseRequestTable({
    data,
    searchTerm,
    onDelete,
    statusDrafts,
    updatingId,
    onDraftChange,
    onUpdateStatus,
}) {
    const filtered = data.filter((item) =>
        item.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="rounded-lg border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>SL No.</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Purchase From</TableHead>
                        <TableHead>Send To</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Purchase Price</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.map((purchase, index) => (
                        <TableRow key={purchase.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{purchase.po_number}</TableCell>
                            <TableCell>{purchase.product_name}</TableCell>
                            <TableCell>{purchase.purchase_form_name}</TableCell>
                            <TableCell>{purchase.purchase_to_name}</TableCell>
                            <TableCell>{purchase.quantity}</TableCell>
                            <TableCell>৳{purchase.purchase_price.toFixed(2)}</TableCell>
                            <TableCell>৳{purchase.selling_price.toFixed(2)}</TableCell>
                            <TableCell className="capitalize">{purchase.status}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={statusDrafts[purchase.id] ?? purchase.status}
                                        onChange={(e) => onDraftChange(purchase.id, e.target.value)}
                                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                                    >
                                        <option value="pending">pending</option>
                                        <option value="approved">approved</option>
                                        <option value="rejected">rejected</option>
                                        <option value="completed">completed</option>
                                    </select>
                                    <Button
                                        size="sm"
                                        onClick={() => onUpdateStatus(purchase.id, purchase.status)}
                                        disabled={updatingId === purchase.id}
                                    >
                                        {updatingId === purchase.id ? 'Updating...' : 'Update'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(purchase.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}

export default function PurchaseRequest() {
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [statusDrafts, setStatusDrafts] = useState({});
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        const loadPurchaseRequests = async () => {
            try {
                setLoading(true);
                const data = await fetchPurchaseRequests();
                setPurchaseRequests(data);
            } catch (error) {
                toast.error('Failed to load purchase requests');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadPurchaseRequests();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            setIsDeleting(true);
            await deletePurchase(deleteId);
            setPurchaseRequests(purchaseRequests.filter((p) => p.id !== deleteId));
            toast.success('Purchase request deleted successfully');
            setDeleteId(null);
        } catch (error) {
            toast.error('Failed to delete purchase request');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDraftChange = (id, value) => {
        setStatusDrafts((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleUpdateStatus = async (id, currentStatus) => {
        const nextStatus = statusDrafts[id] ?? currentStatus;

        if (nextStatus === currentStatus) {
            toast.info('Status is already selected.');
            return;
        }

        try {
            setUpdatingId(id);
            const updated = await updatePurchaseRequestStatus(id, nextStatus);

            setPurchaseRequests((prev) => {
                if (updated.status !== 'pending') {
                    return prev.filter((item) => item.id !== id);
                }

                return prev.map((item) => (item.id === id ? updated : item));
            });

            setStatusDrafts((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });

            toast.success('Purchase request status updated successfully');
        } catch (error) {
            toast.error('Failed to update purchase request status');
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Purchase Requests</h1>
            </div>

            <div className="flex gap-4">
                <Input
                    placeholder="Search by PO number or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <PurchaseRequestTable
                data={purchaseRequests}
                searchTerm={searchTerm}
                onDelete={setDeleteId}
                statusDrafts={statusDrafts}
                updatingId={updatingId}
                onDraftChange={handleDraftChange}
                onUpdateStatus={handleUpdateStatus}
            />

            <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Purchase Request</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this purchase request? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-4">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
