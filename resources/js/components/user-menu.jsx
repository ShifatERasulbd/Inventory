import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, CircleUser } from 'lucide-react';

export function UserMenu({ user, warehouseName }) {
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                setIsUserMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

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
            <BellRing className="h-5 w-5 text-gray-600" />
            <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="inline-flex items-center rounded p-0.5 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-label="Open user menu"
            >
                <CircleUser className="h-5 w-5" />
            </button>

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
