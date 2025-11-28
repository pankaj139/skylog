/**
 * Achievements Data - Phase 3
 * 
 * Defines all badges and their unlock conditions for the gamification system.
 * Achievements are organized by category and tier.
 */

import type { Achievement } from '../types';

export const achievements: Achievement[] = [
    // Flight count achievements
    {
        id: 'first-flight',
        name: 'First Flight',
        description: 'Log your first flight',
        icon: '🎫',
        category: 'flights',
        tier: 'bronze',
        requirement: { type: 'flights', value: 1 },
    },
    {
        id: 'frequent-flyer-10',
        name: 'Frequent Flyer',
        description: 'Log 10 flights',
        icon: '✈️',
        category: 'flights',
        tier: 'bronze',
        requirement: { type: 'flights', value: 10 },
    },
    {
        id: 'jet-setter-25',
        name: 'Jet Setter',
        description: 'Log 25 flights',
        icon: '🛫',
        category: 'flights',
        tier: 'silver',
        requirement: { type: 'flights', value: 25 },
    },
    {
        id: 'road-warrior-50',
        name: 'Road Warrior',
        description: 'Log 50 flights',
        icon: '🛩️',
        category: 'flights',
        tier: 'gold',
        requirement: { type: 'flights', value: 50 },
    },
    {
        id: 'sky-master-100',
        name: 'Sky Master',
        description: 'Log 100 flights',
        icon: '👨‍✈️',
        category: 'flights',
        tier: 'platinum',
        requirement: { type: 'flights', value: 100 },
    },

    // Country achievements
    {
        id: 'explorer-5',
        name: 'Explorer',
        description: 'Visit 5 different countries',
        icon: '🗺️',
        category: 'destinations',
        tier: 'bronze',
        requirement: { type: 'countries', value: 5 },
    },
    {
        id: 'world-traveler-15',
        name: 'World Traveler',
        description: 'Visit 15 different countries',
        icon: '🌍',
        category: 'destinations',
        tier: 'silver',
        requirement: { type: 'countries', value: 15 },
    },
    {
        id: 'globe-trotter-25',
        name: 'Globe Trotter',
        description: 'Visit 25 different countries',
        icon: '🌎',
        category: 'destinations',
        tier: 'gold',
        requirement: { type: 'countries', value: 25 },
    },
    {
        id: 'nomad-50',
        name: 'Nomad',
        description: 'Visit 50 different countries',
        icon: '🏆',
        category: 'destinations',
        tier: 'platinum',
        requirement: { type: 'countries', value: 50 },
    },

    // Continent achievements
    {
        id: 'continental-3',
        name: 'Continental',
        description: 'Visit 3 different continents',
        icon: '🌐',
        category: 'destinations',
        tier: 'bronze',
        requirement: { type: 'continents', value: 3 },
    },
    {
        id: 'hemisphere-hopper',
        name: 'Hemisphere Hopper',
        description: 'Visit 5 different continents',
        icon: '🧭',
        category: 'destinations',
        tier: 'silver',
        requirement: { type: 'continents', value: 5 },
    },
    {
        id: 'planetary-explorer',
        name: 'Planetary Explorer',
        description: 'Visit all 7 continents',
        icon: '🌏',
        category: 'destinations',
        tier: 'platinum',
        requirement: { type: 'continents', value: 7 },
    },

    // Airport achievements
    {
        id: 'airport-collector-10',
        name: 'Airport Collector',
        description: 'Visit 10 different airports',
        icon: '🛬',
        category: 'destinations',
        tier: 'bronze',
        requirement: { type: 'airports', value: 10 },
    },
    {
        id: 'hub-hopper-25',
        name: 'Hub Hopper',
        description: 'Visit 25 different airports',
        icon: '🏛️',
        category: 'destinations',
        tier: 'silver',
        requirement: { type: 'airports', value: 25 },
    },
    {
        id: 'terminal-master-50',
        name: 'Terminal Master',
        description: 'Visit 50 different airports',
        icon: '🗼',
        category: 'destinations',
        tier: 'gold',
        requirement: { type: 'airports', value: 50 },
    },
    {
        id: 'airport-legend-100',
        name: 'Airport Legend',
        description: 'Visit 100 different airports',
        icon: '👑',
        category: 'destinations',
        tier: 'platinum',
        requirement: { type: 'airports', value: 100 },
    },

    // Airline achievements
    {
        id: 'airline-sampler-5',
        name: 'Airline Sampler',
        description: 'Fly with 5 different airlines',
        icon: '🎨',
        category: 'flights',
        tier: 'bronze',
        requirement: { type: 'airlines', value: 5 },
    },
    {
        id: 'airline-connoisseur-10',
        name: 'Airline Connoisseur',
        description: 'Fly with 10 different airlines',
        icon: '🍷',
        category: 'flights',
        tier: 'silver',
        requirement: { type: 'airlines', value: 10 },
    },
    {
        id: 'airline-expert-20',
        name: 'Airline Expert',
        description: 'Fly with 20 different airlines',
        icon: '🎖️',
        category: 'flights',
        tier: 'gold',
        requirement: { type: 'airlines', value: 20 },
    },

    // Aircraft achievements
    {
        id: 'aircraft-spotter-5',
        name: 'Aircraft Spotter',
        description: 'Fly on 5 different aircraft types',
        icon: '📸',
        category: 'aircraft',
        tier: 'bronze',
        requirement: { type: 'aircraft', value: 5 },
    },
    {
        id: 'aircraft-enthusiast-10',
        name: 'Aircraft Enthusiast',
        description: 'Fly on 10 different aircraft types',
        icon: '🔍',
        category: 'aircraft',
        tier: 'silver',
        requirement: { type: 'aircraft', value: 10 },
    },
    {
        id: 'aircraft-collector-20',
        name: 'Aircraft Collector',
        description: 'Fly on 20 different aircraft types',
        icon: '🏅',
        category: 'aircraft',
        tier: 'gold',
        requirement: { type: 'aircraft', value: 20 },
    },

    // Distance achievements
    {
        id: 'starter-1000km',
        name: 'Getting Started',
        description: 'Fly 1,000 km total',
        icon: '🚀',
        category: 'distance',
        tier: 'bronze',
        requirement: { type: 'distance', value: 1000 },
    },
    {
        id: 'distance-10000km',
        name: 'Cross-Country',
        description: 'Fly 10,000 km total',
        icon: '🌄',
        category: 'distance',
        tier: 'silver',
        requirement: { type: 'distance', value: 10000 },
    },
    {
        id: 'distance-50000km',
        name: 'Circumnavigator',
        description: 'Fly 50,000 km total (more than Earth\'s circumference!)',
        icon: '🌍',
        category: 'distance',
        tier: 'gold',
        requirement: { type: 'distance', value: 50000 },
    },
    {
        id: 'distance-100000km',
        name: 'Orbital Distance',
        description: 'Fly 100,000 km total',
        icon: '🛸',
        category: 'distance',
        tier: 'platinum',
        requirement: { type: 'distance', value: 100000 },
    },
    {
        id: 'distance-moon',
        name: 'To The Moon',
        description: 'Fly 384,400 km total (distance to the moon!)',
        icon: '🌙',
        category: 'distance',
        tier: 'platinum',
        requirement: { type: 'distance', value: 384400 },
    },

    // Special achievements
    {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Take a flight before 6 AM',
        icon: '🌅',
        category: 'special',
        tier: 'bronze',
        requirement: { type: 'custom', value: 1 },
    },
    {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Take a red-eye flight (departing after 10 PM)',
        icon: '🦉',
        category: 'special',
        tier: 'bronze',
        requirement: { type: 'custom', value: 1 },
    },
    {
        id: 'business-class',
        name: 'Business Class Experience',
        description: 'Fly business class',
        icon: '💼',
        category: 'special',
        tier: 'silver',
        requirement: { type: 'custom', value: 1 },
    },
    {
        id: 'first-class',
        name: 'First Class Experience',
        description: 'Fly first class',
        icon: '👔',
        category: 'special',
        tier: 'gold',
        requirement: { type: 'custom', value: 1 },
    },
    {
        id: 'long-haul',
        name: 'Long Haul Champion',
        description: 'Take a flight over 10,000 km',
        icon: '🏋️',
        category: 'special',
        tier: 'gold',
        requirement: { type: 'custom', value: 1 },
    },
    {
        id: 'transcontinental',
        name: 'Transcontinental',
        description: 'Fly across an ocean',
        icon: '🌊',
        category: 'special',
        tier: 'silver',
        requirement: { type: 'custom', value: 1 },
    },
];

// Category metadata for display
export const achievementCategories = {
    flights: { name: 'Flight Milestones', icon: '✈️', color: 'blue' },
    destinations: { name: 'Destinations', icon: '🌍', color: 'green' },
    aircraft: { name: 'Aircraft', icon: '🛩️', color: 'purple' },
    distance: { name: 'Distance', icon: '📏', color: 'orange' },
    special: { name: 'Special', icon: '⭐', color: 'yellow' },
};

// Tier metadata for display
export const achievementTiers = {
    bronze: { name: 'Bronze', color: '#CD7F32', bgColor: 'rgba(205, 127, 50, 0.2)' },
    silver: { name: 'Silver', color: '#C0C0C0', bgColor: 'rgba(192, 192, 192, 0.2)' },
    gold: { name: 'Gold', color: '#FFD700', bgColor: 'rgba(255, 215, 0, 0.2)' },
    platinum: { name: 'Platinum', color: '#E5E4E2', bgColor: 'rgba(229, 228, 226, 0.2)' },
};

/**
 * Gets an achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
    return achievements.find(a => a.id === id);
}

/**
 * Gets achievements by category
 */
export function getAchievementsByCategory(category: string): Achievement[] {
    return achievements.filter(a => a.category === category);
}

/**
 * Gets achievements by tier
 */
export function getAchievementsByTier(tier: string): Achievement[] {
    return achievements.filter(a => a.tier === tier);
}

export default achievements;

