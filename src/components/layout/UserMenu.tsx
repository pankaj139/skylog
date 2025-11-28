import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import type { User as UserType } from '../../types';

interface UserMenuProps {
    user: UserType;
    onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
                <div className="text-right hidden lg:block">
                    <div className="text-xs text-gray-400">Logged in as</div>
                    <div className="text-sm text-white font-medium">{user.email}</div>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 glass border border-white/10 rounded-lg overflow-hidden shadow-xl z-50">
                    <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-white"
                    >
                        <User size={18} className="text-neon-blue" />
                        <span>Profile</span>
                    </Link>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-white"
                    >
                        <LogOut size={18} className="text-red-400" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}
