import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { SeasonTable } from '@/components/season/table';
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

import { deleteSeasons, fetchSeasons } from './api';

export default function Season() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const [seasons, setSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [seasonToDelete, setSeasonToDelete] = useState(null);

    useEffect(() => {
    setPageTitle('Seasons');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadSeasons() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchSeasons();
        if (!ignore) {
          setSeasons(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load Seasons.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadSeasons();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!seasonToDelete) {
      return;
    }

    const id = seasonToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteSeasons(id);
      setSeasons((previous) => (Array.isArray(previous) ? previous : []).filter((season) => season.id !== id));
      toast.success('Season deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setSeasonToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete Season.';
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
                <SeasonTable
                seasons={seasons}
                onAdd={() => navigate('/seasons/add')}
                onEdit={(id) => navigate(`/seasons/${id}/edit`)}
                onRequestDelete={setSeasonToDelete}
                deletingId={deletingId}
                isLoading={isLoading}
                />
                    </div>

            <AlertDialog open={Boolean(seasonToDelete)} onOpenChange={(open) => !open && setSeasonToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Delete Season</AlertDialogTitle>
                    <AlertDialogDescription>
                Are you sure you want to delete {seasonToDelete?.name}? This action cannot be undone.
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