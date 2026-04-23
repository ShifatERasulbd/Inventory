import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
    const navigate = useNavigate();

    return (
        <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-xl shadow-slate-950/5 backdrop-blur">
            <CardHeader className="space-y-2 pb-4">
                <CardTitle className="text-2xl">Login to your account</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    className="grid gap-5"
                    onSubmit={(event) => {
                        event.preventDefault();
                        navigate('/dashboard');
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" autoComplete="email" />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="password">Password</Label>
                            <a href="#" className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
                                Forgot your password?
                            </a>
                        </div>
                        <Input id="password" type="password" autoComplete="current-password" />
                    </div>

                    <Button type="submit" className="w-full">
                        Login
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <a href="#" className="font-medium text-foreground underline underline-offset-4">
                            Sign up
                        </a>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}