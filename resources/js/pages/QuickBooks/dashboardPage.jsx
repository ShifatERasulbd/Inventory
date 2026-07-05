import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import QuickBooksConnect from '@/components/quickbooks/QuickBooksConnect';
import { useAppContext } from '@/context/AppContext';

export default function DashboardPage() {
    const { setPageTitle } = useAppContext();
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');

    useEffect(() => {
        setPageTitle('QuickBooks');
    }, [setPageTitle]);

    useEffect(() => {
        const status = searchParams.get('status');
        const realmId = searchParams.get('realmId');
        const reason = searchParams.get('reason');
        const description = searchParams.get('description');

        if (status === 'success') {
            toast.success('QuickBooks connected successfully.');
            console.log(`Successfully connected to QuickBooks company ID: ${realmId}`);
            return;
        }

        if (status === 'error') {
            const reasonText = reason || 'unknown_error';
            const message = description ? `${reasonText}: ${description}` : reasonText;
            toast.error(`QuickBooks connection failed (${message})`);
        }
    }, [searchParams]);

    return (
        <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-600">
                    If your sync status shows pending connection, open troubleshooting to validate config, token health, and reconnect.
                </p>
                <Link
                    to="/quickbooks/troubleshoot"
                    className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                    Open QuickBooks Troubleshooter
                </Link>
            </div>
            <QuickBooksConnect autoStart={!status} />
        </div>
    );
}
