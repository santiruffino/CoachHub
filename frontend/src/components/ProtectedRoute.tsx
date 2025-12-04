import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    allowedRoles?: ('ADMIN' | 'COACH' | 'STUDENT')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user?.role && !allowedRoles.includes(user.role as any)) {
        // Redirect to appropriate dashboard based on actual role
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'COACH') return <Navigate to="/coach/dashboard" replace />;
        if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
