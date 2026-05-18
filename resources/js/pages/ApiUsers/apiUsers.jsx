import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
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
import { Trash2, Eye, Pencil } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

import {
    createApiKey,
    deleteApiKey,
    fetchApiKeys,
    fetchUsersForApiKey,
    fetchWarehouses,
} from './api';

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

export default function ApiUsers() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [apiKeys, setApiKeys] = useState([]);
    const [users, setUsers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [createdApiKey, setCreatedApiKey] = useState('');
    const [form, setForm] = useState({
        user_id: '',
        name: '',
        expires_at: '',
        warehouse_ids: [],
    });

    useEffect(() => {
        setPageTitle('API Users');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadApiUsers() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const [keys, usersPayload, warehousesPayload] = await Promise.all([
                    fetchApiKeys(),
                    fetchUsersForApiKey(),
                    fetchWarehouses(),
                ]);

                if (ignore) {
                    return;
                }

                setApiKeys(Array.isArray(keys) ? keys : []);
                setUsers(Array.isArray(usersPayload) ? usersPayload : []);
                setWarehouses(Array.isArray(warehousesPayload) ? warehousesPayload : []);
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load API users.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadApiUsers();

        return () => {
            ignore = true;
        };
    }, []);

    const userSummaries = useMemo(() => {
        const groupedByUser = apiKeys.reduce((accumulator, token) => {
            const userId = token?.user?.id;

            if (!userId) {
                return accumulator;
            }

            if (!accumulator.has(userId)) {
                accumulator.set(userId, {
                    id: userId,
                    name: token.user.name || '-',
                    email: token.user.email || '-',
                    keyCount: 0,
                    lastUsedAt: token.last_used_at || null,
                    expiresAt: token.expires_at || null,
                });
            }

            const current = accumulator.get(userId);
            current.keyCount += 1;

            if (token.last_used_at && (!current.lastUsedAt || new Date(token.last_used_at) > new Date(current.lastUsedAt))) {
                current.lastUsedAt = token.last_used_at;
            }

            if (token.expires_at && (!current.expiresAt || new Date(token.expires_at) > new Date(current.expiresAt))) {
                current.expiresAt = token.expires_at;
            }

            return accumulator;
        }, new Map());

        return Array.from(groupedByUser.values());
    }, [apiKeys]);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return userSummaries;
        }

        return userSummaries.filter((user) => (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        ));
    }, [userSummaries, search]);

    const refreshApiKeys = async () => {
        const keys = await fetchApiKeys();
        setApiKeys(Array.isArray(keys) ? keys : []);
    };

    const handleCreateKey = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setCreatedApiKey('');
        setSubmitting(true);

        try {
            const payload = {
                user_id: Number(form.user_id),
                name: form.name.trim(),
            };

            if (form.expires_at) {
                payload.expires_at = form.expires_at;
            }

            if (form.warehouse_ids.length > 0) {
                payload.warehouse_ids = form.warehouse_ids.map(Number);
            }

            const response = await createApiKey(payload);
            setCreatedApiKey(response?.api_key || '');
            await refreshApiKeys();
            setForm({
                user_id: form.user_id,
                name: '',
                expires_at: '',
                warehouse_ids: [],
            });
        } catch (error) {
            const validationErrors = error?.payload?.errors;

            if (validationErrors && typeof validationErrors === 'object') {
                const firstMessage = Object.values(validationErrors)?.[0]?.[0];
                setErrorMessage(firstMessage || error.message || 'Failed to create API key.');
            } else {
                setErrorMessage(error.message || 'Failed to create API key.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteKey = async (tokenId) => {
        setErrorMessage('');
        setDeletingId(tokenId);

        try {
            await deleteApiKey(tokenId);
            await refreshApiKeys();
        } catch (error) {
            setErrorMessage(error.message || 'Failed to revoke API key.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            {createdApiKey && (
                <Card className="p-4">
                    <p className="mb-2 text-sm font-medium">New API key (copy now):</p>
                    <p className="break-all rounded border bg-muted/20 p-2 text-sm">{createdApiKey}</p>
                </Card>
            )}

            <Card className="p-4">
                <form className="space-y-3" onSubmit={handleCreateKey}>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={form.user_id}
                            onChange={(event) => setForm((previous) => ({ ...previous, user_id: event.target.value }))}
                            required
                        >
                            <option value="">Select user</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                            ))}
                        </select>

                        <Input
                            placeholder="API key name"
                            value={form.name}
                            onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                            required
                        />

                        <Input
                            type="datetime-local"
                            value={form.expires_at}
                            onChange={(event) => setForm((previous) => ({ ...previous, expires_at: event.target.value }))}
                        />
                    </div>

                    {warehouses.length > 0 && (
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-sm font-medium text-muted-foreground">Warehouses:</span>
                            {warehouses.map((wh) => {
                                const checked = form.warehouse_ids.includes(String(wh.id));
                                return (
                                    <label key={wh.id} className="flex cursor-pointer items-center gap-1.5 text-sm">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-input"
                                            checked={checked}
                                            onChange={(event) => {
                                                setForm((previous) => {
                                                    const ids = previous.warehouse_ids;
                                                    return {
                                                        ...previous,
                                                        warehouse_ids: event.target.checked
                                                            ? [...ids, String(wh.id)]
                                                            : ids.filter((id) => id !== String(wh.id)),
                                                    };
                                                });
                                            }}
                                        />
                                        {wh.name}
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create API Key'}
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="flex items-center gap-3 justify-between">
                <Input
                    placeholder="Search API users by name or email..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="max-w-md"
                />
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">SL No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>API Keys</TableHead>
                            <TableHead>Last Key Usage</TableHead>
                            <TableHead>Latest Expiry</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    Loading API users...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && userSummaries.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No API users found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filteredUsers.length === 0 && userSummaries.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No users match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filteredUsers.map((user, index) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.keyCount}</TableCell>
                                <TableCell>{formatDate(user.lastUsedAt)}</TableCell>
                                <TableCell>{formatDate(user.expiresAt)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/api-user/${user.id}`)}
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm" disabled>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
