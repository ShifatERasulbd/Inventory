import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import CartoonTrackingTable from '@/components/cartoonTracking/table';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';

import { fetchCartoonTracking } from './api';

export default function CartoonTracking() {
    const { setPageTitle } = useAppContext();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

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

    return (
        <div className="space-y-5">
            <div className="max-w-sm">
                <Input
                    placeholder="Search by cartoon, PO number, status..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            <CartoonTrackingTable rows={filteredRows} isLoading={isLoading} />
        </div>
    );
}
