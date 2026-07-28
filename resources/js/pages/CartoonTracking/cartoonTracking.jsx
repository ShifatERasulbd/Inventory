import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import CartoonTrackingTable from '@/components/cartoonTracking/table';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';

import {
    assignCartoonRack,
    fetchCartoonTracking,
    fetchRackColumns,
    fetchRackRows,
    fetchRacks,
} from './api';
import Preloader from '@/components/Preloader';

export default function CartoonTracking() {
    const { setPageTitle } = useAppContext();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingRow, setEditingRow] = useState(null);
    const [racks, setRacks] = useState([]);
    const [rackRows, setRackRows] = useState([]);
    const [rackColumns, setRackColumns] = useState([]);
    const [selectedRackId, setSelectedRackId] = useState('');
    const [selectedRackRowId, setSelectedRackRowId] = useState('');
    const [selectedRackColumnId, setSelectedRackColumnId] = useState('');
    const [isSavingPlacement, setIsSavingPlacement] = useState(false);

    useEffect(() => {
        setPageTitle('Cartoon Tracking');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadTracking() {
            setIsLoading(true);

            try {
                const data = await fetchCartoonTracking();
                if (!ignore) {
                    setRows(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setRows([]);
                    toast.error(error.message || 'Failed to load cartoon tracking.', {
                        style: { color: '#dc2626' },
                    });
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadTracking();

        return () => {
            ignore = true;
        };
    }, []);

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return rows;

        return rows.filter((row) => {
            return (
                String(row.cartoon_number ?? '').toLowerCase().includes(query) ||
                String(row.po_number ?? '').toLowerCase().includes(query) ||
                String(row.po_status ?? '').toLowerCase().includes(query) ||
                String(row.warehouse_name ?? '').toLowerCase().includes(query)
            );
        });
    }, [rows, search]);

    const destinationRacks = useMemo(() => {
        if (!editingRow?.warehouse_id) {
            return [];
        }

        return racks.filter((rack) => (
            Number(rack?.warehouse_id ?? 0) === Number(editingRow.warehouse_id)
        ));
    }, [editingRow, racks]);

    const openEditRackDialog = async (row) => {
        if (!row?.id) {
            return;
        }

        setEditingRow(row);
        setSelectedRackId(row.rack_id ? String(row.rack_id) : '');
        setSelectedRackRowId(row.rack_row_id ? String(row.rack_row_id) : '');
        setSelectedRackColumnId(row.rack_column_id ? String(row.rack_column_id) : '');
        setRackRows([]);
        setRackColumns([]);

        try {
            const rackData = await fetchRacks();
            const rackList = Array.isArray(rackData) ? rackData : [];
            setRacks(rackList);

            if (row.rack_id) {
                const [rowsData, columnsData] = await Promise.all([
                    fetchRackRows(row.rack_id),
                    fetchRackColumns(row.rack_id),
                ]);
                setRackRows(Array.isArray(rowsData) ? rowsData : []);
                setRackColumns(Array.isArray(columnsData) ? columnsData : []);
            }
        } catch (error) {
            setRacks([]);
            setRackRows([]);
            setRackColumns([]);
            toast.error(error.message || 'Failed to load rack options.', {
                style: { color: '#dc2626' },
            });
        }
    };

    const closeEditRackDialog = (nextOpen) => {
        if (nextOpen) {
            return;
        }

        setEditingRow(null);
        setSelectedRackId('');
        setSelectedRackRowId('');
        setSelectedRackColumnId('');
        setRackRows([]);
        setRackColumns([]);
    };

    const handleRackChange = async (value) => {
        setSelectedRackId(value);
        setSelectedRackRowId('');
        setSelectedRackColumnId('');

        if (!value) {
            setRackRows([]);
            setRackColumns([]);
            return;
        }

        try {
            const [rowsData, columnsData] = await Promise.all([
                fetchRackRows(value),
                fetchRackColumns(value),
            ]);

            setRackRows(Array.isArray(rowsData) ? rowsData : []);
            setRackColumns(Array.isArray(columnsData) ? columnsData : []);
        } catch (error) {
            setRackRows([]);
            setRackColumns([]);
            toast.error(error.message || 'Failed to load rack rows and columns.', {
                style: { color: '#dc2626' },
            });
        }
    };

    const handleSavePlacement = async () => {
        if (!editingRow?.id) {
            return;
        }

        if (!selectedRackId) {
            toast.error('Please select a rack first.', {
                style: { color: '#dc2626' },
            });
            return;
        }

        setIsSavingPlacement(true);

        try {
            await assignCartoonRack(editingRow.id, {
                rack_id: Number(selectedRackId),
                ...(selectedRackRowId ? { rack_row_id: Number(selectedRackRowId) } : {}),
                ...(selectedRackColumnId ? { rack_column_id: Number(selectedRackColumnId) } : {}),
            });

            const refreshedRows = await fetchCartoonTracking();
            setRows(Array.isArray(refreshedRows) ? refreshedRows : []);

            toast.success('Rack placement updated successfully.', {
                style: { color: '#16a34a' },
            });

            closeEditRackDialog(false);
        } catch (error) {
            toast.error(error.message || 'Failed to update rack placement.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSavingPlacement(false);
        }
    };

    const availableColumns = useMemo(() => {
        if (!selectedRackRowId) {
            return rackColumns;
        }

        return rackColumns.filter((column) => (
            Number(column?.row_id ?? 0) === Number(selectedRackRowId)
        ));
    }, [rackColumns, selectedRackRowId]);

    if (isLoading) {
        return (
            <div className="relative min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl bg-background">
                <Preloader message="Loading Carton Tracking ..." fullScreen={false} />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="max-w-sm">
                <Input
                    placeholder="Search by cartoon, PO number, status..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            <CartoonTrackingTable
                rows={filteredRows}
                isLoading={isLoading}
                onEditRack={openEditRackDialog}
                updatingCartoonId={isSavingPlacement ? editingRow?.id : null}
            />

            <AlertDialog open={Boolean(editingRow)} onOpenChange={closeEditRackDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit Rack Placement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update rack, rack row, and rack column for cartoon {editingRow?.cartoon_number || 'N/A'}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Rack</Label>
                            <Select value={selectedRackId} onValueChange={handleRackChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select rack" />
                                </SelectTrigger>
                                <SelectContent>
                                    {destinationRacks.map((rack) => (
                                        <SelectItem key={rack.id} value={String(rack.id)}>
                                            {rack.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Rack Row</Label>
                            <Select
                                value={selectedRackRowId}
                                onValueChange={(value) => {
                                    setSelectedRackRowId(value);
                                    setSelectedRackColumnId('');
                                }}
                                disabled={!selectedRackId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select rack row (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rackRows.map((rackRow) => (
                                        <SelectItem key={rackRow.id} value={String(rackRow.id)}>
                                            {rackRow.row_number}{rackRow.code ? ` (${rackRow.code})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Rack Column</Label>
                            <Select
                                value={selectedRackColumnId}
                                onValueChange={setSelectedRackColumnId}
                                disabled={!selectedRackId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select rack column (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableColumns.map((column) => (
                                        <SelectItem key={column.id} value={String(column.id)}>
                                            {column.column_number}{column.code ? ` (${column.code})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSavingPlacement}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                handleSavePlacement();
                            }}
                            disabled={isSavingPlacement}
                        >
                            {isSavingPlacement ? 'Saving...' : 'Save Changes'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
