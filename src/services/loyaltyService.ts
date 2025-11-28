export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface LoyaltyStatus {
    tier: LoyaltyTier;
    totalDistance: number;
    nextTier: LoyaltyTier | null;
    progress: number; // 0-100
    distanceToNext: number;
}

const TIERS = {
    Bronze: 0,
    Silver: 25000,
    Gold: 50000,
    Platinum: 100000
};

export function calculateLoyaltyStatus(totalDistance: number): LoyaltyStatus {
    let tier: LoyaltyTier = 'Bronze';
    let nextTier: LoyaltyTier | null = 'Silver';
    let distanceToNext = TIERS.Silver - totalDistance;
    let progress = (totalDistance / TIERS.Silver) * 100;

    if (totalDistance >= TIERS.Platinum) {
        tier = 'Platinum';
        nextTier = null;
        distanceToNext = 0;
        progress = 100;
    } else if (totalDistance >= TIERS.Gold) {
        tier = 'Gold';
        nextTier = 'Platinum';
        distanceToNext = TIERS.Platinum - totalDistance;
        progress = ((totalDistance - TIERS.Gold) / (TIERS.Platinum - TIERS.Gold)) * 100;
    } else if (totalDistance >= TIERS.Silver) {
        tier = 'Silver';
        nextTier = 'Gold';
        distanceToNext = TIERS.Gold - totalDistance;
        progress = ((totalDistance - TIERS.Silver) / (TIERS.Gold - TIERS.Silver)) * 100;
    }

    return {
        tier,
        totalDistance,
        nextTier,
        progress: Math.min(Math.max(progress, 0), 100),
        distanceToNext
    };
}

export function getTierColor(tier: LoyaltyTier): string {
    switch (tier) {
        case 'Bronze': return 'from-orange-700 to-orange-500';
        case 'Silver': return 'from-gray-400 to-gray-200';
        case 'Gold': return 'from-yellow-500 to-yellow-300';
        case 'Platinum': return 'from-slate-800 to-slate-600 border border-white/20';
        default: return 'from-gray-700 to-gray-500';
    }
}
