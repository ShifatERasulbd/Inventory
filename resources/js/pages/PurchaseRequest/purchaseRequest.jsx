import { useEffect, useState } from 'react';

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
import PurchaseRequestTable from '@/components/purchaseRequest/table';

import { toast } from 'sonner';

function formatMoney(value) {
    const numberValue = Number(value ?? 0);
    return Number.isFinite(numberValue) ? numberValue.toFixed(2) : '0.00';
}

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

async function updatePurchaseRequestStatus(id, status, note = '') {
    const response = await fetch(`/api/purchases/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ status, note }),
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



export default function PurchaseRequest() {
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [statusDrafts, setStatusDrafts] = useState({});
    const [noteDrafts, setNoteDrafts] = useState({});
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

    const handleNoteDraftChange = (id, value) => {
        setNoteDrafts((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleUpdateStatus = async (id, currentStatus) => {
        const nextStatus = statusDrafts[id] ?? currentStatus;
        const nextNote = noteDrafts[id] ?? '';

        if (nextStatus === currentStatus && nextNote.trim() === '') {
            toast.info('Status is already selected and no note was added.');
            return;
        }

        try {
            setUpdatingId(id);
            const updated = await updatePurchaseRequestStatus(id, nextStatus, nextNote);

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

            setNoteDrafts((prev) => {
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
                noteDrafts={noteDrafts}
                updatingId={updatingId}
                onDraftChange={handleDraftChange}
                onNoteDraftChange={handleNoteDraftChange}
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
