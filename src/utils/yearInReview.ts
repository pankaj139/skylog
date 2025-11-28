/**
 * Year in Review Utilities - Phase 3
 * 
 * Calculates yearly statistics and generates highlight data
 * for the Year in Review feature.
 */

import type { Flight, YearInReviewData } from '../types';

/**
 * Generates Year in Review data for a specific year
 */
export function generateYearInReview(flights: Flight[], year: number): YearInReviewData {
    // Filter flights for the specified year
    const yearFlights = flights.filter(f => 
        new Date(f.date).getFullYear() === year
    );

    if (yearFlights.length === 0) {
        return {
            year,
            totalFlights: 0,
            totalDistance: 0,
            totalDuration: 0,
            countriesVisited: [],
            citiesVisited: [],
            airlinesFlown: [],
            longestFlight: null,
            mostVisitedCity: null,
            mostFlownAirline: null,
            firstFlightOfYear: null,
            lastFlightOfYear: null,
            newCountries: [],
            highlights: [],
        };
    }

    // Calculate basic stats
    const totalDistance = yearFlights.reduce((sum, f) => sum + (f.distance || 0), 0);
    const totalDuration = yearFlights.reduce((sum, f) => sum + (f.duration || 0), 0);

    // Get unique countries and cities
    const countriesSet = new Set<string>();
    const citiesCount = new Map<string, number>();
    const airlineCount = new Map<string, number>();

    yearFlights.forEach(f => {
        // Countries
        countriesSet.add(f.originAirport.country);
        countriesSet.add(f.destinationAirport.country);

        // Cities
        [f.originAirport.city, f.destinationAirport.city].forEach(city => {
            citiesCount.set(city, (citiesCount.get(city) || 0) + 1);
        });

        // Airlines
        airlineCount.set(f.airline, (airlineCount.get(f.airline) || 0) + 1);
    });

    const countriesVisited = Array.from(countriesSet);
    const citiesVisited = Array.from(new Set([
        ...yearFlights.map(f => f.originAirport.city),
        ...yearFlights.map(f => f.destinationAirport.city),
    ]));
    const airlinesFlown = Array.from(new Set(yearFlights.map(f => f.airline)));

    // Find longest flight
    const longestFlight = yearFlights.reduce((longest, f) => {
        if (!longest || (f.distance || 0) > (longest.distance || 0)) {
            return f;
        }
        return longest;
    }, null as Flight | null);

    // Find most visited city
    let mostVisitedCity: { city: string; count: number } | null = null;
    citiesCount.forEach((count, city) => {
        if (!mostVisitedCity || count > mostVisitedCity.count) {
            mostVisitedCity = { city, count };
        }
    });

    // Find most flown airline
    let mostFlownAirline: { airline: string; count: number } | null = null;
    airlineCount.forEach((count, airline) => {
        if (!mostFlownAirline || count > mostFlownAirline.count) {
            mostFlownAirline = { airline, count };
        }
    });

    // Sort flights by date to find first and last
    const sortedFlights = [...yearFlights].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstFlightOfYear = sortedFlights[0] || null;
    const lastFlightOfYear = sortedFlights[sortedFlights.length - 1] || null;

    // Find new countries (visited for first time this year)
    const previousYearFlights = flights.filter(f => 
        new Date(f.date).getFullYear() < year
    );
    const previousCountries = new Set<string>();
    previousYearFlights.forEach(f => {
        previousCountries.add(f.originAirport.country);
        previousCountries.add(f.destinationAirport.country);
    });
    const newCountries = countriesVisited.filter(c => !previousCountries.has(c));

    // Generate highlights
    const highlights = generateHighlights({
        totalFlights: yearFlights.length,
        totalDistance,
        totalDuration,
        countriesVisited,
        citiesVisited,
        longestFlight,
        mostVisitedCity,
        mostFlownAirline,
        newCountries,
    });

    return {
        year,
        totalFlights: yearFlights.length,
        totalDistance,
        totalDuration,
        countriesVisited,
        citiesVisited,
        airlinesFlown,
        longestFlight,
        mostVisitedCity,
        mostFlownAirline,
        firstFlightOfYear,
        lastFlightOfYear,
        newCountries,
        highlights,
    };
}

/**
 * Generates highlight cards for Year in Review
 */
function generateHighlights(data: {
    totalFlights: number;
    totalDistance: number;
    totalDuration: number;
    countriesVisited: string[];
    citiesVisited: string[];
    longestFlight: Flight | null;
    mostVisitedCity: { city: string; count: number } | null;
    mostFlownAirline: { airline: string; count: number } | null;
    newCountries: string[];
}): YearInReviewData['highlights'] {
    const highlights: YearInReviewData['highlights'] = [];

    // Total flights
    highlights.push({
        label: 'Total Flights',
        value: data.totalFlights.toString(),
        icon: '✈️',
    });

    // Total distance
    if (data.totalDistance > 0) {
        const distanceStr = data.totalDistance >= 1000
            ? `${(data.totalDistance / 1000).toFixed(1)}k km`
            : `${Math.round(data.totalDistance)} km`;
        highlights.push({
            label: 'Distance Flown',
            value: distanceStr,
            icon: '📏',
        });
    }

    // Time in air
    if (data.totalDuration > 0) {
        const hours = Math.floor(data.totalDuration / 60);
        highlights.push({
            label: 'Time in Air',
            value: `${hours}h`,
            icon: '⏱️',
        });
    }

    // Countries
    if (data.countriesVisited.length > 0) {
        highlights.push({
            label: 'Countries',
            value: data.countriesVisited.length.toString(),
            icon: '🌍',
        });
    }

    // Cities
    if (data.citiesVisited.length > 0) {
        highlights.push({
            label: 'Cities',
            value: data.citiesVisited.length.toString(),
            icon: '🏙️',
        });
    }

    // New countries explored
    if (data.newCountries.length > 0) {
        highlights.push({
            label: 'New Countries',
            value: data.newCountries.length.toString(),
            icon: '🆕',
        });
    }

    // Longest flight
    if (data.longestFlight) {
        highlights.push({
            label: 'Longest Flight',
            value: `${data.longestFlight.originAirport.iata}→${data.longestFlight.destinationAirport.iata}`,
            icon: '🏆',
        });
    }

    // Most visited city
    if (data.mostVisitedCity) {
        highlights.push({
            label: 'Favorite City',
            value: data.mostVisitedCity.city,
            icon: '❤️',
        });
    }

    // Most flown airline
    if (data.mostFlownAirline) {
        highlights.push({
            label: 'Go-To Airline',
            value: data.mostFlownAirline.airline,
            icon: '🛫',
        });
    }

    return highlights;
}

/**
 * Gets available years from flight data
 */
export function getAvailableYears(flights: Flight[]): number[] {
    const years = new Set<number>();
    flights.forEach(f => {
        years.add(new Date(f.date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a); // Descending order
}

/**
 * Formats a stat value for display with animation-ready properties
 */
export function formatStatForDisplay(value: number, unit: string): {
    displayValue: string;
    suffix: string;
} {
    if (value >= 1000000) {
        return {
            displayValue: (value / 1000000).toFixed(1),
            suffix: `M ${unit}`,
        };
    }
    if (value >= 1000) {
        return {
            displayValue: (value / 1000).toFixed(1),
            suffix: `k ${unit}`,
        };
    }
    return {
        displayValue: value.toString(),
        suffix: unit,
    };
}

export default {
    generateYearInReview,
    getAvailableYears,
    formatStatForDisplay,
};

