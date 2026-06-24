import { useEffect } from 'react';
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
            <QuickBooksConnect autoStart={!status} />
        </div>
    );
}
