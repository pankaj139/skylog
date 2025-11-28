/**
 * Globe Heatmap Data Utilities - Phase 3
 * 
 * Calculates visit frequency per region and generates heatmap color data.
 * Used for the heatmap visualization mode on the globe.
 */

import type { Flight } from '../types';

export interface RegionVisit {
    country: string;
    city: string;
    lat: number;
    lng: number;
    visitCount: number;
    intensity: number; // 0-1 normalized
}

export interface HeatmapPoint {
    lat: number;
    lng: number;
    weight: number;
    color: string;
}

/**
 * Generates a color based on intensity (0-1)
 * Uses a gradient from cool (blue) to hot (red/orange)
 */
export function getHeatmapColor(intensity: number): string {
    // Clamp intensity between 0 and 1
    const i = Math.max(0, Math.min(1, intensity));
    
    if (i < 0.25) {
        // Blue to Cyan
        const t = i / 0.25;
        return `rgba(${Math.round(0)}, ${Math.round(255 * t)}, ${Math.round(255)}, ${0.5 + i * 0.5})`;
    } else if (i < 0.5) {
        // Cyan to Green
        const t = (i - 0.25) / 0.25;
        return `rgba(${Math.round(0)}, ${Math.round(255)}, ${Math.round(255 * (1 - t))}, ${0.5 + i * 0.5})`;
    } else if (i < 0.75) {
        // Green to Yellow
        const t = (i - 0.5) / 0.25;
        return `rgba(${Math.round(255 * t)}, ${Math.round(255)}, ${Math.round(0)}, ${0.5 + i * 0.5})`;
    } else {
        // Yellow to Red
        const t = (i - 0.75) / 0.25;
        return `rgba(${Math.round(255)}, ${Math.round(255 * (1 - t))}, ${Math.round(0)}, ${0.5 + i * 0.5})`;
    }
}

/**
 * Calculates visit frequency for each location from flight data
 */
export function calculateRegionVisits(flights: Flight[]): RegionVisit[] {
    const visitMap = new Map<string, RegionVisit>();

    flights.forEach(flight => {
        // Count origin
        const originKey = `${flight.originAirport.city}-${flight.originAirport.country}`;
        const existing = visitMap.get(originKey);
        if (existing) {
            existing.visitCount++;
        } else {
            visitMap.set(originKey, {
                country: flight.originAirport.country,
                city: flight.originAirport.city,
                lat: flight.originAirport.latitude,
                lng: flight.originAirport.longitude,
                visitCount: 1,
                intensity: 0,
            });
        }

        // Count destination
        const destKey = `${flight.destinationAirport.city}-${flight.destinationAirport.country}`;
        const existingDest = visitMap.get(destKey);
        if (existingDest) {
            existingDest.visitCount++;
        } else {
            visitMap.set(destKey, {
                country: flight.destinationAirport.country,
                city: flight.destinationAirport.city,
                lat: flight.destinationAirport.latitude,
                lng: flight.destinationAirport.longitude,
                visitCount: 1,
                intensity: 0,
            });
        }
    });

    const visits = Array.from(visitMap.values());
    
    // Calculate intensity (normalized)
    const maxVisits = Math.max(...visits.map(v => v.visitCount), 1);
    visits.forEach(v => {
        v.intensity = v.visitCount / maxVisits;
    });

    return visits;
}

/**
 * Generates heatmap points for the globe
 */
export function generateHeatmapPoints(flights: Flight[]): HeatmapPoint[] {
    const visits = calculateRegionVisits(flights);
    
    return visits.map(visit => ({
        lat: visit.lat,
        lng: visit.lng,
        weight: visit.intensity,
        color: getHeatmapColor(visit.intensity),
    }));
}

/**
 * Groups flights by year for time-lapse visualization
 */
export function groupFlightsByYear(flights: Flight[]): Map<number, Flight[]> {
    const yearMap = new Map<number, Flight[]>();
    
    flights.forEach(flight => {
        const year = new Date(flight.date).getFullYear();
        const yearFlights = yearMap.get(year) || [];
        yearFlights.push(flight);
        yearMap.set(year, yearFlights);
    });

    return yearMap;
}

/**
 * Sorts flights chronologically
 */
export function sortFlightsChronologically(flights: Flight[]): Flight[] {
    return [...flights].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

/**
 * Gets year range from flights
 */
export function getYearRange(flights: Flight[]): { minYear: number; maxYear: number } {
    if (flights.length === 0) {
        const currentYear = new Date().getFullYear();
        return { minYear: currentYear, maxYear: currentYear };
    }

    const years = flights.map(f => new Date(f.date).getFullYear());
    return {
        minYear: Math.min(...years),
        maxYear: Math.max(...years),
    };
}

/**
 * Generates arc colors by year
 */
export function getArcColorByYear(year: number, minYear: number, maxYear: number): string[] {
    const range = maxYear - minYear || 1;
    const normalized = (year - minYear) / range;
    
    // Generate a color gradient from purple (oldest) to cyan (newest)
    const hue = 260 - (normalized * 80); // 260 (purple) to 180 (cyan)
    return [`hsl(${hue}, 100%, 60%)`, `hsl(${hue}, 100%, 70%)`];
}

/**
 * Generates arc colors by airline
 */
const AIRLINE_COLORS: Record<string, string[]> = {
    'United Airlines': ['#005DAA', '#008EAA'],
    'Delta Air Lines': ['#E01933', '#C81533'],
    'American Airlines': ['#0078D2', '#0095E8'],
    'Southwest Airlines': ['#FFBF27', '#FF9900'],
    'JetBlue': ['#003876', '#0057B8'],
    'British Airways': ['#075AAA', '#2078D2'],
    'Lufthansa': ['#05164D', '#0B2D6E'],
    'Emirates': ['#D71920', '#C41017'],
    'Singapore Airlines': ['#003366', '#004C99'],
    'Air France': ['#002157', '#0055A4'],
};

export function getArcColorByAirline(airline: string): string[] {
    return AIRLINE_COLORS[airline] || ['#00ffff', '#00ccff'];
}

export default {
    getHeatmapColor,
    calculateRegionVisits,
    generateHeatmapPoints,
    groupFlightsByYear,
    sortFlightsChronologically,
    getYearRange,
    getArcColorByYear,
    getArcColorByAirline,
};

