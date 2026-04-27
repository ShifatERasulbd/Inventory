import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { FabricTable } from '@/components/fabric/table';
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

import { deleteFabrics, fetchFabrics } from './api';

export default function Fabric() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const [fabrics, setFabrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [fabricToDelete, setFabricToDelete] = useState(null);

    useEffect(() => {
    setPageTitle('Fabrics');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadFabrics() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchFabrics();
        if (!ignore) {
          setFabrics(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load Fabrics.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadFabrics();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!fabricToDelete) {
      return;
    }

    const id = fabricToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteFabrics(id);
      setFabrics((previous) => (Array.isArray(previous) ? previous : []).filter((fabric) => fabric.id !== id));
      toast.success('Fabric deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setFabricToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete Fabric.';
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
                <FabricTable
                fabrics={fabrics}
                onAdd={() => navigate('/fabrics/add')}
                onEdit={(id) => navigate(`/fabrics/${id}/edit`)}
                onRequestDelete={setFabricToDelete}
                deletingId={deletingId}
                isLoading={isLoading}
                />
                    </div>

            <AlertDialog open={Boolean(fabricToDelete)} onOpenChange={(open) => !open && setFabricToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Fabric</AlertDialogTitle>
                    <AlertDialogDescription>
                    Are you sure you want to delete {fabricToDelete?.name}? This action cannot be undone.
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