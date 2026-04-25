import React, { Suspense, lazy } from 'react'
import { LoginForm } from '@/components/login-form';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/context/AppContext';
import AppLayout from '@/layouts/AppLayout';

const Dashboard = lazy(() => import('@/pages/dashboard'));

const Countries = lazy(() => import('@/pages/Country/country'));
const AddContry = lazy(() => import('@/pages/Country/addContry'));
const EditContry = lazy(() => import('@/pages/Country/editContry'));

const States = lazy(() => import('@/pages/State/states'));
const AddState = lazy(() => import('@/pages/State/addState'));
const EditState = lazy(() => import('@/pages/State/editState'));
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export default function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
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

                            {/* Countries */}
                            <Route path="/countries" element={<Countries />} />
                            <Route path="/countries/add" element={<AddContry />} />
                            <Route path="/countries/:id/edit" element={<EditContry />} />

                            {/* States */}
                            <Route path="/states" element={<States />} />
                            <Route path="/states/add" element={<AddState />} />
                            <Route path="/states/:id/edit" element={<EditState />} />
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
            <Toaster position="top-right" richColors />
        </AppProvider>
    );
}