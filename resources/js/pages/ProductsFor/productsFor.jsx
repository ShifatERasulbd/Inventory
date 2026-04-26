import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ProductsForTable } from '@/components/productsfor/table';
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

import { deleteProductsFor, fetchProductsFor } from './api';

export default function ProductsFor() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const [productsFor, setProductsFor] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [productsForToDelete, setProductsForToDelete] = useState(null);

    useEffect(() => {
    setPageTitle('Products For');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadProductsFor() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchProductsFor();
        if (!ignore) {
          setProductsFor(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load Products For.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadProductsFor();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!productsForToDelete) {
      return;
    }

    const id = productsForToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteProductsFor(id);
      setProductsFor((previous) => (Array.isArray(previous) ? previous : []).filter((productFor) => productFor.id !== id));
      toast.success('Products For deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setProductsForToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete Products For.';
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
                <ProductsForTable
                productsFor={productsFor}
                onAdd={() => navigate('/productsfor/add')}
                onEdit={(id) => navigate(`/productsfor/${id}/edit`)}
                onRequestDelete={setProductsForToDelete}
                deletingId={deletingId}
                isLoading={isLoading}
                />
                    </div>

              <AlertDialog open={Boolean(productsForToDelete)} onOpenChange={(open) => !open && setProductsForToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Products For</AlertDialogTitle>
                    <AlertDialogDescription>
                  Are you sure you want to delete {productsForToDelete?.name}? This action cannot be undone.
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