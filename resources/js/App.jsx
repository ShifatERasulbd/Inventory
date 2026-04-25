import { LoginForm } from '@/components/login-form';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/context/AppContext';
import AppLayout from '@/layouts/AppLayout';

import Dashboard from '@/pages/dashboard';

import Countries from '@/pages/Country/country';
import AddContry from '@/pages/Country/addContry';
import EditContry from '@/pages/Country/editContry';

import States from '@/pages/State/states';
import AddState from '@/pages/State/addState';
import EditState from '@/pages/State/editState';
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
                        {/* Countries List */}
                        <Route path="/countries" element={<Countries />} />
                        <Route path="/countries/add" element={<AddContry />} />
                        <Route path="/countries/:id/edit" element={<EditContry />} />

                        {/* State List */}
                        <Route path="/states" element={<States />} />
                        <Route path="/states/add" element={<AddState />} />
                        <Route path="/states/:id/edit" element={<EditState />} />
                    </Route>
                </Routes>
            </BrowserRouter>
            <Toaster position="top-right" richColors />
        </AppProvider>
    );
}