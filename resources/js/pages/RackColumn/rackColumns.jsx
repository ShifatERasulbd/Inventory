import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import RackColumnTable from '@/components/rackcolumn/table';
import { fetchRackColumns, deleteRackColumn } from './api';
import { fetchRack } from '@/pages/Rack/api';
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

export default function RackColumns() {
  const navigate = useNavigate();
  const location = useLocation();
  const { rack_id } = useParams();
  const { setPageTitle } = useAppContext();

  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [rackName, setRackName] = useState('');
  const [warehouseName, setWarehouseName] = useState('');

  const selectedRowId = new URLSearchParams(location.search).get('row_id') || '';

  useEffect(() => {
    setPageTitle(rackName ? `Rack Columns - ${rackName}` : 'Rack Columns');
  }, [setPageTitle, rackName]);

  const filteredColumns = selectedRowId
    ? columns.filter((column) => String(column.row_id) === String(selectedRowId))
    : columns;

  const loadColumns = async () => {
    try {
      setIsLoading(true);
      setRequestError('');

      const data = await fetchRackColumns(rack_id);
      setColumns(Array.isArray(data) ? data : []);

      try {
        const rack = await fetchRack(rack_id);
        setRackName(rack?.name || `Rack #${rack_id}`);
        setWarehouseName(rack?.warehouse?.name || '');
      } catch {
        setRackName(`Rack #${rack_id}`);
        setWarehouseName('');
      }
    } catch (error) {
      const message = error.message || 'Failed to load columns.';
      setRequestError(message);
      toast.error(message, { style: { color: '#dc2626' } });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadColumns();
  }, [rack_id]);

  const handleEdit = (id) => {
    navigate(`/racks/${rack_id}/columns/${id}/edit`);
  };

  const handleRequestDelete = (id) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteRackColumn(rack_id, deleteConfirm);
      setColumns(columns.filter((c) => c.id !== deleteConfirm));
      toast.success('Column deleted successfully.', { style: { color: '#16a34a' } });
    } catch (error) {
      const message = error.message || 'Failed to delete column.';
      toast.error(message, { style: { color: '#dc2626' } });
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <div className="space-y-5">
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Viewing columns for</p>
          <p className="text-lg font-semibold">{rackName || `Rack #${rack_id}`}</p>
          {warehouseName && (
            <p className="text-xs text-muted-foreground">Warehouse: {warehouseName}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
          <RackColumnTable
            data={filteredColumns}
            isLoading={isLoading}
            onAdd={() => navigate(`/racks/${rack_id}/columns/add${selectedRowId ? `?row_id=${selectedRowId}` : ''}`)}
            onEdit={handleEdit}
            onRequestDelete={handleRequestDelete}
          />
        </div>

        {requestError && <p className="text-sm text-destructive">{requestError}</p>}
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this column? This action cannot be undone.
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

