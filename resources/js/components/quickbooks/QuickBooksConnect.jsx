import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function QuickBooksConnect({ autoStart = true }) {
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [message, setMessage] = useState('Checking QuickBooks connection...');
    const hasStartedRef = useRef(false);

    const handleConnect = async () => {
        setLoading(true);
        setMessage('Redirecting to QuickBooks...');

        try {
            const response = await fetch('/api/quickbooks/connect', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Connection failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data?.url) {
                window.location.href = data.url;
                return;
            }

            throw new Error('Missing authorization URL in response');
        } catch (error) {
            console.error('Failed to initiate QuickBooks connection', error);
            toast.error('Unable to start QuickBooks connection. Please try again.');
            setMessage('Unable to start QuickBooks connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!autoStart || hasStartedRef.current) {
            return;
        }

        hasStartedRef.current = true;

        async function bootstrapConnection() {
            try {
                const response = await fetch('/api/quickbooks/status', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Status check failed with status ${response.status}`);
                }

                const data = await response.json();

                if (data?.connected) {
                    setConnected(true);
                    setMessage('QuickBooks is already connected.');
                    return;
                }

                await handleConnect();
            } catch (error) {
                console.error('Failed to check QuickBooks connection status', error);
                toast.error('Unable to check QuickBooks status.');
                setMessage('Unable to check QuickBooks status.');
            }
        }

        bootstrapConnection();
    }, [autoStart]);

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Accounting Integration</h3>
            <p className="mb-4 text-sm text-slate-500">
                Link your app with QuickBooks to sync inventory items, sales invoices, and customer accounts.
            </p>
            <p className="text-sm text-slate-600">{message}</p>
            {!connected && !loading ? (
                <button
                    onClick={handleConnect}
                    className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700"
                >
                    Retry QuickBooks Connect
                </button>
            ) : null}
        </div>
    );
}
