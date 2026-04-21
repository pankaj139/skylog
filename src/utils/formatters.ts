import { format, parseISO } from 'date-fns';

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM dd, yyyy HH:mm');
}

/**
 * Format distance (km to readable format)
 */
export function formatDistance(km: number): string {
    if (km >= 1000) {
        return `${(km / 1000).toFixed(1)}K km`;
    }
    return `${km.toLocaleString()} km`;
}

/**
 * Format duration in minutes to hours and minutes
 */
export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins}m`;
    }
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
}

/**
 * Format number with abbreviations (K, M, B)
 */
export function formatNumber(num: number): string {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Format airport display (IATA - Name, City)
 */
export function formatAirportDisplay(
    iata: string,
    name: string,
    city: string
): string {
    return `${iata} - ${name}, ${city}`;
}

/**
 * Formats an amount in Indian Rupees for display.
 */
export function formatInr(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Formats loyalty points for display.
 */
export function formatPoints(points: number): string {
    return `${points.toLocaleString('en-IN')} pts`;
}
