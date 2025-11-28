import type { Airport } from '../types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Estimate flight duration based on distance
 * Very rough estimation: ~800 km/h average speed
 * @param distance - Distance in kilometers
 * @returns Duration in minutes
 */
export function estimateFlightDuration(distance: number): number {
    const averageSpeed = 800; // km/h
    const hours = distance / averageSpeed;
    // Add 30 minutes for takeoff and landing
    const totalMinutes = (hours * 60) + 30;
    return Math.round(totalMinutes);
}

/**
 * Get unique values from array
 */
export function getUniqueValues<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
}

/**
 * Count unique airports from origin and destination
 */
export function getUniqueAirports(
    origins: Airport[],
    destinations: Airport[]
): string[] {
    const allAirports = [
        ...origins.map((a) => a.iata),
        ...destinations.map((a) => a.iata),
    ];
    return getUniqueValues(allAirports);
}

/**
 * Get unique countries from airports
 */
export function getUniqueCountries(airports: Airport[]): string[] {
    return getUniqueValues(airports.map((a) => a.country));
}
