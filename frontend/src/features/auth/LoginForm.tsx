import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setError('');
            const response = await api.post('/auth/login', data);
            const { access_token, user } = response.data;
            login(access_token, user);
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (user.role === 'COACH') {
                navigate('/coach/dashboard');
            } else if (user.role === 'STUDENT') {
                navigate('/student/dashboard');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto mt-20">
            <CardHeader>
                <CardTitle className="text-center">Login</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register('email')} />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
