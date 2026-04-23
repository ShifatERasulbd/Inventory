import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import { HeaderCard } from '@/components/Header-Card';
import { LowStockAlertTable } from '@/components/low-stock-alertTable';

export default function Dashboard() {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="md:hidden" />
                        <h1 className="text-sm font-semibold md:text-base">Dashboard</h1>
                    </div>

                    <button
                        type="button"
                        className="inline-flex items-center rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background md:text-sm"
                    >
                        + Quick Create
                    </button>
                </header>

                <div className="space-y-5 p-4 md:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <HeaderCard />
                    </div>
                    <div className="grid gid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                        <LowStockAlertTable />
                    </div>                    
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}