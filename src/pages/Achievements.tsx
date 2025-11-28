/**
 * Achievements Page - Phase 3
 * 
 * Displays all achievements with filtering by category and status.
 * Shows progress towards locked achievements and celebration for unlocked ones.
 */

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AchievementCard from '../components/achievements/AchievementCard';
import AchievementBadge from '../components/achievements/AchievementBadge';
import { useAchievementsStore } from '../store/achievementsStore';
import { useFlightsStore } from '../store/flightsStore';
import { useAuthStore } from '../store/authStore';
import { getUserFlights } from '../services/flightService';
import { achievements, achievementCategories, achievementTiers } from '../data/achievements';
import type { AchievementCategory } from '../types';

type FilterStatus = 'all' | 'unlocked' | 'locked';
type ViewMode = 'grid' | 'list';

export default function Achievements() {
    const { user } = useAuthStore();
    const { flights, setFlights } = useFlightsStore();
    const { progress, isLoading, loadProgress, checkAndUpdateAchievements } = useAchievementsStore();

    const [filterCategory, setFilterCategory] = useState<AchievementCategory | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    // Load data on mount
    useEffect(() => {
        if (user) {
            loadProgress(user.id);
            if (flights.length === 0) {
                getUserFlights(user.id).then(setFlights);
            }
        }
    }, [user, loadProgress, setFlights, flights.length]);

    // Check achievements when flights change
    useEffect(() => {
        if (user && flights.length > 0) {
            checkAndUpdateAchievements(user.id, flights);
        }
    }, [user, flights, checkAndUpdateAchievements]);

    // Create a map of unlocked achievement IDs for quick lookup
    const unlockedMap = useMemo(() => {
        const map = new Map<string, Date>();
        progress?.achievements.forEach(a => {
            map.set(a.achievementId, a.unlockedAt);
        });
        return map;
    }, [progress]);

    // Filter achievements
    const filteredAchievements = useMemo(() => {
        return achievements.filter(a => {
            // Category filter
            if (filterCategory !== 'all' && a.category !== filterCategory) {
                return false;
            }

            // Status filter
            const isUnlocked = unlockedMap.has(a.id);
            if (filterStatus === 'unlocked' && !isUnlocked) return false;
            if (filterStatus === 'locked' && isUnlocked) return false;

            return true;
        });
    }, [filterCategory, filterStatus, unlockedMap]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = achievements.length;
        const unlocked = unlockedMap.size;
        const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

        // Count by tier
        const byTier = {
            bronze: { total: 0, unlocked: 0 },
            silver: { total: 0, unlocked: 0 },
            gold: { total: 0, unlocked: 0 },
            platinum: { total: 0, unlocked: 0 },
        };

        achievements.forEach(a => {
            if (a.tier) {
                byTier[a.tier].total++;
                if (unlockedMap.has(a.id)) {
                    byTier[a.tier].unlocked++;
                }
            }
        });

        return { total, unlocked, percentage, byTier };
    }, [unlockedMap]);

    // Recently unlocked (last 5)
    const recentlyUnlocked = useMemo(() => {
        const sorted = [...(progress?.achievements || [])]
            .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
            .slice(0, 5);

        return sorted.map(ua => ({
            achievement: achievements.find(a => a.id === ua.achievementId)!,
            unlockedAt: ua.unlockedAt,
        })).filter(item => item.achievement);
    }, [progress]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-bg">
                <Header />
                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner size="lg" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg pb-24">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
                        Achievements <span className="text-5xl">🏆</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Track your travel milestones and earn badges
                    </p>
                </div>

                {/* Overall Progress */}
                <div className="glass rounded-2xl p-6 border border-white/10 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {stats.unlocked} / {stats.total} Achievements
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-3 bg-dark-surface rounded-full overflow-hidden max-w-xs">
                                    <div
                                        className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan transition-all duration-500"
                                        style={{ width: `${stats.percentage}%` }}
                                    />
                                </div>
                                <span className="text-neon-blue font-semibold">{stats.percentage}%</span>
                            </div>
                        </div>

                        {/* Tier Progress */}
                        <div className="flex gap-4 flex-wrap">
                            {(Object.keys(achievementTiers) as Array<keyof typeof achievementTiers>).map(tier => (
                                <div
                                    key={tier}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                                    style={{ background: achievementTiers[tier].bgColor }}
                                >
                                    <span style={{ color: achievementTiers[tier].color }}>
                                        {tier === 'bronze' && '🥉'}
                                        {tier === 'silver' && '🥈'}
                                        {tier === 'gold' && '🥇'}
                                        {tier === 'platinum' && '💎'}
                                    </span>
                                    <span className="text-sm text-white">
                                        {stats.byTier[tier].unlocked}/{stats.byTier[tier].total}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recently Unlocked */}
                {recentlyUnlocked.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-white mb-4">Recently Unlocked</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {recentlyUnlocked.map(({ achievement, unlockedAt }) => (
                                <div key={achievement.id} className="flex-shrink-0">
                                    <AchievementBadge
                                        achievement={achievement}
                                        isUnlocked={true}
                                        unlockedAt={unlockedAt}
                                        size="md"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    {/* Category Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilterCategory('all')}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${filterCategory === 'all'
                                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50'
                                : 'bg-dark-surface text-gray-400 border border-white/10 hover:text-white'
                                }`}
                        >
                            All
                        </button>
                        {(Object.keys(achievementCategories) as AchievementCategory[]).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${filterCategory === cat
                                    ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50'
                                    : 'bg-dark-surface text-gray-400 border border-white/10 hover:text-white'
                                    }`}
                            >
                                <span>{achievementCategories[cat].icon}</span>
                                <span>{achievementCategories[cat].name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1" />

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                        className="px-4 py-2 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue"
                    >
                        <option value="all">All Status</option>
                        <option value="unlocked">Unlocked</option>
                        <option value="locked">Locked</option>
                    </select>

                    {/* View Mode Toggle */}
                    <div className="flex gap-1 bg-dark-surface rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-neon-blue/20 text-neon-blue'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            📋
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'grid'
                                ? 'bg-neon-blue/20 text-neon-blue'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            📦
                        </button>
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-gray-400 text-sm mb-4">
                    {filteredAchievements.length} achievement{filteredAchievements.length !== 1 ? 's' : ''}
                </p>

                {/* Achievements Grid/List */}
                {viewMode === 'list' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAchievements.map(achievement => {
                            const unlockedAt = unlockedMap.get(achievement.id);
                            return (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                    isUnlocked={!!unlockedAt}
                                    unlockedAt={unlockedAt}
                                    stats={progress?.stats}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredAchievements.map(achievement => {
                            const unlockedAt = unlockedMap.get(achievement.id);
                            return (
                                <AchievementBadge
                                    key={achievement.id}
                                    achievement={achievement}
                                    isUnlocked={!!unlockedAt}
                                    unlockedAt={unlockedAt}
                                    stats={progress?.stats}
                                    size="md"
                                    showProgress={!unlockedAt}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {filteredAchievements.length === 0 && (
                    <div className="glass rounded-xl p-12 border border-white/10 text-center">
                        <span className="text-5xl mb-4 block">🔍</span>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No achievements match your filters
                        </h3>
                        <p className="text-gray-400">
                            Try adjusting your filter criteria
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

