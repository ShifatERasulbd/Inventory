import {
    BarChart3,
    Circle,
    FileBarChart2,
    FolderKanban,
    Gauge,
    LifeBuoy,
    MoreHorizontal,
    Sparkles,
    Users,
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

const homeItems = [
    { title: 'Dashboard', icon: Gauge, active: true },
    { title: 'Lifecycle', icon: Sparkles },
    { title: 'Analytics', icon: BarChart3 },
    { title: 'Projects', icon: FolderKanban },
    { title: 'Team', icon: Users },
];

const docsItems = [
    { title: 'Data Library', icon: Circle },
    { title: 'Reports', icon: FileBarChart2 },
    { title: 'Word Assistant', icon: LifeBuoy },
    { title: 'More', icon: MoreHorizontal },
];

export function AppSidebar(props) {
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
                            {homeItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} isActive={item.active}>
                                        <a href="#">
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
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
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href="#">
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}