import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export function HeaderCard({ 
    totalProducts = 0, 
    availableWarehouses = 0 , 
    totalUsers =0,
    totalPurchases =0,
    pendingPurchases = 0,
    approvedPurchases = 0,
    totalSells = 0,
}) {
    const navigate = useNavigate();

    const row1 = [
        { title: 'Total Product', amount: totalProducts, prefix: '', path: '/products' },
        { title: 'Available Warehouses', amount: availableWarehouses, prefix: '', path: '/warehouses' },
        { title: 'Total Users', amount: totalUsers, prefix: '', path: '/users' },
        { title: 'Total Purchases Order', amount: totalPurchases, prefix: '', path: '/purchases' },
        { title: 'Total Sells', amount: totalSells, prefix: '', path: '/sells' },
    ];

    const row2 = [
        { title: 'Pending Purchases', amount: pendingPurchases, prefix: '', path: '/purchases', amountClass: 'text-red-600' },
        { title: 'Approved Purchases', amount: approvedPurchases, prefix: '', path: '/purchases', amountClass: '' },
    ];

    const renderCard = (item) => (
        <Card
            key={item.title}
            role="button"
            tabIndex={0}
            className="cursor-pointer transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => navigate(item.path)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(item.path);
                }
            }}
        >
            <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>Click to view details</CardDescription>
            </CardHeader>
            <CardContent>
                <p><b className={item.amountClass || ''}>{item.prefix}{item.amount}</b></p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4 col-span-full">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {row1.map(renderCard)}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {row2.map(renderCard)}
            </div>
        </div>
    );
}