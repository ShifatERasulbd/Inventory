import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { UserMenu } from '@/components/user-menu';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAppContext } from '@/context/AppContext';
import Preloader from '@/components/Preloader';

export default function AppLayout() {
    const { pageTitle, user, setUser } = useAppContext();
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [approvedOrderCount, setApprovedOrderCount] = useState(0);
    const location = useLocation();

    useEffect(() => {
        let ignore = false;

        async function loadUser() {
            setIsUserLoading(true);
            try {
                const response = await fetch('/api/user', {
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok || ignore) {
                    return;
                }

                const payload = await response.json();
                if (!ignore) {
                    setUser(payload);
                }
            } catch {
                // Keep layout resilient even if user fetch fails.
            } finally {
                if (!ignore) {
                    setIsUserLoading(false);
                }
            }
        }

        if (!user) {
            loadUser();
        } else {
            setIsUserLoading(false);
        }

        return () => {
            ignore = true;
        };
    }, [setUser, user]);

    useEffect(() => {
        let ignore = false;
        let timerId = null;

        async function loadApprovedOrderCount() {
            try {
                const response = await fetch('/api/remote-orders/approved-count', {
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok || ignore) {
                    return;
                }

                const payload = await response.json();
                if (!ignore) {
                    setApprovedOrderCount(Number(payload?.count || 0));
                }
            } catch {
                if (!ignore) {
                    setApprovedOrderCount(0);
                }
            }
        }

        loadApprovedOrderCount();
        timerId = window.setInterval(loadApprovedOrderCount, 60_000);

        return () => {
            ignore = true;
            if (timerId) {
                window.clearInterval(timerId);
            }
        };
    }, []);

    const warehouseName = user?.warehouse?.name || 'No Warehouse Assigned';

    if (isUserLoading) {
        return <Preloader message="Loading user..." />;
    }

    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="md:hidden" />
                        <h1 className="text-sm font-semibold md:text-base">{pageTitle}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        
                            {approvedOrderCount > 0 ? (
                                <div className="rounded-md border border-red-700 bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                                    <span className="blinking-text">
                                        1971co Pending Delivery Orders: {approvedOrderCount}
                                    </span>
                                </div>
                            ) : (
                                <div className="rounded-md border border-green-700 bg-green-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                                    <span>
                                        No Pending Delivery Orders
                                    </span>
                                </div>
                            )}
                      

                        <UserMenu user={user} warehouseName={warehouseName} />
                    </div>
                </header>

                <div className="flex min-h-[calc(100vh-56px)] flex-col p-4 md:p-6">
                    <Outlet />

                    <footer className="mt-auto border-t border-border pt-4 text-xs text-muted-foreground">
                        <div className="grid grid-cols-3 gap-4 text-center md:text-left">
                            
                            {/* Left Column */}
                            <div className="flex flex-col items-center md:items-start">
                            <div className="font-medium">Developed by Shifat E Rasul</div>
                            <div>New Atlantic Inventory management V1.1.1</div>
                            </div>

                            {/* Center Column */}
                            <div className="flex flex-col items-center">
                            <div className="font-medium">Support Email</div>
                            <a className="underline" href="mailto:it1@arbellafashion.com">it1@arbellafashion.com</a>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col items-center md:items-end">
                            <div className="font-medium">Emergency Support</div>
                            <a className="underline" href="https://wa.me/8801680752193">Whatsapp : +8801680752193</a>
                            </div>
                            
                        </div>
                    </footer>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
