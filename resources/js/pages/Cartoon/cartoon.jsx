import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { CartoonTable } from '@/components/cartoon/table';
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

import { deleteCartoon, fetchCartoons } from './api';

export default function Cartoon() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const [cartoons, setCartoons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [cartoonToDelete, setCartoonToDelete] = useState(null);

    useEffect(() => {
    setPageTitle('Cartoons');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadCartoons() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchCartoons();
        if (!ignore) {
          setCartoons(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load Cartoons.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCartoons();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!cartoonToDelete) {
      return;
    }

    const id = cartoonToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteCartoon(id);
      setCartoons((previous) => (Array.isArray(previous) ? previous : []).filter((cartoon) => cartoon.id !== id));
      toast.success('Cartoon deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setCartoonToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete Cartoon.';
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
                <CartoonTable
                cartoons={cartoons}
                onAdd={() => navigate('/cartoons/add')}
                onEdit={(id) => navigate(`/cartoons/${id}/edit`)}
                onRequestDelete={setCartoonToDelete}
                deletingId={deletingId}
                isLoading={isLoading}
                />
                    </div>

            <AlertDialog open={Boolean(cartoonToDelete)} onOpenChange={(open) => !open && setCartoonToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Cartoon</AlertDialogTitle>
                    <AlertDialogDescription>
                    Are you sure you want to delete {cartoonToDelete?.name}? This action cannot be undone.
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