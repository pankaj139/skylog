/**
 * Header Component
 * 
 * Main navigation header component with desktop and mobile menu support.
 * Displays logo, navigation links, and user menu.
 * 
 * Features:
 * - Responsive design with mobile hamburger menu
 * - Active route highlighting
 * - User authentication menu
 * 
 * Usage:
 * <Header />
 */

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import UserMenu from './UserMenu';

export default function Header() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        }

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.body.style.overflow = 'unset';
            };
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const navigationLinks = [
        { to: '/', label: 'Dashboard', color: 'neon-blue', hoverColor: 'hover:text-neon-blue', bgColor: 'bg-neon-blue', bgColor20: 'bg-neon-blue/20', borderColor: 'border-neon-blue' },
        { to: '/trips', label: 'Trips', color: 'neon-cyan', hoverColor: 'hover:text-neon-cyan', bgColor: 'bg-neon-cyan', bgColor20: 'bg-neon-cyan/20', borderColor: 'border-neon-cyan', match: (path: string) => path === '/trips' || path.startsWith('/trip/') },
        { to: '/history', label: 'History', color: 'neon-blue', hoverColor: 'hover:text-neon-blue', bgColor: 'bg-neon-blue', bgColor20: 'bg-neon-blue/20', borderColor: 'border-neon-blue' },
        { to: '/analytics', label: 'Analytics', color: 'purple-400', hoverColor: 'hover:text-purple-400', bgColor: 'bg-purple-400', bgColor20: 'bg-purple-400/20', borderColor: 'border-purple-400' },
        { to: '/achievements', label: 'Achievements', color: 'yellow-400', hoverColor: 'hover:text-yellow-400', bgColor: 'bg-yellow-400', bgColor20: 'bg-yellow-400/20', borderColor: 'border-yellow-400' },
        { to: '/year-review', label: 'Year Review', color: 'pink-400', hoverColor: 'hover:text-pink-400', bgColor: 'bg-pink-400', bgColor20: 'bg-pink-400/20', borderColor: 'border-pink-400' },
        { to: '/social', label: 'Social', color: 'green-400', hoverColor: 'hover:text-green-400', bgColor: 'bg-green-400', bgColor20: 'bg-green-400/20', borderColor: 'border-green-400' },
        { to: '/recommendations', label: 'Explore', color: 'orange-400', hoverColor: 'hover:text-orange-400', bgColor: 'bg-orange-400', bgColor20: 'bg-orange-400/20', borderColor: 'border-orange-400' },
    ];

    const isActive = (link: typeof navigationLinks[0]) => {
        if (link.match) {
            return link.match(location.pathname);
        }
        return location.pathname === link.to;
    };

    return (
        <>
            <header className="glass border-b border-white/10 sticky top-0 z-40 h-16">
                <div className="max-w-7xl mx-auto px-6 h-full">
                    <div className="flex justify-between items-center h-full">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">✈️</div>
                            <h1 className="text-xl font-bold gradient-text">SkyLog</h1>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navigationLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`transition-colors relative group ${isActive(link) ? 'text-white' : 'text-gray-400 ' + link.hoverColor
                                        }`}
                                >
                                    {link.label}
                                    <span className={`absolute bottom-0 left-0 h-0.5 ${link.bgColor} transition-all duration-300 ${isActive(link) ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}></span>
                                </Link>
                            ))}
                        </nav>

                        {/* User Section */}
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <UserMenu user={user!} onLogout={handleLogout} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    {/* Mobile Menu Drawer */}
                    <div
                        ref={mobileMenuRef}
                        className="absolute right-0 top-0 h-full w-80 glass border-l border-white/10 shadow-2xl overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Mobile Menu Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">✈️</div>
                                    <h2 className="text-xl font-bold gradient-text">SkyLog</h2>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                                    aria-label="Close menu"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Mobile Navigation Links */}
                            <nav className="flex flex-col gap-2">
                                {navigationLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                                            isActive(link)
                                                ? `${link.bgColor20} text-white border-l-4 ${link.borderColor}`
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <span className="font-medium">{link.label}</span>
                                    </Link>
                                ))}
                            </nav>

                            {/* Mobile User Info */}
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="text-xs text-gray-400 mb-1">Logged in as</div>
                                    <div className="text-sm text-white font-medium">{user?.email}</div>
                                </div>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors mt-2"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-white/5 transition-colors mt-2"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
