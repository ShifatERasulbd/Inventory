import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { SupplierTable } from '@/components/supplier/table';
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

import { deleteSupplier, fetchSuppliers } from './api';

export default function Supplier() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

    useEffect(() => {
    setPageTitle('Suppliers');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadSuppliers() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchSuppliers();
        if (!ignore) {
          setSuppliers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load Suppliers.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadSuppliers();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) {
      return;
    }

    const id = supplierToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteSupplier(id);
      setSuppliers((previous) => (Array.isArray(previous) ? previous : []).filter((supplier) => supplier.id !== id));
      toast.success('Supplier deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setSupplierToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete Supplier.';
      setErrorMessage(message);
      toast.error(message, {
        style: { color: '#dc2626' },
      });
    } finally {
      setDeletingId(null);
    }
  };

    return (
    <div className="space-y-5">
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <SupplierTable
                suppliers={suppliers}
                onAdd={() => navigate('/suppliers/add')}
                onEdit={(id) => navigate(`/suppliers/${id}/edit`)}
                onRequestDelete={setSupplierToDelete}
                deletingId={deletingId}
                isLoading={isLoading}
                />
                    </div>

            <AlertDialog open={Boolean(supplierToDelete)} onOpenChange={(open) => !open && setSupplierToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                    <AlertDialogDescription>
                    Are you sure you want to delete {supplierToDelete?.name}? This action cannot be undone.
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