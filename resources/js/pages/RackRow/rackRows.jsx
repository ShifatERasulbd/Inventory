import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RackRowTable from '@/components/rackrow/table';
import { fetchRackRows, deleteRackRow } from './api';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function RackRows() {
    const navigate = useNavigate();
    const { rack_id } = useParams();
    const { setPageTitle } = useAppContext();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [requestError, setRequestError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        setPageTitle('Rack Rows');
    }, [setPageTitle]);

    const loadRows = async () => {
        try {
            setIsLoading(true);
            setRequestError('');
            const data = await fetchRackRows(rack_id);
            setRows(data);
        } catch (error) {
            const message = error.message || 'Failed to load rows.';
            setRequestError(message);
            toast.error(message, { style: { color: '#dc2626' } });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRows();
    }, [rack_id]);

    const handleEdit = (id) => {
        navigate(`/racks/${rack_id}/rows/${id}/edit`);
    };

    const handleRequestDelete = (id) => {
        setDeleteConfirm(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await deleteRackRow(rack_id, deleteConfirm);
            setRows(rows.filter((r) => r.id !== deleteConfirm));
            toast.success('Row deleted successfully.', { style: { color: '#16a34a' } });
        } catch (error) {
            const message = error.message || 'Failed to delete row.';
            toast.error(message, { style: { color: '#dc2626' } });
        } finally {
            setDeleteConfirm(null);
        }
    };

    return (
        <>
            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                    <RackRowTable
                        data={rows}
                        isLoading={isLoading}
                        onAdd={() => navigate(`/racks/${rack_id}/rows/add`)}
                        onEdit={handleEdit}
                        onRequestDelete={handleRequestDelete}
                    />
                </div>
                {requestError && (
                    <p className="text-sm text-destructive">{requestError}</p>
                )}
            </div>

            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Row</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this row? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
