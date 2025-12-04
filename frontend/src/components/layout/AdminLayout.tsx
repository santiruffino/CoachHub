import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

export function AdminLayout() {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}
