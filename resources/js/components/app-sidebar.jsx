import {
    BarChart3,
    Circle,
    FileBarChart2,
    FolderKanban,
    Gauge,
    Globe,
    LifeBuoy,
    LogOut,
    MoreHorizontal,
    Airplay,
    Users,
    Shield,
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
    { title: 'Country', icon: Globe, path: '/countries', permission: 'manage-countries' },
    { title: 'State', icon: Airplay, path: '/states', permission: 'manage-states' },
    { title: 'WareHouse', icon: BarChart3, path: '/warehouses', permission: 'manage-warehouses' },
    { title: 'User', icon: Users, path: '/users', permission: 'manage-users' },
    { title: 'Role', icon: Shield, path: '/roles', permission: 'manage-roles' },
];

const docsItems = [
    { title: 'Data Library', icon: Circle, path: '/data-library' },
    { title: 'Reports', icon: FileBarChart2, path: '/reports' },
    { title: 'Word Assistant', icon: LifeBuoy, path: '/word-assistant' },
    { title: 'More', icon: MoreHorizontal, path: '/more' },
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
                    <span className="text-sm font-semibold">Acme Inc.</span>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3">
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

                <SidebarGroup>
                    <SidebarGroupLabel>Documents</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {docsItems.map((item) => (
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