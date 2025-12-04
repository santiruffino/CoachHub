import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { LogOut, Home, Activity, RefreshCw } from 'lucide-react';
import { syncEngine } from '../../../lib/sync-engine';
import { useState, useEffect } from 'react';

export function StudentLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Auto-bootstrap on mount if online
        if (navigator.onLine) {
            syncEngine.bootstrap();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSync = async () => {
        await syncEngine.sync();
        await syncEngine.bootstrap();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-blue-600">PT Coach</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link to="/student/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    <Home className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Link>
                                <Link to="/student/history" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    <Activity className="w-4 h-4 mr-2" />
                                    History
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <span className={`h-2 w-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-sm text-gray-500">{isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleSync} disabled={!isOnline}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Sync
                            </Button>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-700 mr-4">Hi, {user?.name}</span>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
}
