import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';
import StateTable from '@/components/state/table';
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
import { deleteState, fetchStates } from './api';

export default function States() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [states, setStates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [stateToDelete, setStateToDelete] = useState(null);

    useEffect(() => {
        setPageTitle('States');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadStates() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchStates();
                if (!ignore) {
                    setStates(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load states.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadStates();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!stateToDelete) {
            return;
        }

        const id = stateToDelete.id;

        setDeletingId(id);
        setErrorMessage('');
        try {
            await deleteState(id);
            setStates((previous) => (Array.isArray(previous) ? previous : []).filter((state) => state.id !== id));
            toast.success('State deleted successfully.', {
                style: { color: '#16a34a' },
            });
            setStateToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete state.';
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
                <StateTable
                    states={states}
                    isLoading={isLoading}
                    deletingId={deletingId}
                    onAdd={() => navigate('/states/add')}
                    onEdit={(id) => navigate(`/states/${id}/edit`)}
                    onRequestDelete={setStateToDelete}
                />
            </div>

            <AlertDialog open={Boolean(stateToDelete)} onOpenChange={(open) => !open && setStateToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete State</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {stateToDelete?.name}? This action cannot be undone.
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