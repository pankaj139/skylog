import { useAuthStore } from '../../store/authStore';
import { logout } from '../../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import UserMenu from './UserMenu';

export default function Header() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    return (
        <header className="glass border-b border-white/10 sticky top-0 z-40 h-16">
            <div className="max-w-7xl mx-auto px-6 h-full">
                <div className="flex justify-between items-center h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">✈️</div>
                        <h1 className="text-xl font-bold gradient-text">SkyLog</h1>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            to="/"
                            className={`transition-colors relative group ${location.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-neon-blue'
                                }`}
                        >
                            Dashboard
                            <span className={`absolute bottom-0 left-0 h-0.5 bg-neon-blue transition-all duration-300 ${location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></span>
                        </Link>
                        <Link
                            to="/trips"
                            className={`transition-colors relative group ${location.pathname === '/trips' || location.pathname.startsWith('/trip/') ? 'text-white' : 'text-gray-400 hover:text-neon-cyan'
                                }`}
                        >
                            Trips
                            <span className={`absolute bottom-0 left-0 h-0.5 bg-neon-cyan transition-all duration-300 ${location.pathname === '/trips' || location.pathname.startsWith('/trip/') ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></span>
                        </Link>
                        <Link
                            to="/history"
                            className={`transition-colors relative group ${location.pathname === '/history' ? 'text-white' : 'text-gray-400 hover:text-neon-blue'
                                }`}
                        >
                            History
                            <span className={`absolute bottom-0 left-0 h-0.5 bg-neon-blue transition-all duration-300 ${location.pathname === '/history' ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></span>
                        </Link>
                        <Link
                            to="/analytics"
                            className={`transition-colors relative group ${location.pathname === '/analytics' ? 'text-white' : 'text-gray-400 hover:text-purple-400'
                                }`}
                        >
                            Analytics
                            <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-400 transition-all duration-300 ${location.pathname === '/analytics' ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></span>
                        </Link>
                        <Link
                            to="/achievements"
                            className={`transition-colors relative group ${location.pathname === '/achievements' ? 'text-white' : 'text-gray-400 hover:text-yellow-400'
                                }`}
                        >
                            Achievements
                            <span className={`absolute bottom-0 left-0 h-0.5 bg-yellow-400 transition-all duration-300 ${location.pathname === '/achievements' ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></span>
                        </Link>
                        <Link
                            to="/year-review"
                            className={`transition-colors relative group ${location.pathname === '/year-review' ? 'text-white' : 'text-gray-400 hover:text-pink-400'
                                }`}
                        >
                            Year Review
                            <span className={`absolute bottom-0 left-0 h-0.5 bg-pink-400 transition-all duration-300 ${location.pathname === '/year-review' ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></span>
                        </Link>
                        <Link
                            to="/social"
                            className={`transition-colors relative group ${location.pathname === '/social' ? 'text-white' : 'text-gray-400 hover:text-green-400'
                                }`}
                        >
                            Social
                            <span className={`absolute bottom-0 left-0 h-0.5 bg-green-400 transition-all duration-300 ${location.pathname === '/social' ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></span>
                        </Link>
                        <Link
                            to="/recommendations"
                            className={`transition-colors relative group ${location.pathname === '/recommendations' ? 'text-white' : 'text-gray-400 hover:text-orange-400'
                                }`}
                        >
                            Explore
                            <span className={`absolute bottom-0 left-0 h-0.5 bg-orange-400 transition-all duration-300 ${location.pathname === '/recommendations' ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></span>
                        </Link>
                    </nav>

                    {/* User Section */}
                    <div className="flex items-center gap-4">
                        <UserMenu user={user!} onLogout={handleLogout} />
                    </div>
                </div>
            </div>
        </header>
    );
}
