import react from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import WarehouseTable from '@/components/warehouse/table'
export default function Warehouse(){
    const navigate =useNavigate();
    const { setPageTitle } = useAppContext();
    return (
        <>
           <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <WarehouseTable
                      onAdd={() => navigate('/warehouses/add')}
                />
           </div>
        </>
    )
}  