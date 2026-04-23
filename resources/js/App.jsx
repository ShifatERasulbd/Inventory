import { LoginForm } from '@/components/login-form';
import Dashboard from '@/pages/dashboard';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export default function App() {
    return (
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
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    );
}