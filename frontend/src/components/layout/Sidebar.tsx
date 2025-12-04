import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuth';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Coaches', href: '/admin/coaches', icon: Users },
];

export function Sidebar() {
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
            <div className="flex h-16 items-center justify-center border-b border-gray-800">
                <h1 className="text-xl font-bold">PT Admin</h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={clsx(
                                isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                            )}
                        >
                            <item.icon className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-gray-800 p-4">
                <button
                    onClick={logout}
                    className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                    <LogOut className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                    Logout
                </button>
            </div>
        </div>
    );
}
