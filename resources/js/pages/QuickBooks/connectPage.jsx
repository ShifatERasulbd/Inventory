import { useEffect } from 'react';

import QuickBooksConnect from '@/components/quickbooks/QuickBooksConnect';
import { useAppContext } from '@/context/AppContext';

export default function QuickBooksConnectPage() {
    const { setPageTitle } = useAppContext();

    useEffect(() => {
        setPageTitle('QuickBooks Connect');
    }, [setPageTitle]);

    return (
        <div className="space-y-5">
            <QuickBooksConnect autoStart={false} />
        </div>
    );
}
