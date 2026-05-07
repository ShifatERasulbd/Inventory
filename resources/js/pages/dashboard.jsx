import { useEffect, useState } from 'react';

import { HeaderCard } from '@/components/dashboard/Header-Card';
import { StockOverviewChart } from '@/components/dashboard/chart';
import { LowStockAlertTable } from '@/components/dashboard/low-stock-alertTable';
import { useAppContext } from '@/context/AppContext';
import { fetchProducts } from '@/pages/Product/api';
import { fetchWarehouses } from '@/pages/Warehouse/api';
import { fetchUsers } from '@/pages/User/api';
import { fetchPurchases } from '@/pages/Purchase/api';
import { fetchSells } from '@/pages/Sell/api';

export default function Dashboard() {
    const { setPageTitle } = useAppContext();
    const [totalProducts, setTotalProducts] = useState(0);
    const [availableWarehouses, setAvailableWarehouses] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPurchases, setTotalPurchases] = useState(0);
    const [totalSells, setTotalSells] = useState(0);

    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadTotalProducts() {
            try {
                const products = await fetchProducts();
                if (!ignore) {
                    setTotalProducts(Array.isArray(products) ? products.length : 0);
                }
            } catch {
                if (!ignore) {
                    setTotalProducts(0);
                }
            }
        }

        loadTotalProducts();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadWarehousesCount() {
            try {
                const warehouses = await fetchWarehouses();
                if (!ignore) {
                    setAvailableWarehouses(Array.isArray(warehouses) ? warehouses.length : 0);
                }
            } catch {
                if (!ignore) {
                    setAvailableWarehouses(0);
                }
            }
        }

        loadWarehousesCount();

        return () => {
            ignore = true;
        };
    }, []);
    
    useEffect(()=>{
        let ignore =false;

        async function loadUsersCount(){
            try{
                const users =await fetchUsers();
                if(!ignore){
                    setTotalUsers(Array.isArray(users)? users.length :0);
                }
            } catch{
                    if(!ignore){
                        setTotalUsers(0);
                    }
            }
        }
        loadUsersCount();

        return()=>{
            ignore =true;
        };
    }, []);

    useEffect(()=>{
        let ignore =false;
        async function loadPurchases(){
            try{
                const purchases =await fetchPurchases();
                if(!ignore){
                    setTotalPurchases(Array.isArray(purchases)? purchases.length :0);
                }
            }catch{
                if(!ignore){
                    setTotalPurchases(0);
                }
            }
        }
        loadPurchases();
        return()=>{
            ignore =true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadSells() {
            try {
                const sells = await fetchSells();
                if (!ignore) {
                    setTotalSells(Array.isArray(sells) ? sells.length : 0);
                }
            } catch {
                if (!ignore) {
                    setTotalSells(0);
                }
            }
        }

        loadSells();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <HeaderCard
                 totalProducts={totalProducts} 
                 availableWarehouses={availableWarehouses} 
                 totalUsers={totalUsers}
                 totalPurchases={totalPurchases}
                 totalSells={totalSells}
                 />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <LowStockAlertTable />
                <StockOverviewChart />
            </div>
        </div>
    );
}