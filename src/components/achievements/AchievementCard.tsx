/**
 * AchievementCard Component - Phase 3
 * 
 * Card displaying an achievement with detailed information.
 * Used in the achievements list view.
 */

import type { Achievement, UserProgress } from '../../types';
import { achievementTiers, achievementCategories } from '../../data/achievements';
import { getAchievementProgress } from '../../services/achievementService';

interface AchievementCardProps {
    achievement: Achievement;
    isUnlocked: boolean;
    unlockedAt?: Date;
    stats?: UserProgress['stats'];
}

export default function AchievementCard({
    achievement,
    isUnlocked,
    unlockedAt,
    stats,
}: AchievementCardProps) {
    const tier = achievement.tier ? achievementTiers[achievement.tier] : null;
    const category = achievementCategories[achievement.category];
    const progress = stats ? getAchievementProgress(achievement, stats) : 0;

    return (
        <div
            className={`glass rounded-xl p-5 border transition-all ${
                isUnlocked
                    ? 'border-white/20 hover:border-neon-blue/40'
                    : 'border-white/10 opacity-70 hover:opacity-90'
            }`}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${
                        isUnlocked ? '' : 'grayscale'
                    }`}
                    style={{
                        background: tier && isUnlocked
                            ? `linear-gradient(135deg, ${tier.bgColor}, transparent)`
                            : 'rgba(255,255,255,0.05)',
                        border: tier && isUnlocked
                            ? `2px solid ${tier.color}`
                            : '2px solid rgba(255,255,255,0.1)',
                    }}
                >
                    {isUnlocked ? achievement.icon : '🔒'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                            {achievement.name}
                        </h3>
                        {tier && (
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
                    </div>

                    <p className="text-sm text-gray-400 mb-2">
                        {achievement.description}
                    </p>

                    {/* Category Tag */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                    </div>

                    {/* Progress Bar (for locked achievements) */}
                    {!isUnlocked && stats && (
                        <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Unlocked Date */}
                    {isUnlocked && unlockedAt && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                            <span>✓</span>
                            <span>Unlocked {new Date(unlockedAt).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

