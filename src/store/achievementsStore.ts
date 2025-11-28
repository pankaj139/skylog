/**
 * Achievements Store - Phase 3
 * 
 * Zustand store for managing achievement state and notifications.
 * Handles unlocked achievements, progress tracking, and notifications.
 */

import { create } from 'zustand';
import type { Achievement, UserProgress, Flight } from '../types';
import {
    calculateUserStats,
    getNewlyUnlockedAchievements,
    getUserProgress,
    updateUserProgress,
} from '../services/achievementService';

interface AchievementNotification {
    id: string;
    achievement: Achievement;
    timestamp: Date;
}

interface AchievementsState {
    progress: UserProgress | null;
    isLoading: boolean;
    error: string | null;
    notifications: AchievementNotification[];

    // Actions
    loadProgress: (userId: string) => Promise<void>;
    checkAndUpdateAchievements: (userId: string, flights: Flight[]) => Promise<Achievement[]>;
    dismissNotification: (id: string) => void;
    clearAllNotifications: () => void;
    setError: (error: string | null) => void;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
    progress: null,
    isLoading: false,
    error: null,
    notifications: [],

    /**
     * Loads user progress from Firestore
     */
    loadProgress: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const progress = await getUserProgress(userId);
            set({ progress, isLoading: false });
        } catch (error) {
            console.error('Error loading achievements:', error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to load achievements'
            });
        }
    },

    /**
     * Checks for new achievements and updates progress
     * Returns array of newly unlocked achievements
     * Only creates notifications for truly new achievements (not previously unlocked)
     */
    checkAndUpdateAchievements: async (userId: string, flights: Flight[]): Promise<Achievement[]> => {
        try {
            const { progress } = get();
            
            // Don't check achievements if progress hasn't been loaded yet
            // This prevents showing notifications for achievements that were already unlocked
            if (!progress) {
                return [];
            }

            const existingAchievements = progress.achievements || [];

            // Calculate current stats
            const stats = calculateUserStats(flights);

            // Find newly unlocked achievements (only those not in existingAchievements)
            const newAchievements = getNewlyUnlockedAchievements(
                stats,
                flights,
                existingAchievements
            );

            if (newAchievements.length > 0) {
                // Update progress in Firestore
                const updatedProgress = await updateUserProgress(
                    userId,
                    stats,
                    newAchievements
                );

                // Create notifications ONLY for truly new achievements
                const newNotifications: AchievementNotification[] = newAchievements.map(a => ({
                    id: `${a.id}-${Date.now()}`,
                    achievement: a,
                    timestamp: new Date(),
                }));

                set(state => ({
                    progress: updatedProgress,
                    notifications: [...state.notifications, ...newNotifications],
                }));

                return newAchievements;
            } else {
                // Just update stats without creating new achievements
                const updatedProgress: UserProgress = {
                    ...progress,
                    stats,
                    updatedAt: new Date(),
                };
                set({ progress: updatedProgress });
            }

            return [];
        } catch (error) {
            console.error('Error checking achievements:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to check achievements'
            });
            return [];
        }
    },

    /**
     * Dismisses a single notification
     */
    dismissNotification: (id: string) => {
        set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
        }));
    },

    /**
     * Clears all notifications
     */
    clearAllNotifications: () => {
        set({ notifications: [] });
    },

    /**
     * Sets error state
     */
    setError: (error: string | null) => {
        set({ error });
    },
}));

export default useAchievementsStore;

