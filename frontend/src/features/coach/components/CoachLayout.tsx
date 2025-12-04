import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
    LayoutDashboard,
    Users,
    Dumbbell,
    Calendar,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '../../../components/ui/Button';

export function CoachLayout() {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/coach/dashboard', icon: LayoutDashboard },
        { name: 'Students', href: '/coach/students', icon: Users },
        { name: 'Exercises', href: '/coach/exercises', icon: Dumbbell },
        { name: 'Plans', href: '/coach/plans', icon: Calendar },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
                <div className="font-bold text-xl text-blue-600">PT App</div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className={clsx(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b hidden lg:block">
                            <div className="font-bold text-2xl text-blue-600">PT App</div>
                            <div className="text-sm text-gray-500 mt-1">Coach Panel</div>
                        </div>

                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={clsx(
                                            "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                            isActive
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        )}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t">
                            <div className="flex items-center mb-4 px-4">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {user?.name?.[0] || 'C'}
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                                    <p className="text-xs text-gray-500">Coach</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
