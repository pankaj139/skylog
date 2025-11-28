/**
 * AchievementNotification Component - Phase 3
 * 
 * Toast notification for newly unlocked achievements.
 * Displays a celebratory notification with auto-dismiss.
 */

import { useEffect, useState } from 'react';
import type { Achievement } from '../../types';
import { achievementTiers } from '../../data/achievements';

interface AchievementNotificationProps {
    achievement: Achievement;
    onDismiss: () => void;
    autoHideDelay?: number;
}

export default function AchievementNotification({
    achievement,
    onDismiss,
    autoHideDelay = 5000,
}: AchievementNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const tier = achievement.tier ? achievementTiers[achievement.tier] : null;

    useEffect(() => {
        // Animate in
        const showTimeout = setTimeout(() => setIsVisible(true), 50);

        // Auto-hide
        const hideTimeout = setTimeout(() => {
            handleDismiss();
        }, autoHideDelay);

        return () => {
            clearTimeout(showTimeout);
            clearTimeout(hideTimeout);
        };
    }, [autoHideDelay]);

    const handleDismiss = () => {
        setIsLeaving(true);
        setTimeout(onDismiss, 300);
    };

    return (
        <div
            className={`fixed top-20 right-6 z-50 transition-all duration-300 ${
                isVisible && !isLeaving
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0'
            }`}
        >
            <div
                className="glass rounded-xl p-4 border shadow-2xl max-w-sm"
                style={{
                    borderColor: tier ? tier.color : 'rgba(255,255,255,0.2)',
                    boxShadow: tier ? `0 0 30px ${tier.color}40` : undefined,
                }}
            >
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🎉</span>
                    <span className="text-neon-blue font-semibold">Achievement Unlocked!</span>
                    <button
                        onClick={handleDismiss}
                        className="ml-auto text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Achievement */}
                <div className="flex items-center gap-4">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl animate-bounce-subtle"
                        style={{
                            background: tier
                                ? `linear-gradient(135deg, ${tier.bgColor}, transparent)`
                                : 'rgba(255,255,255,0.1)',
                            border: tier
                                ? `2px solid ${tier.color}`
                                : '2px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        {achievement.icon}
                    </div>
                    <div>
                        <p className="text-white font-semibold">{achievement.name}</p>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                        {tier && (
                            <span
                                className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                    background: tier.bgColor,
                                    color: tier.color,
                                }}
                            >
                                {tier.name}
                            </span>
                        )}
                    </div>
                </div>

                {/* Confetti effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${10 + i * 15}%`,
                                animationDelay: `${i * 0.1}s`,
                            }}
                        >
                            {['🎊', '✨', '🌟', '⭐', '💫', '🎉'][i]}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Container for multiple achievement notifications
 */
export function AchievementNotificationContainer({
    notifications,
    onDismiss,
}: {
    notifications: { id: string; achievement: Achievement }[];
    onDismiss: (id: string) => void;
}) {
    // Show only the first notification, queue the rest
    const currentNotification = notifications[0];

    if (!currentNotification) return null;

    return (
        <AchievementNotification
            key={currentNotification.id}
            achievement={currentNotification.achievement}
            onDismiss={() => onDismiss(currentNotification.id)}
        />
    );
}

