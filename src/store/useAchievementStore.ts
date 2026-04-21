import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Achievement, UserProgress, Flight } from '../types';
import { achievements } from '../data/achievements';
import achievementService from '../services/achievementService';

interface AchievementState {
    progress: UserProgress | null;
    achievements: Achievement[];

    // Actions
    initialize: (userId: string) => Promise<void>;
    checkAchievements: (flights: Flight[]) => Promise<void>;
    reset: () => void;
}

export const useAchievementStore = create<AchievementState>()(
    persist(
        (set, get) => ({
            progress: null,
            achievements: achievements,

            initialize: async (userId: string) => {
                const progress = await achievementService.getUserProgress(userId);
                if (progress) {
                    set({ progress });
                } else {
                    // Initialize empty progress if not found
                    set({
                        progress: {
                            userId,
                            achievements: [],
                            stats: {
                                totalFlights: 0,
                                countriesVisited: 0,
                                continentsVisited: 0,
                                airportsVisited: 0,
                                airlinesFlown: 0,
                                aircraftTypesFlown: 0,
                                totalDistance: 0,
                                totalSpentInr: 0,
                                totalPointsSpent: 0,
                            },
                            updatedAt: new Date(),
                        }
                    });
                }
            },

            checkAchievements: async (flights: Flight[]) => {
                const { progress } = get();
                if (!progress) return;

                // 1. Calculate new stats
                const newStats = achievementService.calculateUserStats(flights);

                // 2. Check for newly unlocked achievements
                const newAchievements = achievementService.getNewlyUnlockedAchievements(
                    newStats,
                    flights,
                    progress.achievements
                );

                // 3. Update progress if stats changed or new achievements unlocked
                // (Simplification: always update for now to ensure stats are fresh)
                try {
                    const updatedProgress = await achievementService.updateUserProgress(
                        progress.userId,
                        newStats,
                        newAchievements
                    );

                    set({ progress: updatedProgress });

                    if (newAchievements.length > 0) {
                        // TODO: Trigger toast/notification
                        console.log('New achievements unlocked:', newAchievements.map(a => a.name));
                    }
                } catch (error) {
                    console.error('Failed to update achievements:', error);
                }
            },

            reset: () => set({ progress: null }),
        }),
        {
            name: 'achievement-storage',
            partialize: (state) => ({ progress: state.progress }), // Only persist progress
        }
    )
);
