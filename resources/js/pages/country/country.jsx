import { useEffect } from 'react';

import { CountryTable } from '@/components/country/table';
import { useAppContext } from '@/context/AppContext';

export default function Countries() {
    const { setPageTitle } = useAppContext();

    useEffect(() => {
        setPageTitle('Country');
    }, [setPageTitle]);

    return (
        <>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <CountryTable />
            </div>
          </div>
        </>
    );
}