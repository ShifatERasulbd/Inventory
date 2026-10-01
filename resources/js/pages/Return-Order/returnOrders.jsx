import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ReturnOrderTable } from '@/components/return-orders/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppContext } from '@/context/AppContext';

import { deleteReturnOrder, fetchReturnOrders } from './api';
import Preloader from '@/components/Preloader';

export default function ReturnOrders() {
  const navigate = useNavigate();
  const { setPageTitle, can } = useAppContext();
  const canCreate = can('create', 'return-orders');
  const canUpdate = can('update', 'return-orders');
  const canDelete = can('delete', 'return-orders');
  const [returnOrders, setReturnOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [returnOrderToDelete, setReturnOrderToDelete] = useState(null);

    useEffect(() => {
    setPageTitle('Return Orders');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadReturnOrders() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchReturnOrders();
        if (!ignore) {
          setReturnOrders(Array.isArray(data) ? data : []);
        }
        console.log(data);
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load Return Orders.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadReturnOrders();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!returnOrderToDelete) {
      return;
    }

    const id = returnOrderToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteReturnOrder(id);
      setReturnOrders((previous) => (Array.isArray(previous) ? previous : []).filter((returnOrders) => returnOrders.id !== id));
      toast.success('Return Order deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setReturnOrderToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete Return Order.';
      setErrorMessage(message);
      toast.error(message, {
        style: { color: '#dc2626' },
      });
    } finally {
      setDeletingId(null);
    }
  };

    if (isLoading) {
         return (
                           <div className="relative min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl bg-background">
                               <Preloader message="Loading Return Orders..." fullScreen={false} />
                           </div>
                       );
    }

    return (
    <div className="space-y-5">
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <ReturnOrderTable
                    returnOrders={returnOrders}
                    onAdd={() => navigate('/return-orders/add')}
                    onEdit={(id) => navigate(`/return-orders/${id}/edit`)}
                    onRequestDelete={setReturnOrderToDelete}
                    deletingId={deletingId}
                    isLoading={isLoading}
                    canCreate={canCreate}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                />
                    </div>

            <AlertDialog open={Boolean(returnOrderToDelete)} onOpenChange={(open) => !open && setReturnOrderToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Return Order</AlertDialogTitle>
                    <AlertDialogDescription>
                    Are you sure you want to delete {returnOrderToDelete?.name}? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                    variant="destructive"
                    disabled={deletingId !== null}
                    onClick={handleConfirmDelete}
                    >
                    {deletingId !== null ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

    </div>
    );
}