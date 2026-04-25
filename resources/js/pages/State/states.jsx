import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import StateTable from '@/components/state/table';
import { deleteState, fetchStates } from './api';

export default function States() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [states, setStates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);

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

    const handleDelete = async (id) => {
        setDeletingId(id);
        setErrorMessage('');
        try {
            await deleteState(id);
            setStates((previous) => (Array.isArray(previous) ? previous : []).filter((state) => state.id !== id));
        } catch (error) {
            setErrorMessage(error.message || 'Failed to delete state.');
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
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}