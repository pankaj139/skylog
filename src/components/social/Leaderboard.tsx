import { useState, useEffect } from 'react';
import { Trophy, Globe, Plane, Map } from 'lucide-react';
import { getLeaderboard } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import type { SocialUser } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

export default function Leaderboard() {
    const { user } = useAuthStore();
    const [users, setUsers] = useState<SocialUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [scope, setScope] = useState<'friends' | 'global'>('friends');
    const [metric, setMetric] = useState<'distance' | 'flights' | 'countries'>('distance');

    useEffect(() => {
        if (!user) return;

        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const data = await getLeaderboard(user.id, metric, scope);
                setUsers(data);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [user, scope, metric]);

    const getMetricLabel = () => {
        switch (metric) {
            case 'distance': return 'Total Distance';
            case 'flights': return 'Total Flights';
            case 'countries': return 'Countries Visited';
        }
    };

    const getMetricValue = (stats: SocialUser['stats']) => {
        switch (metric) {
            case 'distance': return `${stats.totalDistance.toLocaleString()} km`;
            case 'flights': return stats.totalFlights;
            case 'countries': return stats.countriesVisited;
        }
    };

    const getMetricIcon = () => {
        switch (metric) {
            case 'distance': return <Globe size={16} />;
            case 'flights': return <Plane size={16} />;
            case 'countries': return <Map size={16} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Scope Toggle */}
                <div className="flex bg-white/5 p-1 rounded-lg self-start">
                    <button
                        onClick={() => setScope('friends')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${scope === 'friends' ? 'bg-neon-blue text-dark-bg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Friends
                    </button>
                    <button
                        onClick={() => setScope('global')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${scope === 'global' ? 'bg-neon-blue text-dark-bg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Global
                    </button>
                </div>

                {/* Metric Toggle */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <button
                        onClick={() => setMetric('distance')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${metric === 'distance'
                                ? 'border-neon-blue bg-neon-blue/10 text-neon-blue'
                                : 'border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                    >
                        <Globe size={16} />
                        <span className="text-sm font-medium">Distance</span>
                    </button>
                    <button
                        onClick={() => setMetric('flights')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${metric === 'flights'
                                ? 'border-neon-blue bg-neon-blue/10 text-neon-blue'
                                : 'border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                    >
                        <Plane size={16} />
                        <span className="text-sm font-medium">Flights</span>
                    </button>
                    <button
                        onClick={() => setMetric('countries')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${metric === 'countries'
                                ? 'border-neon-blue bg-neon-blue/10 text-neon-blue'
                                : 'border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                    >
                        <Map size={16} />
                        <span className="text-sm font-medium">Countries</span>
                    </button>
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="glass border border-white/10 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={20} />
                        Leaderboard
                    </h3>
                    <span className="text-sm text-gray-400">{getMetricLabel()}</span>
                </div>

                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : users.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {users.map((item, index) => (
                            <div
                                key={item.id}
                                className={`flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${item.id === user?.id ? 'bg-neon-blue/5' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                            index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                index === 2 ? 'bg-orange-500/20 text-orange-500' :
                                                    'text-gray-500'}
                                    `}>
                                        {index + 1}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-purple-600 flex items-center justify-center text-white font-bold">
                                            {item.photoURL ? (
                                                <img src={item.photoURL} alt={item.displayName} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                item.displayName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white flex items-center gap-2">
                                                {item.displayName}
                                                {item.id === user?.id && (
                                                    <span className="text-xs bg-neon-blue/20 text-neon-blue px-2 py-0.5 rounded-full">You</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400">{item.homeAirport || 'No home airport'}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-neon-blue text-lg">
                                        {getMetricValue(item.stats)}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                                        {getMetricIcon()}
                                        {metric}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400">
                        No users found for this leaderboard.
                    </div>
                )}
            </div>
        </div>
    );
}
