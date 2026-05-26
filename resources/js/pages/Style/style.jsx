import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { StyleTable } from '@/components/style/table';
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

import { deleteStyles, fetchStyles } from './api';

export default function Style() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const [styles, setStyles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [styleToDelete, setStyleToDelete] = useState(null);

  useEffect(() => {
    setPageTitle('Styles');
  }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadStyles() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchStyles();
        if (!ignore) {
          setStyles(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load Styles.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadStyles();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!styleToDelete) {
      return;
    }

    const id = styleToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteStyles(id);
      setStyles((previous) => (Array.isArray(previous) ? previous : []).filter((style) => style.id !== id));
      toast.success('Style deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setStyleToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete Style.';
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
        <StyleTable
          styles={styles}
          onAdd={() => navigate('/styles/add')}
          onEdit={(id) => navigate(`/styles/${id}/edit`)}
          onRequestDelete={setStyleToDelete}
          deletingId={deletingId}
          isLoading={isLoading}
        />
      </div>

      <AlertDialog open={Boolean(styleToDelete)} onOpenChange={(open) => !open && setStyleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Style</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {styleToDelete?.name}? This action cannot be undone.
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
