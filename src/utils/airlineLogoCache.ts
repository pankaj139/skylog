import { searchAirlines, type Airline } from '../data/airlines';

// Cache for airline data lookups
const airlineCache = new Map<string, Airline | null>();

// Cache for preloaded logo URLs (to track which logos have been fetched)
const logoLoadedCache = new Set<string>();

/**
 * Get airline data by name (with caching)
 */
export function getAirlineData(airlineName: string): Airline | null {
    if (!airlineName) return null;
    
    const cacheKey = airlineName.toLowerCase().trim();
    
    if (airlineCache.has(cacheKey)) {
        return airlineCache.get(cacheKey) || null;
    }
    
    const results = searchAirlines(airlineName);
    const airline = results.length > 0 ? results[0] : null;
    
    airlineCache.set(cacheKey, airline);
    return airline;
}

/**
 * Get airline logo URL by airline name (with caching)
 */
export function getAirlineLogo(airlineName: string): string | null {
    const airline = getAirlineData(airlineName);
    return airline?.logo || null;
}

/**
 * Preload an airline logo image into browser cache
 */
export function preloadAirlineLogo(airlineName: string): void {
    const logoUrl = getAirlineLogo(airlineName);
    
    if (logoUrl && !logoLoadedCache.has(logoUrl)) {
        const img = new Image();
        img.src = logoUrl;
        logoLoadedCache.add(logoUrl);
    }
}

/**
 * Preload multiple airline logos
 */
export function preloadAirlineLogos(airlineNames: string[]): void {
    airlineNames.forEach(name => preloadAirlineLogo(name));
}

/**
 * Check if a logo has been preloaded
 */
export function isLogoPreloaded(airlineName: string): boolean {
    const logoUrl = getAirlineLogo(airlineName);
    return logoUrl ? logoLoadedCache.has(logoUrl) : false;
}

/**
 * Clear the airline cache (useful for testing or memory management)
 */
export function clearAirlineCache(): void {
    airlineCache.clear();
    logoLoadedCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { airlineCount: number; logoCount: number } {
    return {
        airlineCount: airlineCache.size,
        logoCount: logoLoadedCache.size,
    };
}

