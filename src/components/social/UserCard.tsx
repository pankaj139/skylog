import React from 'react';
import { UserPlus, UserMinus, MapPin, Plane } from 'lucide-react';
import Button from '../common/Button';
import type { SocialUser } from '../../types';

interface UserCardProps {
    user: SocialUser;
    isFollowing: boolean;
    onFollow: (userId: string) => void;
    onUnfollow: (userId: string) => void;
    isLoading?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
    user,
    isFollowing,
    onFollow,
    onUnfollow,
    isLoading = false
}) => {
    return (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-600">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-lg font-bold text-slate-400">
                            {user.displayName.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Info */}
                <div>
                    <h3 className="font-semibold text-white">{user.displayName}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        {user.homeAirport && (
                            <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {user.homeAirport}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Plane size={12} />
                            {user.stats.totalFlights} flights
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div>
                {isFollowing ? (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onUnfollow(user.id)}
                        disabled={isLoading}
                        className="text-red-400 border-red-400/30 hover:bg-red-400/10 hover:border-red-400/50"
                    >
                        <UserMinus size={16} className="mr-1" />
                        Unfollow
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onFollow(user.id)}
                        disabled={isLoading}
                    >
                        <UserPlus size={16} className="mr-1" />
                        Follow
                    </Button>
                )}
            </div>
        </div>
    );
};
