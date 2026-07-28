import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RackRowTable from '@/components/rackrow/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { fetchRackRows, deleteRackRow } from './api';
import { fetchRack } from '@/pages/Rack/api';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Preloader from '@/components/Preloader';

export default function RackRows() {
    const navigate = useNavigate();
    const { rack_id } = useParams();
    const { setPageTitle } = useAppContext();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [requestError, setRequestError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [rackName, setRackName] = useState('');
    const [warehouseName, setWarehouseName] = useState('');

    useEffect(() => {
        setPageTitle(rackName ? `Rack Rows - ${rackName}` : 'Rack Rows');
    }, [setPageTitle, rackName]);

    const loadRows = async () => {
        try {
            setIsLoading(true);
            setRequestError('');
            const data = await fetchRackRows(rack_id);
            setRows(Array.isArray(data) ? data : []);

            try {
                const rack = await fetchRack(rack_id);
                setRackName(rack?.name || `Rack #${rack_id}`);
                setWarehouseName(rack?.warehouse?.name || '');
            } catch {
                setRackName(`Rack #${rack_id}`);
                setWarehouseName('');
            }
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

    const handleManageColumns = (rowId) => {
        navigate(`/racks/${rack_id}/columns?row_id=${rowId}`);
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

    if (isLoading) {
          return (
                            <div className="relative min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl bg-background">
                                <Preloader message="Loading Rack Rows..." fullScreen={false} />
                            </div>
                        );
    }

    return (
        <>
            <div className="space-y-5">
                <div className="rounded-lg border bg-card px-4 py-3">
                    <p className="text-xs text-muted-foreground">Viewing rows for</p>
                    <p className="text-lg font-semibold">{rackName || `Rack #${rack_id}`}</p>
                    {warehouseName && <p className="text-xs text-muted-foreground">Warehouse: {warehouseName}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                    <RackRowTable
                        data={rows}
                        isLoading={isLoading}
                        onAdd={() => navigate(`/racks/${rack_id}/rows/add`)}
                        onEdit={handleEdit}
                        onRequestDelete={handleRequestDelete}
                        onManageColumns={handleManageColumns}
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
