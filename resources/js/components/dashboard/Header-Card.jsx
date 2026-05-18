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

    const colors = [
    'border-red-500 bg-red-50',
    'border-green-500 bg-green-50',
    'border-blue-500 bg-blue-50',
    'border-yellow-500 bg-yellow-50',
    'border-purple-500 bg-purple-50',
];

    const row1 = [
        { title: 'Total Product', amount: totalProducts, prefix: '', path: '/products',color: colors[0] },
        { title: 'Available Warehouses', amount: availableWarehouses, prefix: '', path: '/warehouses',color: colors[1] },
        { title: 'Total Users', amount: totalUsers, prefix: '', path: '/users',color: colors[2] },
        { title: 'Total Purchases Order', amount: totalPurchases, prefix: '', path: '/purchases',color: colors[3] },
        { title: 'Total Sells', amount: totalSells, prefix: '', path: '/sells',color: colors[4] },
    ];

    const row2 = [
        { title: 'Pending Purchases', amount: pendingPurchases, prefix: '', path: '/purchases', amountClass: 'text-red-600', color: 'border-orange-500 bg-orange-50' },
        { title: 'Approved Purchases', amount: approvedPurchases, prefix: '', path: '/purchases', amountClass: '', color: 'border-emerald-500 bg-emerald-50' },
    ];

    const renderCard = (item) => (
        <Card
            key={item.title}
            role="button"
            tabIndex={0}
            className={`cursor-pointer border transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${item.color || ''}`}
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