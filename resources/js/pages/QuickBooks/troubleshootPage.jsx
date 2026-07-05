import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { useAppContext } from '@/context/AppContext';

function StatusPill({ connected }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                connected
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-800'
            }`}
        >
            {connected ? 'Connected' : 'Pending Connection'}
        </span>
    );
}

export default function QuickBooksTroubleshootPage() {
    const { setPageTitle } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [reconnecting, setReconnecting] = useState(false);
    const [retryingSync, setRetryingSync] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        setPageTitle('QuickBooks Troubleshoot');
    }, [setPageTitle]);

    const loadDiagnostics = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/quickbooks/troubleshoot', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Troubleshoot request failed with status ${response.status}`);
            }

            const payload = await response.json();
            setData(payload);
        } catch (error) {
            toast.error(error.message || 'Unable to load QuickBooks diagnostics.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDiagnostics();
    }, [loadDiagnostics]);

    const startReconnect = async () => {
        setReconnecting(true);

        try {
            const response = await fetch('/api/quickbooks/reconnect', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Reconnect failed with status ${response.status}`);
            }

            const payload = await response.json();
            if (!payload?.url) {
                throw new Error('Reconnect endpoint did not return an authorization URL.');
            }

            window.location.href = payload.url;
        } catch (error) {
            toast.error(error.message || 'Unable to start QuickBooks reconnect.');
        } finally {
            setReconnecting(false);
        }
    };

    const retryPendingSync = async () => {
        setRetryingSync(true);

        try {
            const response = await fetch('/api/quickbooks/retry-retail-sales-sync?limit=500', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Retry sync failed with status ${response.status}`);
            }

            const payload = await response.json();
            toast.success(`Retry completed. Synced ${payload?.synced_count ?? 0} retail sales.`);
            await loadDiagnostics();
        } catch (error) {
            toast.error(error.message || 'Unable to retry QuickBooks sync.');
        } finally {
            setRetryingSync(false);
        }
    };

    const issues = useMemo(() => {
        if (!data?.issues || !Array.isArray(data.issues)) {
            return [];
        }

        return data.issues.filter(Boolean);
    }, [data]);

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">QuickBooks Connection Troubleshooter</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Diagnose pending connection issues, reconnect OAuth, and replay pending sync jobs.
                        </p>
                    </div>
                    <StatusPill connected={Boolean(data?.connected)} />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={loadDiagnostics}
                        disabled={loading}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Refreshing...' : 'Refresh Diagnostics'}
                    </button>

                    <button
                        type="button"
                        onClick={startReconnect}
                        disabled={reconnecting}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {reconnecting ? 'Opening QuickBooks...' : 'Reconnect QuickBooks'}
                    </button>

                    <button
                        type="button"
                        onClick={retryPendingSync}
                        disabled={retryingSync}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {retryingSync ? 'Retrying...' : 'Retry Pending Retail Sync'}
                    </button>

                    <Link
                        to="/quickbooks"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Open QuickBooks Dashboard
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Configuration</h2>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p>Client ID configured: {data?.configuration?.client_id_configured ? 'Yes' : 'No'}</p>
                        <p>Client Secret configured: {data?.configuration?.client_secret_configured ? 'Yes' : 'No'}</p>
                        <p>Redirect URI: {data?.configuration?.redirect_uri || 'Not configured'}</p>
                        <p>Redirect URI valid: {data?.configuration?.redirect_uri_valid ? 'Yes' : 'No'}</p>
                        <p>Environment: {data?.configuration?.environment || 'production'}</p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Token Status</h2>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p>Token record exists: {data?.token?.exists ? 'Yes' : 'No'}</p>
                        <p>Realm ID: {data?.token?.realm_id || 'N/A'}</p>
                        <p>Access token expires: {data?.token?.access_token_expires_at || 'N/A'}</p>
                        <p>Refresh token expires: {data?.token?.refresh_token_expires_at || 'N/A'}</p>
                        <p>Last token update: {data?.token?.updated_at || 'N/A'}</p>
                        <p>Auto-refresh in check: {data?.refreshed ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Pending QuickBooks Sync</h2>
                <div className="mt-3 flex flex-wrap gap-6 text-sm text-slate-700">
                    <p>Purchases pending connection: {data?.pending_sync?.purchases ?? 0}</p>
                    <p>Retail sales pending connection: {data?.pending_sync?.retail_sales ?? 0}</p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Detected Issues</h2>
                {issues.length === 0 ? (
                    <p className="mt-3 text-sm text-emerald-700">No configuration or token issues detected.</p>
                ) : (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">
                        {issues.map((issue) => (
                            <li key={issue}>{issue}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
