import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigation items based on role
    const getNavItems = () => {
        if (!user) return [];

        switch (user.role) {
            case 'student':
                return [
                    { path: '/student/dashboard', label: 'Dashboard', icon: '🏠' },
                    { path: '/student/scan', label: 'Scan QR', icon: '📱' },
                    { path: '/student/attendance', label: 'Attendance', icon: '📊' },
                ];
            case 'faculty':
                return [
                    { path: '/faculty/dashboard', label: 'Dashboard', icon: '🏠' },
                    { path: '/faculty/sessions', label: 'Sessions', icon: '📅' },
                    { path: '/faculty/reports', label: 'Reports', icon: '📈' },
                ];
            case 'admin':
                return [
                    { path: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
                    { path: '/admin/users', label: 'Users', icon: '👥' },
                    { path: '/admin/classes', label: 'Classes', icon: '🎓' },
                    { path: '/admin/analytics', label: 'Analytics', icon: '📊' },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();
    const isMobile = window.innerWidth < 768;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            {!isMobile && (
                <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-10">
                    <div className="flex flex-col h-full">
                        {/* Logo/Brand */}
                        <div className="p-6 border-b">
                            <h1 className="text-2xl font-bold text-blue-600">Attendance</h1>
                            <p className="text-sm text-gray-500 capitalize">{user?.role} Portal</p>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                            ? 'bg-blue-50 text-blue-600 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* User Info & Logout */}
                        <div className="p-4 border-t">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <div className={isMobile ? '' : 'ml-64'}>
                {/* Mobile Header */}
                {isMobile && (
                    <header className="bg-white shadow-sm sticky top-0 z-10">
                        <div className="px-4 py-3 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-blue-600">Attendance</h1>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className={isMobile ? 'pb-20' : 'p-8'}>
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                {isMobile && (
                    <nav className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg">
                        <div className="flex justify-around items-center h-16">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex flex-col items-center justify-center flex-1 h-full ${location.pathname === item.path
                                            ? 'text-blue-600'
                                            : 'text-gray-500'
                                        }`}
                                >
                                    <span className="text-2xl mb-1">{item.icon}</span>
                                    <span className="text-xs font-medium">{item.label}</span>
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex flex-col items-center justify-center flex-1 h-full text-red-500"
                            >
                                <span className="text-2xl mb-1">🚪</span>
                                <span className="text-xs font-medium">Logout</span>
                            </button>
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
};

export default Layout;
