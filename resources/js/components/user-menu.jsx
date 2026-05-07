import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, CircleUser } from 'lucide-react';
import { fetchPurchases } from '@/pages/Purchase/api';
import { fetchStocks } from '@/pages/Stock/api';

export function UserMenu({ user, warehouseName }) {
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const userMenuRef = useRef(null);

    const isSuperAdmin = Array.isArray(user?.role_slugs) && user.role_slugs.includes('super-admin');
    const warehouseKey = Array.isArray(user?.warehouse_ids) ? user.warehouse_ids.join(',') : '';
    const seenStorageKey = user?.id ? `inventory_seen_notifications_${user.id}` : null;
    const historyStorageKey = user?.id ? `inventory_notification_history_${user.id}` : null;

    const getSeenNotificationIds = () => {
        if (!seenStorageKey || typeof window === 'undefined') {
            return [];
        }

        try {
            const raw = window.localStorage.getItem(seenStorageKey);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const saveSeenNotificationIds = (ids) => {
        if (!seenStorageKey || typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(seenStorageKey, JSON.stringify(Array.from(new Set(ids))));
    };

    const getStoredNotifications = () => {
        if (!historyStorageKey || typeof window === 'undefined') {
            return [];
        }

        try {
            const raw = window.localStorage.getItem(historyStorageKey);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const saveStoredNotifications = (items) => {
        if (!historyStorageKey || typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(historyStorageKey, JSON.stringify(items.slice(0, 50)));
    };

    const markNotificationsAsSeen = (ids = []) => {
        const seenIds = new Set(getSeenNotificationIds());
        const idsToMark = ids.length > 0 ? ids : notifications.map((item) => item.id);

        idsToMark.forEach((id) => seenIds.add(id));
        saveSeenNotificationIds(Array.from(seenIds));

        setNotifications((previous) => {
            const updated = previous.map((item) => ({ ...item, seen: seenIds.has(item.id) }));
            saveStoredNotifications(updated);
            return updated;
        });
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
                setIsNotificationOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                setIsUserMenuOpen(false);
                setIsNotificationOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadNotifications() {
            if (!user) {
                setNotifications([]);
                return;
            }

            const warehouseIds = Array.isArray(user?.warehouse_ids) ? user.warehouse_ids : [];

            setIsLoadingNotifications(true);

            try {
                const [purchases, stocks] = await Promise.all([fetchPurchases(), fetchStocks()]);

                if (ignore) {
                    return;
                }

                const filteredPurchases = Array.isArray(purchases)
                    ? purchases.filter((purchase) => {
                        if (isSuperAdmin) {
                            return true;
                        }

                        return warehouseIds.includes(Number(purchase.purchase_to)) || warehouseIds.includes(Number(purchase.purchase_form));
                    })
                    : [];

                const purchaseNotifications = filteredPurchases
                    .slice(0, 15)
                    .map((purchase) => {
                        const status = String(purchase.status || 'pending').toLowerCase();
                        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

                        return {
                            id: `purchase-${purchase.id}`,
                            title: `PO ${purchase.po_number || `#${purchase.id}`} - ${statusLabel}`,
                            description: `${purchase.purchase_form_name || 'Unknown'} to ${purchase.purchase_to_name || 'Unknown'}`,
                            seen: false,
                            severity: status === 'cancel' || status === 'cancelled'
                                ? 'danger'
                                : status === 'pending'
                                    ? 'warning'
                                    : 'info',
                            path: '/purchases',
                        };
                    });

                const filteredStocks = Array.isArray(stocks)
                    ? stocks.filter((stock) => {
                        if (isSuperAdmin) {
                            return true;
                        }

                        return warehouseIds.includes(Number(stock.warehouse_id));
                    })
                    : [];

                const lowStockNotifications = filteredStocks
                    .filter((stock) => Number(stock.available_stock ?? stock.stocks ?? 0) < 10)
                    .sort((a, b) => Number(a.available_stock ?? a.stocks ?? 0) - Number(b.available_stock ?? b.stocks ?? 0))
                    .slice(0, 15)
                    .map((stock) => {
                        const quantity = Number(stock.available_stock ?? stock.stocks ?? 0);
                        return {
                            id: `stock-${stock.id}`,
                            title: `Low stock: ${stock.name || 'Unknown product'}`,
                            description: `${stock.warehouse_name || `Warehouse #${stock.warehouse_id}`} has ${quantity} left`,
                            seen: false,
                            severity: quantity <= 0 ? 'danger' : 'warning',
                            path: '/stocks',
                        };
                    });

                const combined = [...lowStockNotifications, ...purchaseNotifications].slice(0, 20);
                const seenIds = new Set(getSeenNotificationIds());
                const withSeenStatus = combined.map((notification) => ({
                    ...notification,
                    seen: seenIds.has(notification.id),
                }));
                const oldItems = getStoredNotifications();
                const mergedMap = new Map();

                withSeenStatus.forEach((item) => {
                    mergedMap.set(item.id, item);
                });

                oldItems.forEach((item) => {
                    if (!item || !item.id || mergedMap.has(item.id)) {
                        return;
                    }

                    mergedMap.set(item.id, {
                        ...item,
                        seen: seenIds.has(item.id),
                    });
                });

                const mergedNotifications = Array.from(mergedMap.values()).slice(0, 50);
                saveStoredNotifications(mergedNotifications);
                setNotifications(mergedNotifications);
            } catch {
                if (!ignore) {
                    const oldItems = getStoredNotifications();
                    const seenIds = new Set(getSeenNotificationIds());
                    setNotifications(
                        oldItems.map((item) => ({
                            ...item,
                            seen: seenIds.has(item.id),
                        }))
                    );
                }
            } finally {
                if (!ignore) {
                    setIsLoadingNotifications(false);
                }
            }
        }

        loadNotifications();

        return () => {
            ignore = true;
        };
    }, [isSuperAdmin, user, warehouseKey, seenStorageKey, historyStorageKey]);

    const notificationCount = notifications.filter((notification) => !notification.seen).length;

    const severityClassName = (severity) => {
        if (severity === 'danger') {
            return 'border-l-red-500';
        }
        if (severity === 'warning') {
            return 'border-l-amber-500';
        }
        return 'border-l-blue-500';
    };

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
            setIsUserMenuOpen(false);
            navigate('/');
        }
    };

    const handleProfileClick = () => {
        if (user?.id) {
            setIsUserMenuOpen(false);
            navigate(`/users/${user.id}/edit`);
            return;
        }

        navigate('/users');
    };

    return (
        <div
            ref={userMenuRef}
            className="relative inline-flex items-center gap-3 rounded-md border border-gray-300 bg-white px-3 py-1.5 shadow-sm"
        >
            <button
                type="button"
                onClick={() => {
                    markNotificationsAsSeen();
                    setIsNotificationOpen((prev) => !prev);
                    setIsUserMenuOpen(false);
                }}
                className="relative inline-flex items-center rounded p-0.5 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-haspopup="menu"
                aria-expanded={isNotificationOpen}
                aria-label="Open notifications"
            >
                <BellRing className="h-5 w-5" />
                {notificationCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                        {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                )}
            </button>
            <button
                type="button"
                onClick={() => {
                    setIsUserMenuOpen((prev) => !prev);
                    setIsNotificationOpen(false);
                }}
                className="inline-flex items-center rounded p-0.5 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-label="Open user menu"
            >
                <CircleUser className="h-5 w-5" />
            </button>

            {isNotificationOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-md border border-gray-200 bg-white p-3 shadow-lg">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Notifications</p>
                        <span className="text-xs text-gray-500">{isSuperAdmin ? 'All Warehouses' : 'My Warehouses'}</span>
                    </div>

                    {isLoadingNotifications && (
                        <p className="py-4 text-center text-sm text-gray-500">Loading...</p>
                    )}

                    {!isLoadingNotifications && notifications.length === 0 && (
                        <p className="py-4 text-center text-sm text-gray-500">No notifications found.</p>
                    )}

                    {!isLoadingNotifications && notifications.length > 0 && (
                        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                            {notifications.map((notification) => (
                                <button
                                    type="button"
                                    key={notification.id}
                                    onClick={() => {
                                        markNotificationsAsSeen([notification.id]);
                                        setIsNotificationOpen(false);
                                        navigate(notification.path);
                                    }}
                                    className={`w-full rounded-md border border-gray-200 border-l-4 bg-white p-2 text-left transition hover:bg-gray-50 ${severityClassName(notification.severity)}`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                        <span className={`text-[11px] font-medium ${notification.seen ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {notification.seen ? 'Seen' : 'Unseen'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600">{notification.description}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {isUserMenuOpen && (
                <div className="absolute right-0 top-11 z-50 w-64 rounded-md border border-gray-200 bg-white p-3 shadow-lg">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Profile</p>
                    <button
                        type="button"
                        onClick={handleProfileClick}
                        className="mt-1 text-left text-sm font-semibold text-gray-900 underline-offset-2 hover:underline"
                    >
                        {user?.name || 'Unknown User'}
                    </button>

                    <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">Warehouse</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{warehouseName}</p>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            )}
        </div>
    );
}
