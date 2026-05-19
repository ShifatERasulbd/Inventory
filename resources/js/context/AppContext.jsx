import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [pageTitle, setPageTitle] = useState('Dashboard');

    const isSuperAdmin = Array.isArray(user?.role_slugs) && user.role_slugs.includes('super-admin');

    /**
     * Check if the current user has the given permission slug.
     * Super-admins always return true.
     */
    function hasPermission(slug) {
        if (!user) return false;
        if (isSuperAdmin) return true;
        return Array.isArray(user.permission_slugs) && user.permission_slugs.includes(slug);
    }

    /**
     * Check if the current user can perform a CRUD action on a resource.
     * e.g. can('read', 'countries')
     */
    function can(action, resource) {
        return hasPermission(`${action}-${resource}`);
    }

    return (
        <AppContext.Provider value={{ user, setUser, pageTitle, setPageTitle, isSuperAdmin, hasPermission, can }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used within AppProvider');
    return ctx;
}
