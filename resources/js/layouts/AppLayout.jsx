import { Outlet } from 'react-router-dom';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAppContext } from '@/context/AppContext';

export default function AppLayout() {
    const { pageTitle } = useAppContext();

    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="md:hidden" />
                        <h1 className="text-sm font-semibold md:text-base">{pageTitle}</h1>
                    </div>

                    <button
                        type="button"
                        className="inline-flex items-center rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background md:text-sm"
                    >
                        + Quick Create
                    </button>
                </header>

                <div className="p-4 md:p-6">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
