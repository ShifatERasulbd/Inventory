import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export function HeaderCard({ 
    totalProducts = 0, 
    availableWarehouses = 0 , 
    totalUsers =0,
    totalPurchases =0,
    totalSells = 0,
}) {
    const navigate = useNavigate();

    const cardItems = [
        { title: 'Total Product', amount: totalProducts, prefix: '', path: '/products' },
        { title: 'Available Warehouses', amount: availableWarehouses, prefix: '', path: '/warehouses' },
        { title: 'Total Users', amount: totalUsers, prefix: '', path: '/users' },
        { title: 'Total Purchases', amount: totalPurchases, prefix: '', path: '/purchases' },
        { title: 'Total Sells', amount: totalSells, prefix: '', path: '/sells' },
    ];

    return(
        <>
            {cardItems.map((item) => (
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
                        <p><b>{item.prefix}{item.amount}</b></p>
                    </CardContent>
                </Card>
            ))}
         
        </>
    )
}