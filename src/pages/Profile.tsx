import { useEffect, useState } from 'react';
import { MapPin, Plane, Users, Calendar, Edit, Heart } from 'lucide-react';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import EditProfileModal from '../components/profile/EditProfileModal';
import PreferencesModal from '../components/profile/PreferencesModal';
import LoyaltyCard from '../components/loyalty/LoyaltyCard';
import { useAuthStore } from '../store/authStore';
import { getSocialProfile, getFollowers, getFollowing } from '../services/userService';
import type { SocialUser } from '../types';

export default function Profile() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<SocialUser | null>(null);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

    const fetchProfileData = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const [userProfile, followers, following] = await Promise.all([
                getSocialProfile(user.id),
                getFollowers(user.id),
                getFollowing(user.id)
            ]);

            setProfile(userProfile);
            setFollowersCount(followers.length);
            setFollowingCount(following.length);
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchProfileData();
    }, [user]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">
                Profile not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg pb-24">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Profile Header */}
                <div className="glass rounded-2xl p-8 border border-white/10 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-neon-blue/20 to-purple-500/20" />

                    <div className="relative flex flex-col md:flex-row items-end md:items-center gap-6 mt-12">
                        <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-dark-bg flex items-center justify-center overflow-hidden shadow-xl">
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-slate-400">
                                    {profile.displayName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl font-bold text-white mb-2">{profile.displayName}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
                                {profile.homeAirport && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={16} className="text-neon-blue" />
                                        Based in {profile.homeAirport}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar size={16} className="text-neon-cyan" />
                                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                <Edit size={16} className="mr-2" />
                                Edit Profile
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsPreferencesModalOpen(true)}
                            >
                                <Heart size={16} className="mr-2" />
                                Preferences
                            </Button>
                        </div>

                        <div className="flex gap-6 text-center">
                            <div>
                                <div className="text-2xl font-bold text-white">{followersCount}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">Followers</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{followingCount}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">Following</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loyalty Status */}
                <div className="mb-8">
                    <LoyaltyCard totalDistance={profile.stats.totalDistance} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <Plane size={24} />
                            </div>
                            <span className="text-gray-400 font-medium">Total Flights</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{profile.stats.totalFlights}</div>
                    </div>

                    <div className="glass p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                <MapPin size={24} />
                            </div>
                            <span className="text-gray-400 font-medium">Countries</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{profile.stats.countriesVisited}</div>
                    </div>

                    <div className="glass p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                <Users size={24} />
                            </div>
                            <span className="text-gray-400 font-medium">Distance (km)</span>
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {profile.stats.totalDistance.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="glass rounded-xl p-8 border border-white/10 text-center">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                    <p className="text-gray-400">No recent activity to show.</p>
                </div>
            </main>

            {/* Edit Profile Modal */}
            {user && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={user}
                    onSuccess={fetchProfileData}
                />
            )}

            {/* Preferences Modal */}
            {user && (
                <PreferencesModal
                    isOpen={isPreferencesModalOpen}
                    onClose={() => setIsPreferencesModalOpen(false)}
                    user={user}
                    onSuccess={fetchProfileData}
                />
            )}
        </div>
    );
}
