import { useEffect, useMemo, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';

import { fetchActivityLogs } from './api';

function formatDate(value) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return date.toLocaleString();
}

function normalizeText(value) {
    if (!value) {
        return '-';
    }

    return String(value)
        .replace(/\\\\/g, '/')
        .split('/')
        .pop();
}

export default function ActivityLog() {
    const { setPageTitle, isSuperAdmin, user } = useAppContext();
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 25,
        total: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setPageTitle('Activity Log');
    }, [setPageTitle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput.trim());
            setMeta((previous) => ({ ...previous, current_page: 1 }));
        }, 350);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (!isSuperAdmin) {
            setIsLoading(false);
            return;
        }

        let ignore = false;

        async function loadLogs() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const payload = await fetchActivityLogs({
                    page: meta.current_page,
                    perPage: meta.per_page,
                    search: searchTerm,
                });

                if (ignore) {
                    return;
                }

                setLogs(Array.isArray(payload?.data) ? payload.data : []);
                setMeta({
                    current_page: Number(payload?.current_page || 1),
                    last_page: Number(payload?.last_page || 1),
                    per_page: Number(payload?.per_page || 25),
                    total: Number(payload?.total || 0),
                });
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load activity logs.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadLogs();

        return () => {
            ignore = true;
        };
    }, [isSuperAdmin, meta.current_page, meta.per_page, searchTerm]);

    const canGoPrevious = useMemo(() => meta.current_page > 1, [meta.current_page]);
    const canGoNext = useMemo(() => meta.current_page < meta.last_page, [meta.current_page, meta.last_page]);

    if (!user) {
        return <p className="text-sm text-muted-foreground">Loading user context...</p>;
    }

    if (!isSuperAdmin) {
        return <p className="text-sm text-destructive">Forbidden. Only super admins can view activity logs.</p>;
    }

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="flex items-center justify-between gap-3">
                <Input
                    placeholder="Search by event, log name, or description..."
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="max-w-md"
                />
                <p className="text-sm text-muted-foreground">Total: {meta.total}</p>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[90px]">ID</TableHead>
                            <TableHead>When</TableHead>
                            <TableHead>Actor</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Log</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Subject</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    Loading activity logs...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && logs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No activity logs found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-medium">{log.id}</TableCell>
                                <TableCell>{formatDate(log.created_at)}</TableCell>
                                <TableCell>{log.causer?.name || log.causer?.email || '-'}</TableCell>
                                <TableCell>{log.event || '-'}</TableCell>
                                <TableCell>{log.log_name || '-'}</TableCell>
                                <TableCell>{log.description || '-'}</TableCell>
                                <TableCell>
                                    {normalizeText(log.subject_type)}
                                    {log.subject_id ? ` #${log.subject_id}` : ''}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex items-center justify-end gap-2">
                <button
                    type="button"
                    className="inline-flex h-9 items-center rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setMeta((previous) => ({ ...previous, current_page: previous.current_page - 1 }))}
                    disabled={!canGoPrevious}
                >
                    Previous
                </button>
                <span className="text-sm text-muted-foreground">
                    Page {meta.current_page} of {meta.last_page}
                </span>
                <button
                    type="button"
                    className="inline-flex h-9 items-center rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setMeta((previous) => ({ ...previous, current_page: previous.current_page + 1 }))}
                    disabled={!canGoNext}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
