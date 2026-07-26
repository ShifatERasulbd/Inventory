import {
    BarChart3,
    Circle,
    FileBarChart2,
    FolderKanban,
    Gauge,
    Boxes ,
    CreditCard,
    Banknote,
    Globe,
    LifeBuoy,
    LogOut,
    Palette ,
    Tag ,
    MoreHorizontal,
    Airplay,
    Shirt,
    Users,
    Shield,
    ChartBarDecreasing,
    ScanBarcode,
    Key,
    History,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAppContext } from '@/context/AppContext';

const homeItems = [
    { title: 'Dashboard', icon: Gauge, path: '/dashboard', permission: 'view-dashboard' },
];

const locationItems = [
    { title: 'Country', icon: Globe, path: '/countries', permission: 'read-countries' },
    { title: 'State', icon: Airplay, path: '/states', permission: 'read-states' },
    { title: 'WareHouse', icon: BarChart3, path: '/warehouses', permission: 'read-warehouses' },
];

const StrorageItems = [
    { title: 'Rack', icon: ChartBarDecreasing, path: '/racks', permission: 'read-racks' },
    { title: 'Stock', icon: Boxes, path: '/stocks', permission: 'read-stocks' },
    { title: 'Purchase Order', icon: CreditCard, path: '/purchases', permission: 'read-purchases' },
    { title: 'Received Cartoons', icon: ScanBarcode, path: '/received-cartoons', permission: 'read-cartoons' },
    { title: 'PO Sell', icon: Banknote, path: '/sells', permission: 'read-sales' },
];

const RetailItems = [
    { title: 'Retail POS', icon: ScanBarcode, path: '/retail', permission: 'read-sales' },
    { title: 'Retail Sell', icon: Banknote, path: '/retail-sales', permission: 'read-sales' },
];

const PackagingItems = [
    { title: 'Carton', icon: Circle, path: '/cartoons', permission: 'read-cartoons' },
];

const ProductionItems = [
    { title: 'Brand', icon: Tag, path: '/brands', permission: 'read-brands' },
    { title: 'Category', icon: Tag, path: '/categories', permission: 'read-categories' },
    { title: 'Color', icon: Palette, path: '/colors', permission: 'read-colors' },
    { title: 'Supplier(Fabrics)', icon: Palette, path: '/suppliers', permission: 'read-suppliers' },
    { title: 'Fabric', icon: Shirt, path: '/fabrics', permission: 'read-fabrics' },
    { title: 'Season', icon: LifeBuoy, path: '/seasons', permission: 'read-seasons' },
    { title: 'Size', icon: FileBarChart2, path: '/sizes', permission: 'read-sizes' },
    { title: 'Products For', icon: FolderKanban, path: '/productsfor', permission: 'read-products' },
    { title: 'Product', icon: MoreHorizontal, path: '/products', permission: 'read-products' },
    { title: 'Tracking', icon: Circle, path: '/cartoon-tracking', permission: 'read-cartoons' },
];

const userAccessItems = [
    { title: 'User', icon: Users, path: '/users', permission: 'read-users' },
    { title: 'Role', icon: Shield, path: '/roles', permission: 'read-roles' },
    { title: 'API Users', icon: Key, path: '/api-user', permission: 'read-users', superAdminOnly: true },
    { title: 'Activity Log', icon: History, path: '/activity-log', superAdminOnly: true },
    {title: 'shipment', icon: Airplay, path: '/shipments', permission: 'read-shipments'},
];

const OrderItems = [
    { title: '1971co Orders', icon: FileBarChart2, path: '/remote-orders' },
];

export function AppSidebar(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppContext();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const permissionSlugs = Array.isArray(user?.permission_slugs) ? user.permission_slugs : [];
    const roleSlugs = Array.isArray(user?.role_slugs) ? user.role_slugs : [];
    const isSuperAdmin = roleSlugs.includes('super-admin');

    const canAccess = (permission) => {
        if (!permission) return true;
        if (isSuperAdmin) return true;
        return permissionSlugs.includes(permission);
    };

    const visibleHomeItems = homeItems.filter((item) => canAccess(item.permission));
    const visibleLocationItems=locationItems.filter((item)=>canAccess(item.permission));
    const visibleStrorageItems=StrorageItems.filter((item)=>canAccess(item.permission));
    const visibleuserAccessItems=userAccessItems.filter((item)=>canAccess(item.permission) && (!item.superAdminOnly || isSuperAdmin));
    const visibleProductionItems=ProductionItems.filter((item)=>canAccess(item.permission));
    const visibleRetailItems=RetailItems.filter((item)=>canAccess(item.permission));
    const visiblePackagingItems=PackagingItems.filter((item)=>canAccess(item.permission));
    const visibleOrderItems=OrderItems.filter((item)=>canAccess(item.permission));
    

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
        } finally {
            setIsLoggingOut(false);
            navigate('/');
        }
    };

    return (
        <Sidebar collapsible="icon" variant="sidebar" {...props}>
            <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
                <div className="flex items-center gap-2 px-1">
                    <span className="inline-flex size-4 rounded-full border border-sidebar-foreground/60" />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-tight">New Atlantic Inventory</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">Version 1.0.1</span>
                    </div>
                </div>
                
            </SidebarHeader>

            <SidebarContent className="scrollbar-hidden py-3">
                {visibleHomeItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Home</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleHomeItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={location.pathname === item.path}
                                        >
                                            <Link to={item.path}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* location Management  */}
                 {visibleLocationItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Location Management</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleLocationItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={location.pathname === item.path}
                                        >
                                            <Link to={item.path}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                 {/* storage Management  */}
                 {visibleStrorageItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Storage Management</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleStrorageItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={location.pathname === item.path}
                                        >
                                            <Link to={item.path}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* production management */}
               
                 {visibleProductionItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Production Management</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleProductionItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={location.pathname === item.path}
                                        >
                                            <Link to={item.path}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
                {/* packaging */}
                  {visiblePackagingItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Packaging</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visiblePackagingItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={location.pathname === item.path}
                                        >
                                            <Link to={item.path}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}


                {/* retail */}
                {visibleRetailItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Retail</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleRetailItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={location.pathname === item.path}
                                        >
                                            <Link to={item.path}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}


                {/* Website Orders */}
                {visibleOrderItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Website Orders</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleOrderItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={location.pathname === item.path}
                                        >
                                            <Link to={item.path}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}


                {/* user access */}
                {visibleuserAccessItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>User Access</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleuserAccessItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={location.pathname === item.path}
                                        >
                                            <Link to={item.path}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}


                
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Logout" onClick={handleLogout} disabled={isLoggingOut}>
                            <LogOut />
                            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}