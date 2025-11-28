import React, { useState } from 'react';
import { useAchievementStore } from '../../store/useAchievementStore';
import AchievementBadge from './AchievementBadge';
import { achievementCategories } from '../../data/achievements';
import type { AchievementCategory } from '../../types';

interface AchievementListProps {
    limit?: number;
    hideFilters?: boolean;
}

const AchievementList: React.FC<AchievementListProps> = ({ limit, hideFilters = false }) => {
    const { achievements, progress } = useAchievementStore();
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

    const unlockedIds = new Set(progress?.achievements.map(a => a.achievementId) || []);

    const filteredAchievements = achievements.filter(
        (a) => selectedCategory === 'all' || a.category === selectedCategory
    );

    // Apply limit if provided
    const displayAchievements = limit ? filteredAchievements.slice(0, limit) : filteredAchievements;

    // Calculate stats per category
    const categoryStats = Object.entries(achievementCategories).map(([key, label]) => {
        const categoryAchievements = achievements.filter(a => a.category === key);
        const unlockedCount = categoryAchievements.filter(a => unlockedIds.has(a.id)).length;
        return {
            key: key as AchievementCategory,
            ...label,
            total: categoryAchievements.length,
            unlocked: unlockedCount,
        };
    });

    return (
        <div className="space-y-8">
            {/* Category Filters */}
            {!hideFilters && (
                <div className="flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all'
                            ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        All
                    </button>
                    {categoryStats.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setSelectedCategory(cat.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.key
                                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                            <span className="ml-1 text-xs opacity-70">
                                ({cat.unlocked}/{cat.total})
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {displayAchievements.map((achievement) => {
                    const isUnlocked = unlockedIds.has(achievement.id);
                    const unlockedData = progress?.achievements.find(a => a.achievementId === achievement.id);

                    return (
                        <AchievementBadge
                            key={achievement.id}
                            achievement={achievement}
                            isUnlocked={isUnlocked}
                            unlockedAt={unlockedData?.unlockedAt}
                            stats={progress?.stats}
                            showProgress={true}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementList;
