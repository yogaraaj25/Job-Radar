import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Map as MapIcon, User, LogOut, ShieldAlert, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role')?.toUpperCase();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
                    <Briefcase className="w-6 h-6" />
                    <span>Job Radar</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                        <MapIcon className="w-4 h-4" />
                        <span>Map</span>
                    </Link>

                    {token ? (
                        <>
                            <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </Link>
                            {role === 'ADMIN' && (
                                <Link to="/admin" className="flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
                                    <ShieldAlert className="w-4 h-4" />
                                    <span>Admin</span>
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                                <User className="w-4 h-4" />
                                <span>Login</span>
                            </Link>
                            <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                                Join Now
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
