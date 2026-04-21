/**
 * Achievement Service - Phase 3
 * 
 * Handles achievement checking, unlocking, and progress tracking.
 * Calculates user stats and determines which achievements are unlocked.
 */

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Flight, Achievement, UserProgress, UserAchievement } from '../types';
import { achievements } from '../data/achievements';

// Continent mapping for countries
const CONTINENT_MAP: Record<string, string> = {
    // North America
    'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
    'Cuba': 'North America', 'Jamaica': 'North America', 'Panama': 'North America',
    'Costa Rica': 'North America', 'Guatemala': 'North America',

    // South America
    'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America',
    'Colombia': 'South America', 'Peru': 'South America', 'Ecuador': 'South America',
    'Venezuela': 'South America', 'Uruguay': 'South America', 'Bolivia': 'South America',

    // Europe
    'United Kingdom': 'Europe', 'France': 'Europe', 'Germany': 'Europe', 'Spain': 'Europe',
    'Italy': 'Europe', 'Netherlands': 'Europe', 'Belgium': 'Europe', 'Switzerland': 'Europe',
    'Austria': 'Europe', 'Portugal': 'Europe', 'Greece': 'Europe', 'Sweden': 'Europe',
    'Norway': 'Europe', 'Denmark': 'Europe', 'Finland': 'Europe', 'Poland': 'Europe',
    'Czech Republic': 'Europe', 'Ireland': 'Europe', 'Russia': 'Europe', 'Turkey': 'Europe',
    'Hungary': 'Europe', 'Romania': 'Europe', 'Croatia': 'Europe', 'Ukraine': 'Europe',

    // Asia
    'Japan': 'Asia', 'China': 'Asia', 'India': 'Asia', 'South Korea': 'Asia',
    'Singapore': 'Asia', 'Thailand': 'Asia', 'Indonesia': 'Asia', 'Malaysia': 'Asia',
    'Vietnam': 'Asia', 'Philippines': 'Asia', 'Taiwan': 'Asia', 'Hong Kong': 'Asia',
    'United Arab Emirates': 'Asia', 'Saudi Arabia': 'Asia', 'Qatar': 'Asia',
    'Israel': 'Asia', 'Sri Lanka': 'Asia', 'Pakistan': 'Asia', 'Bangladesh': 'Asia',
    'Nepal': 'Asia', 'Maldives': 'Asia',

    // Africa
    'Egypt': 'Africa', 'South Africa': 'Africa', 'Morocco': 'Africa', 'Kenya': 'Africa',
    'Nigeria': 'Africa', 'Ethiopia': 'Africa', 'Tanzania': 'Africa', 'Tunisia': 'Africa',
    'Ghana': 'Africa', 'Senegal': 'Africa', 'Algeria': 'Africa',

    // Oceania
    'Australia': 'Oceania', 'New Zealand': 'Oceania', 'Fiji': 'Oceania',
    'Papua New Guinea': 'Oceania', 'Samoa': 'Oceania',

    // Antarctica (rare)
    'Antarctica': 'Antarctica',
};

/**
 * Gets the continent for a country
 */
function getContinent(country: string): string {
    return CONTINENT_MAP[country] || 'Unknown';
}

/**
 * Normalizes an aircraft registration for comparison (trim, uppercase, remove spaces).
 *
 * @param registration - Raw tail number from user input or stored flight
 * @returns Normalized string or null if empty
 */
function normalizeAircraftRegistration(registration?: string): string | null {
    const r = registration?.trim();
    if (!r) return null;
    return r.toUpperCase().replace(/\s+/g, '');
}

/**
 * Returns true if at least two logged flights share the same non-empty aircraft registration.
 *
 * @param flights - User's flight list
 * @returns Whether the "same tail again" condition is met
 */
function hasRepeatAircraftRegistration(flights: Flight[]): boolean {
    const counts = new Map<string, number>();
    for (const f of flights) {
        const key = normalizeAircraftRegistration(f.aircraftRegistration);
        if (!key) continue;
        const next = (counts.get(key) || 0) + 1;
        counts.set(key, next);
        if (next >= 2) return true;
    }
    return false;
}

/**
 * Calculates user statistics from their flights
 */
export function calculateUserStats(flights: Flight[]): UserProgress['stats'] {
    const countries = new Set<string>();
    const continents = new Set<string>();
    const airports = new Set<string>();
    const airlines = new Set<string>();
    const aircraftTypes = new Set<string>();
    let totalDistance = 0;
    let totalSpentInr = 0;
    let totalPointsSpent = 0;

    flights.forEach(flight => {
        // Countries
        countries.add(flight.originAirport.country);
        countries.add(flight.destinationAirport.country);

        // Continents
        continents.add(getContinent(flight.originAirport.country));
        continents.add(getContinent(flight.destinationAirport.country));

        // Airports
        airports.add(flight.originAirport.iata);
        airports.add(flight.destinationAirport.iata);

        // Airlines
        airlines.add(flight.airline);

        // Aircraft types
        if (flight.aircraftType) {
            aircraftTypes.add(flight.aircraftType);
        }

        // Distance
        totalDistance += flight.distance || 0;

        if (typeof flight.amountPaidInr === 'number' && !Number.isNaN(flight.amountPaidInr)) {
            totalSpentInr += Math.max(0, flight.amountPaidInr);
        }
        if (typeof flight.pointsPaid === 'number' && !Number.isNaN(flight.pointsPaid)) {
            totalPointsSpent += Math.max(0, flight.pointsPaid);
        }
    });

    // Remove 'Unknown' continent if present
    continents.delete('Unknown');

    return {
        totalFlights: flights.length,
        countriesVisited: countries.size,
        continentsVisited: continents.size,
        airportsVisited: airports.size,
        airlinesFlown: airlines.size,
        aircraftTypesFlown: aircraftTypes.size,
        totalDistance: Math.round(totalDistance),
        totalSpentInr: Math.round(totalSpentInr),
        totalPointsSpent: Math.round(totalPointsSpent),
    };
}

/**
 * Checks if a specific achievement is unlocked based on stats
 */
export function isAchievementUnlocked(
    achievement: Achievement,
    stats: UserProgress['stats'],
    flights: Flight[]
): boolean {
    const { requirement } = achievement;

    switch (requirement.type) {
        case 'flights':
            return stats.totalFlights >= requirement.value;
        case 'countries':
            return stats.countriesVisited >= requirement.value;
        case 'continents':
            return stats.continentsVisited >= requirement.value;
        case 'airports':
            return stats.airportsVisited >= requirement.value;
        case 'airlines':
            return stats.airlinesFlown >= requirement.value;
        case 'aircraft':
            return stats.aircraftTypesFlown >= requirement.value;
        case 'distance':
            return stats.totalDistance >= requirement.value;
        case 'spentInr':
            return (stats.totalSpentInr ?? 0) >= requirement.value;
        case 'pointsSpent':
            return (stats.totalPointsSpent ?? 0) >= requirement.value;
        case 'custom':
            return checkCustomAchievement(achievement.id, flights);
        default:
            return false;
    }
}

/**
 * Checks custom achievement conditions
 */
function checkCustomAchievement(achievementId: string, flights: Flight[]): boolean {
    switch (achievementId) {
        case 'business-class':
            return flights.some(f => f.seatClass === 'Business');
        case 'first-class':
            return flights.some(f => f.seatClass === 'First');
        case 'long-haul':
            return flights.some(f => (f.distance || 0) >= 10000);
        case 'transcontinental':
            return flights.some(f => {
                const originContinent = getContinent(f.originAirport.country);
                const destContinent = getContinent(f.destinationAirport.country);
                return originContinent !== destContinent && originContinent !== 'Unknown' && destContinent !== 'Unknown';
            });
        case 'familiar-airframe':
            return hasRepeatAircraftRegistration(flights);
        case 'flying-together':
            return flights.some(f => (f.passengerCount ?? 1) >= 2);
        default:
            return false;
    }
}

/**
 * Gets all unlocked achievements for a user
 */
export function getUnlockedAchievements(
    stats: UserProgress['stats'],
    flights: Flight[],
    existingAchievements: UserAchievement[]
): { achievement: Achievement; isNew: boolean }[] {
    const existingIds = new Set(existingAchievements.map(a => a.achievementId));
    const unlocked: { achievement: Achievement; isNew: boolean }[] = [];

    achievements.forEach(achievement => {
        if (isAchievementUnlocked(achievement, stats, flights)) {
            unlocked.push({
                achievement,
                isNew: !existingIds.has(achievement.id),
            });
        }
    });

    return unlocked;
}

/**
 * Gets newly unlocked achievements (not previously unlocked)
 */
export function getNewlyUnlockedAchievements(
    stats: UserProgress['stats'],
    flights: Flight[],
    existingAchievements: UserAchievement[]
): Achievement[] {
    const existingIds = new Set(existingAchievements.map(a => a.achievementId));

    return achievements.filter(achievement => {
        const isUnlocked = isAchievementUnlocked(achievement, stats, flights);
        const isNew = !existingIds.has(achievement.id);
        return isUnlocked && isNew;
    });
}

/**
 * Gets user progress from Firestore
 */
const EMPTY_STATS: UserProgress['stats'] = {
    totalFlights: 0,
    countriesVisited: 0,
    continentsVisited: 0,
    airportsVisited: 0,
    airlinesFlown: 0,
    aircraftTypesFlown: 0,
    totalDistance: 0,
    totalSpentInr: 0,
    totalPointsSpent: 0,
};

/**
 * Ensures a Firestore userProgress document exists for achievement tracking.
 *
 * @param userId - The signed-in user's ID
 * @returns Existing or newly created progress record
 */
export async function ensureUserProgress(userId: string): Promise<UserProgress> {
    const existing = await getUserProgress(userId);
    if (existing) return existing;
    return updateUserProgress(userId, EMPTY_STATS, []);
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
        const docRef = doc(db, 'userProgress', userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            userId: data.userId,
            achievements: data.achievements.map((a: { achievementId: string; unlockedAt: { toDate: () => Date } }) => ({
                achievementId: a.achievementId,
                unlockedAt: a.unlockedAt.toDate(),
            })),
            stats: { ...EMPTY_STATS, ...(data.stats || {}) },
            updatedAt: data.updatedAt.toDate(),
        };
    } catch (error) {
        console.error('Error getting user progress:', error);
        return null;
    }
}

/**
 * Updates user progress in Firestore
 */
export async function updateUserProgress(
    userId: string,
    stats: UserProgress['stats'],
    newAchievements: Achievement[]
): Promise<UserProgress> {
    try {
        const docRef = doc(db, 'userProgress', userId);
        const existing = await getUserProgress(userId);

        const existingAchievements = existing?.achievements || [];
        const newUserAchievements: UserAchievement[] = newAchievements.map(a => ({
            achievementId: a.id,
            unlockedAt: new Date(),
        }));

        const allAchievements = [...existingAchievements, ...newUserAchievements];

        const progress: UserProgress = {
            userId,
            achievements: allAchievements,
            stats,
            updatedAt: new Date(),
        };

        await setDoc(docRef, {
            userId,
            achievements: allAchievements.map(a => ({
                achievementId: a.achievementId,
                unlockedAt: Timestamp.fromDate(a.unlockedAt),
            })),
            stats,
            updatedAt: Timestamp.now(),
        });

        return progress;
    } catch (error) {
        console.error('Error updating user progress:', error);
        throw error;
    }
}

/**
 * Gets progress percentage for an achievement
 */
export function getAchievementProgress(
    achievement: Achievement,
    stats: UserProgress['stats']
): number {
    const { requirement } = achievement;
    let current = 0;

    switch (requirement.type) {
        case 'flights':
            current = stats.totalFlights;
            break;
        case 'countries':
            current = stats.countriesVisited;
            break;
        case 'continents':
            current = stats.continentsVisited;
            break;
        case 'airports':
            current = stats.airportsVisited;
            break;
        case 'airlines':
            current = stats.airlinesFlown;
            break;
        case 'aircraft':
            current = stats.aircraftTypesFlown;
            break;
        case 'distance':
            current = stats.totalDistance;
            break;
        case 'spentInr':
            current = stats.totalSpentInr ?? 0;
            break;
        case 'pointsSpent':
            current = stats.totalPointsSpent ?? 0;
            break;
        default:
            return 0;
    }

    return Math.min(100, Math.round((current / requirement.value) * 100));
}

export default {
    calculateUserStats,
    isAchievementUnlocked,
    getUnlockedAchievements,
    getNewlyUnlockedAchievements,
    getUserProgress,
    ensureUserProgress,
    updateUserProgress,
    getAchievementProgress,
};

