import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAppContext } from '@/context/AppContext';
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
import WarehouseTable from '@/components/warehouse/table';

import { deleteWarehouse, fetchWarehouses } from './api';
import Preloader from '@/components/Preloader';

export default function Warehouse() {
    const navigate = useNavigate();
    const { setPageTitle, can } = useAppContext();
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [warehouseToDelete, setWarehouseToDelete] = useState(null);
    const canCreate = can('create', 'warehouses');
    const canUpdate = can('update', 'warehouses');
    const canDelete = can('delete', 'warehouses');

    useEffect(() => {
        setPageTitle('Warehouses');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadWarehouses() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchWarehouses();
                if (!ignore) {
                    setWarehouses(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load warehouses.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadWarehouses();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!warehouseToDelete) {
            return;
        }

        const id = warehouseToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteWarehouse(id);
            setWarehouses((previous) =>
                (Array.isArray(previous) ? previous : []).filter((warehouse) => warehouse.id !== id)
            );
            toast.success('Warehouse deleted successfully.', {
                style: { color: '#16a34a' },
            });
            setWarehouseToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete warehouse.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
} finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
          return (
                            <div className="relative min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl bg-background">
                                <Preloader message="Loading Warehouse..." fullScreen={false} />
                            </div>
                        );
    }

    return (
        <>
           <div className="space-y-5">
                {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <WarehouseTable
                    warehouses={warehouses}
                    isLoading={isLoading}
                    deletingId={deletingId}
                    onAdd={() => navigate('/warehouses/add')}
                    onEdit={(id) => navigate(`/warehouses/${id}/edit`)}
                    onRequestDelete={setWarehouseToDelete}
                    canCreate={canCreate}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                />
                </div>

                <AlertDialog
                    open={Boolean(warehouseToDelete)}
                    onOpenChange={(open) => !open && setWarehouseToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Warehouse</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete {warehouseToDelete?.name}? This action cannot be undone.
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
        </>
    );
}