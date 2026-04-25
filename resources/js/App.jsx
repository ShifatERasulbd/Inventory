import { LoginForm } from '@/components/login-form';
import { AppProvider } from '@/context/AppContext';
import AppLayout from '@/layouts/AppLayout';

import Dashboard from '@/pages/dashboard';

import Countries from '@/pages/country/country';
import AddContry from '@/pages/country/addContry';
import EditContry from '@/pages/country/editContry';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export default function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
                                <LoginForm />
                            </main>
                        }
                    />
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/countries" element={<Countries />} />
                        <Route path="/countries/add" element={<AddContry />} />
                        <Route path="/countries/:id/edit" element={<EditContry />} />
                        {/* Add future protected pages here */}
                    </Route>
                </Routes>
            </BrowserRouter>
        </AppProvider>
    );
}