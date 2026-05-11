import {
    BarChart3,
    Circle,
    FileBarChart2,
    FolderKanban,
    Gauge,
    Boxes ,
    CreditCard,
    Banknote,
    ClipboardPlus ,
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

const locationItems=[
    { title: 'Country', icon: Globe, path: '/countries', permission: 'manage-warehouses' },
    { title: 'State', icon: Airplay, path: '/states', permission: 'manage-warehouses' },
    { title: 'WareHouse', icon: BarChart3, path: '/warehouses', permission: 'manage-warehouses' },
]

const StrorageItems=[
    
    {title: 'Rack', icon: ChartBarDecreasing, path:'/racks', permission:'manage-storage'},
    {title: 'Stock', icon: Boxes, path:'/stocks', permission:'manage-storage'},
    {title: 'Purchase Order', icon: CreditCard, path:'/purchases',permission:'manage-storage'},
    {title: 'Purchase Request', icon:  ClipboardPlus , path:'/purchase-requests',permission:'manage-storage'},
    {title: 'Sell', icon: Banknote, path:'/sells',permission:'manage-storage'},
]

const RetailItems=[
    {title: 'Retail POS', icon: ScanBarcode, path:'/retail', permission:'manage-storage'},
]

const ProductionItems=[
    {title:'Brand', icon:Tag, path:'/brands',permission:'manage-Production'},
    {title:'Category', icon:Tag, path:'/categories',permission:'manage-Production'},
    {title:'Color', icon: Palette, path:'/colors', permission:'manage-Production'},
    {title:'Supplier(Fabrics)', icon: Palette, path:'/suppliers', permission:'manage-Production'},
    {title:'Fabric', icon: Shirt, path:'/fabrics', permission:'manage-Production'},
    {title:'Season', icon:LifeBuoy, path:'/seasons',permission:'manage-Production'},
    {title:'Size', icon: FileBarChart2, path:'/sizes', permission:'manage-Production'},
    {title: 'Products For', icon: FolderKanban, path: '/productsfor', permission: 'manage-Production'},
    {title:'Product', icon: MoreHorizontal, path:'/products', permission:'manage-Production'},
    {title:'Cartoon', icon: Circle, path:'/cartoons', permission:'manage-Production'},
    {title:'Tracking', icon: Circle, path:'/cartoon-tracking', permission:'manage-Production'},
]

const userAccessItems=[
     { title: 'User', icon: Users, path: '/users', permission: 'manage-users' },
     { title: 'Role', icon: Shield, path: '/roles', permission: 'manage-roles' },
]

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
    const visibleuserAccessItems=userAccessItems.filter((item)=>canAccess(item.permission));
    const visibleProductionItems=ProductionItems.filter((item)=>canAccess(item.permission));
    const visibleRetailItems=RetailItems.filter((item)=>canAccess(item.permission));
    

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
                    <span className="text-sm font-semibold">AVANT</span>
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