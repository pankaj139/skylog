import { useState, useEffect } from 'react';
import { Plane, Trophy, MapPin, Heart, MessageCircle } from 'lucide-react';
import { getActivityFeed } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import type { SocialActivity } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

export default function ActivityFeed() {
    const { user } = useAuthStore();
    const [activities, setActivities] = useState<SocialActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchFeed = async () => {
            setIsLoading(true);
            try {
                const data = await getActivityFeed(user.id);
                setActivities(data);
            } catch (error) {
                console.error('Error fetching activity feed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeed();
    }, [user]);

    const getActivityIcon = (type: SocialActivity['type']) => {
        switch (type) {
            case 'trip_added': return <Plane size={18} className="text-neon-blue" />;
            case 'achievement_unlocked': return <Trophy size={18} className="text-yellow-500" />;
            case 'milestone_reached': return <MapPin size={18} className="text-green-500" />;
        }
    };

    const getActivityText = (activity: SocialActivity) => {
        switch (activity.type) {
            case 'trip_added':
                return (
                    <span>
                        added a new trip <span className="font-semibold text-white">{activity.data.tripName || 'Trip'}</span>
                    </span>
                );
            case 'achievement_unlocked':
                return (
                    <span>
                        unlocked the <span className="font-semibold text-yellow-500">{activity.data.achievementName}</span> achievement
                    </span>
                );
            case 'milestone_reached':
                return (
                    <span>
                        reached a milestone: <span className="font-semibold text-green-500">{activity.data.milestone}</span>
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="p-12 flex justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-12 px-4 glass border border-white/10 rounded-xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plane className="text-gray-500" size={32} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Recent Activity</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                    Follow more users to see their travel updates here. When your friends add trips or unlock achievements, they'll show up in your feed.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div key={activity.id} className="glass border border-white/10 rounded-xl p-5 hover:border-neon-blue/30 transition-colors">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
                            {activity.userPhotoURL ? (
                                <img src={activity.userPhotoURL} alt={activity.userDisplayName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                activity.userDisplayName.charAt(0).toUpperCase()
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-semibold text-white hover:text-neon-blue cursor-pointer transition-colors">
                                        {activity.userDisplayName}
                                    </span>
                                    <span className="text-gray-400 mx-2">•</span>
                                    <span className="text-sm text-gray-400">
                                        {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                                    </span>
                                </div>
                                <div className="bg-white/5 p-2 rounded-full">
                                    {getActivityIcon(activity.type)}
                                </div>
                            </div>

                            <p className="text-gray-300 mt-1">
                                {getActivityText(activity)}
                            </p>

                            {/* Actions (Likes/Comments - Visual only for now) */}
                            <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors group">
                                    <Heart size={16} className="group-hover:fill-red-400" />
                                    <span>{activity.likes.length} Likes</span>
                                </button>
                                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-neon-blue transition-colors">
                                    <MessageCircle size={16} />
                                    <span>{activity.comments.length} Comments</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
