import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { LoginForm } from '@/components/login-form';
import Preloader from '@/components/Preloader';

export default function RootRedirect() {
    const navigate = useNavigate();
    const { user, setUser } = useAppContext();
    const [authState, setAuthState] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'

    useEffect(() => {
        let ignore = false;

        async function checkAuth() {
            // If user is already loaded in context, skip the fetch
            if (user) {
                if (!ignore) {
                    setAuthState('authenticated');
                }
                return;
            }

            try {
                const response = await fetch('/api/user', {
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (ignore) return;

                if (response.ok) {
                    const payload = await response.json();
                    setUser(payload);
                    setAuthState('authenticated');
                } else {
                    setAuthState('unauthenticated');
                }
            } catch {
                if (!ignore) {
                    setAuthState('unauthenticated');
                }
            }
        }

        checkAuth();

        return () => {
            ignore = true;
        };
    }, [user, setUser]);

    useEffect(() => {
        if (authState === 'authenticated') {
            navigate('/dashboard', { replace: true });
        }
    }, [authState, navigate]);

    if (authState === 'loading') {
        return <Preloader message="Checking authentication..." />;
    }

    if (authState === 'authenticated') {
        return <Preloader message="Redirecting..." />;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <LoginForm />
        </main>
    );
}

