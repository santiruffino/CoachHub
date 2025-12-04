import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'COACH' | 'STUDENT';
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Ideally verify token with backend /me endpoint
            api.get('/me')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem('token', token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return { user, loading, login, logout, isAuthenticated: !!user };
}
