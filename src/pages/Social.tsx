import { useState, useEffect } from 'react';
import { Search, Users, UserPlus, Trophy, Activity, UserCheck } from 'lucide-react';
import Header from '../components/layout/Header';
import { UserCard } from '../components/social/UserCard';
import Leaderboard from '../components/social/Leaderboard';
import ActivityFeed from '../components/social/ActivityFeed';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import {
    followUser,
    unfollowUser,
    getFollowing,
    getFollowers,
    searchUsers,
    getSocialProfile
} from '../services/userService';
import type { SocialUser } from '../types';


export default function Social() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'following' | 'followers' | 'find' | 'leaderboard' | 'feed'>('following');
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<SocialUser[]>([]);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SocialUser[]>([]);

    // Fetch initial data
    useEffect(() => {
        if (!user) return;

        const fetchFollowing = async () => {
            const ids = await getFollowing(user.id);
            setFollowingIds(new Set(ids));
        };

        fetchFollowing();
    }, [user]);

    // Fetch tab data when tab changes
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (activeTab === 'following') {
                    const ids = await getFollowing(user.id);
                    const profiles = await Promise.all(ids.map(id => getSocialProfile(id)));
                    setUsers(profiles.filter((p): p is SocialUser => p !== null));
                } else if (activeTab === 'followers') {
                    const ids = await getFollowers(user.id);
                    const profiles = await Promise.all(ids.map(id => getSocialProfile(id)));
                    setUsers(profiles.filter((p): p is SocialUser => p !== null));
                }
            } catch (error) {
                console.error('Error fetching social data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (activeTab !== 'find') {
            fetchData();
        }
    }, [activeTab, user]);

    // Handle search
    useEffect(() => {
        const handleSearch = async () => {
            if (searchQuery.length < 3) {
                setSearchResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const results = await searchUsers(searchQuery);
                // Filter out current user
                setSearchResults(results.filter(u => u.id !== user?.id));
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(handleSearch, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, user]);

    const handleFollow = async (targetUserId: string) => {
        if (!user) return;
        try {
            await followUser(user.id, targetUserId);
            setFollowingIds(prev => new Set(prev).add(targetUserId));
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleUnfollow = async (targetUserId: string) => {
        if (!user) return;
        try {
            await unfollowUser(user.id, targetUserId);
            setFollowingIds(prev => {
                const next = new Set(prev);
                next.delete(targetUserId);
                return next;
            });

            // If in following tab, remove from list
            if (activeTab === 'following') {
                setUsers(prev => prev.filter(u => u.id !== targetUserId));
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg pb-24">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Social Hub</h2>
                    <p className="text-gray-400">Connect with other travelers and share your journeys.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10 pb-1 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'feed'
                            ? 'text-neon-blue'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Activity size={18} />
                            Activity Feed
                        </div>
                        {activeTab === 'feed' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-blue shadow-neon" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'leaderboard'
                            ? 'text-neon-blue'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Trophy size={18} />
                            Leaderboard
                        </div>
                        {activeTab === 'leaderboard' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-blue shadow-neon" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'following'
                            ? 'text-neon-blue'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <UserCheck size={18} />
                            Following
                        </div>
                        {activeTab === 'following' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-blue shadow-neon" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'followers'
                            ? 'text-neon-blue'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users size={18} />
                            Followers
                        </div>
                        {activeTab === 'followers' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-blue shadow-neon" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('find')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'find'
                            ? 'text-neon-blue'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <UserPlus size={18} />
                            Find Friends
                        </div>
                        {activeTab === 'find' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-blue shadow-neon" />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'leaderboard' ? (
                        <Leaderboard />
                    ) : activeTab === 'feed' ? (
                        <ActivityFeed />
                    ) : (
                        <>
                            {/* Search Bar (only for Find Friends) */}
                            {activeTab === 'find' && (
                                <div className="mb-8">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <Input
                                            placeholder="Search by name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 bg-slate-800/50 border-slate-700 focus:border-neon-blue"
                                        />
                                    </div>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <LoadingSpinner size="lg" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeTab === 'find' ? (
                                        searchResults.length > 0 ? (
                                            searchResults.map(u => (
                                                <UserCard
                                                    key={u.id}
                                                    user={u}
                                                    isFollowing={followingIds.has(u.id)}
                                                    onFollow={handleFollow}
                                                    onUnfollow={handleUnfollow}
                                                />
                                            ))
                                        ) : searchQuery.length >= 3 ? (
                                            <div className="col-span-full text-center py-12 text-gray-500">
                                                No users found matching "{searchQuery}"
                                            </div>
                                        ) : (
                                            <div className="col-span-full text-center py-12 text-gray-500">
                                                Type at least 3 characters to search
                                            </div>
                                        )
                                    ) : users.length > 0 ? (
                                        users.map(u => (
                                            <UserCard
                                                key={u.id}
                                                user={u}
                                                isFollowing={followingIds.has(u.id)}
                                                onFollow={handleFollow}
                                                onUnfollow={handleUnfollow}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-12 text-gray-500">
                                            {activeTab === 'following'
                                                ? "You aren't following anyone yet."
                                                : "No followers yet."}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
