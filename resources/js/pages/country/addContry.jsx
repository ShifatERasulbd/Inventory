import { useEffect } from 'react';
import AddForm from '@/components/country/addForm';

import { useAppContext } from '@/context/AppContext';

export default function AddContry() {
    const { setPageTitle } = useAppContext();

    useEffect(() => {
        setPageTitle('Add Country');
    }, [setPageTitle]);

    return (
       <>
            <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddForm />
            </div>
            </div>
        </>
    );
}