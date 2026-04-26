import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import RackTable from "@/components/rack/table"
import { fetchRacks, deleteRack } from './api'
import { toast } from 'sonner'
import { useAppContext } from '@/context/AppContext'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export default function Rack(){
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [racks, setRacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [requestError, setRequestError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        setPageTitle('Racks');
    }, [setPageTitle]);

    const loadRacks = async () => {
        try {
            setIsLoading(true);
            setRequestError('');
            const data = await fetchRacks();
            setRacks(data);
        } catch (error) {
            const message = error.message || 'Failed to load racks.';
            setRequestError(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadRacks();
    }, []);

    const handleEdit = (id) => {
        navigate(`/racks/${id}/edit`);
    }

    const handleRequestDelete = (id) => {
        setDeleteConfirm(id);
    }

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await deleteRack(deleteConfirm);
            setRacks(racks.filter(r => r.id !== deleteConfirm));
            toast.success('Rack deleted successfully.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            const message = error.message || 'Failed to delete rack.';
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setDeleteConfirm(null);
        }
    }

    return (
        <>
            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                    <RackTable
                        data={racks}
                        isLoading={isLoading}
                        onAdd={() => navigate('/racks/add')}
                        onEdit={handleEdit}
                        onRequestDelete={handleRequestDelete}
                    />
                </div>
            </div>

            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Rack</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this rack? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}