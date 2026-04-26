import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { BrandTable } from '@/components/brand/table';
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

import { deleteBrand, fetchBrands } from './api';

export default function Brand() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [brandToDelete, setBrandToDelete] = useState(null);

    useEffect(() => {
    setPageTitle('Brands');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadBrands() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchBrands();
        if (!ignore) {
          setBrands(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load Brands.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadBrands();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!brandToDelete) {
      return;
    }

    const id = brandToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteBrand(id);
      setBrands((previous) => (Array.isArray(previous) ? previous : []).filter((brand) => brand.id !== id));
      toast.success('Brand deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setBrandToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete Brand.';
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
                <BrandTable
                brands={brands}
                onAdd={() => navigate('/brands/add')}
                onEdit={(id) => navigate(`/brands/${id}/edit`)}
                onRequestDelete={setBrandToDelete}
                deletingId={deletingId}
                isLoading={isLoading}
                />
                    </div>

            <AlertDialog open={Boolean(brandToDelete)} onOpenChange={(open) => !open && setBrandToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                    <AlertDialogDescription>
                    Are you sure you want to delete {brandToDelete?.name}? This action cannot be undone.
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