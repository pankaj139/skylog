/**
 * AchievementBadge Component - Phase 3
 * 
 * Displays a single achievement badge with tier styling.
 * Can show locked/unlocked state with progress indicator.
 */

import type { Achievement } from '../../types';
import { achievementTiers } from '../../data/achievements';
import { getAchievementProgress } from '../../services/achievementService';
import type { UserProgress } from '../../types';

interface AchievementBadgeProps {
    achievement: Achievement;
    isUnlocked: boolean;
    unlockedAt?: Date;
    stats?: UserProgress['stats'];
    size?: 'sm' | 'md' | 'lg';
    showProgress?: boolean;
    onClick?: () => void;
}

export default function AchievementBadge({
    achievement,
    isUnlocked,
    unlockedAt,
    stats,
    size = 'md',
    showProgress = false,
    onClick,
}: AchievementBadgeProps) {
    const tier = achievement.tier ? achievementTiers[achievement.tier] : null;
    const progress = stats && !isUnlocked ? getAchievementProgress(achievement, stats) : 100;

    const sizeClasses = {
        sm: 'w-16 h-16 text-2xl',
        md: 'w-20 h-20 text-3xl',
        lg: 'w-28 h-28 text-5xl',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <div
            onClick={onClick}
            className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                onClick ? 'cursor-pointer hover:scale-105' : ''
            } ${
                isUnlocked
                    ? 'bg-dark-surface/50'
                    : 'bg-dark-surface/30 opacity-60'
            }`}
        >
            {/* Badge Icon */}
            <div
                className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative ${
                    isUnlocked ? '' : 'grayscale'
                }`}
                style={{
                    background: tier && isUnlocked
                        ? `linear-gradient(135deg, ${tier.bgColor}, transparent)`
                        : 'rgba(255,255,255,0.05)',
                    border: tier && isUnlocked
                        ? `2px solid ${tier.color}`
                        : '2px solid rgba(255,255,255,0.1)',
                    boxShadow: isUnlocked && tier
                        ? `0 0 20px ${tier.color}40`
                        : 'none',
                }}
            >
                <span className={isUnlocked ? '' : 'opacity-30'}>
                    {achievement.icon}
                </span>

                {/* Lock overlay for locked achievements */}
                {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-dark-bg/60 rounded-full">
                        <span className="text-lg">🔒</span>
                    </div>
                )}

                {/* Progress ring for locked achievements */}
                {!isUnlocked && showProgress && progress > 0 && (
                    <svg
                        className="absolute inset-0 w-full h-full -rotate-90"
                        viewBox="0 0 100 100"
                    >
                        <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke="rgba(0,240,255,0.3)"
                            strokeWidth="4"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke="#00f0ff"
                            strokeWidth="4"
                            strokeDasharray={`${progress * 2.89} 289`}
                            strokeLinecap="round"
                        />
                    </svg>
                )}
            </div>

            {/* Achievement Name */}
            <div className="text-center">
                <p className={`font-medium ${textSizes[size]} ${
                    isUnlocked ? 'text-white' : 'text-gray-400'
                }`}>
                    {achievement.name}
                </p>
                {size !== 'sm' && (
                    <p className="text-xs text-gray-500 mt-0.5">
                        {achievement.description}
                    </p>
                )}
            </div>

            {/* Tier Badge */}
            {tier && size !== 'sm' && (
                <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                        background: tier.bgColor,
                        color: tier.color,
                    }}
                >
                    {tier.name}
                </span>
            )}

            {/* Unlocked date */}
            {isUnlocked && unlockedAt && size === 'lg' && (
                <p className="text-xs text-gray-500">
                    Unlocked {new Date(unlockedAt).toLocaleDateString()}
                </p>
            )}

            {/* Progress percentage for locked */}
            {!isUnlocked && showProgress && (
                <p className="text-xs text-neon-blue">
                    {progress}% complete
                </p>
            )}
        </div>
    );
}

