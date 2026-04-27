import {
    BarChart3,
    Circle,
    FileBarChart2,
    FolderKanban,
    Gauge,
    Globe,
    LifeBuoy,
    LogOut,
    Palette ,
    Tag ,
    MoreHorizontal,
    Airplay,
    Users,
    Shield,
    ChartBarDecreasing,
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
    { title: 'Country', icon: Globe, path: '/countries', permission: 'manage-countries' },
    { title: 'State', icon: Airplay, path: '/states', permission: 'manage-states' },
    { title: 'WareHouse', icon: BarChart3, path: '/warehouses', permission: 'manage-warehouses' },
]

const StrorageItems=[
    { title: 'Products For', icon: FolderKanban, path: '/productsfor', permission: 'manage-products-for' },
    {title: 'Rack', icon: ChartBarDecreasing, path:'/racks', permission:'manage-rack'},
]

const ProductionItems=[
    {title:'Brand', icon:Tag, path:'/brands',permission:'manage-brand'},
    {title:'Color', icon: Palette, path:'/colors', permission:'manage-color'},
    {title:'Fabric', icon: LifeBuoy, path:'/fabrics', permission:'manage-fabrics'},
    {title:'Size', icon: FileBarChart2, path:'/sizes', permission:'manage-size'}
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

            <SidebarContent className="py-3">
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