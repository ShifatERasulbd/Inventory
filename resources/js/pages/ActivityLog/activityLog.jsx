import { useEffect, useMemo, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';
import Preloader from '@/components/Preloader';

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

function formatValue(value) {
    if (value === null || value === undefined) {
        return '-';
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    if (value === '') {
        return '(empty)';
    }

    return String(value);
}

function buildChangeRows(log) {
    const properties = log?.properties && typeof log.properties === 'object' ? log.properties : {};
    const oldValues = properties.old && typeof properties.old === 'object' ? properties.old : {};
    const newValues = properties.attributes && typeof properties.attributes === 'object' ? properties.attributes : {};

    const keys = Array.from(new Set([...Object.keys(oldValues), ...Object.keys(newValues)]));

    return keys
        .map((key) => ({
            field: key,
            previous: oldValues[key],
            current: newValues[key],
        }))
        .filter((row) => JSON.stringify(row.previous) !== JSON.stringify(row.current));
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
    const [selectedLog, setSelectedLog] = useState(null);

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
    const selectedLogChanges = useMemo(() => buildChangeRows(selectedLog), [selectedLog]);

if (!user) {
        return <Preloader message="Loading user context..." />;
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
                            <TableRow
                                key={log.id}
                                className="cursor-pointer"
                                onClick={() => setSelectedLog(log)}
                            >
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

            <AlertDialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <AlertDialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Activity Details #{selectedLog?.id || '-'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedLog?.event || '-'} in {selectedLog?.log_name || '-'} at {formatDate(selectedLog?.created_at)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-3">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[35%]">Field</TableHead>
                                        <TableHead>Previous</TableHead>
                                        <TableHead>Changed To</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedLogChanges.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                No field-level changes found for this activity.
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {selectedLogChanges.map((change) => (
                                        <TableRow key={change.field}>
                                            <TableCell className="font-medium">{change.field}</TableCell>
                                            <TableCell className="break-all">{formatValue(change.previous)}</TableCell>
                                            <TableCell className="break-all">{formatValue(change.current)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium">Raw Properties</p>
                            <pre className="max-h-56 overflow-auto rounded-md bg-muted p-3 text-xs">
                                {JSON.stringify(selectedLog?.properties ?? {}, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
