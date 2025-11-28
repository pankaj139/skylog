/**
 * Carbon Calculator - Phase 2: Analytics Dashboard
 * 
 * Calculates CO2 emissions for flights based on distance and aircraft type.
 * Uses industry-standard emission factors from ICAO and DEFRA.
 * 
 * Usage:
 *   import { calculateFlightEmissions, getTotalEmissions } from './carbonCalculator';
 *   
 *   // Calculate emissions for a single flight
 *   const emissions = calculateFlightEmissions(distance, seatClass, aircraftType);
 *   
 *   // Calculate total emissions for all flights
 *   const total = getTotalEmissions(flights);
 */

import type { Flight } from '../types';

/**
 * Emission factors in kg CO2 per passenger-km
 * Based on DEFRA 2023 emission factors and ICAO methodology
 */
const EMISSION_FACTORS = {
    // By flight distance (short/medium/long haul)
    short: 0.255, // < 500 km
    medium: 0.156, // 500 - 3700 km  
    long: 0.150, // > 3700 km

    // Radiative forcing multiplier (accounts for contrails, NOx, etc.)
    rfMultiplier: 1.9,
};

/**
 * Seat class multipliers (relative to economy)
 */
const SEAT_CLASS_MULTIPLIERS: Record<string, number> = {
    'Economy': 1.0,
    'Premium Economy': 1.6,
    'Business': 2.9,
    'First': 4.0,
};

/**
 * Aircraft type efficiency factors (relative to average)
 * Lower is more efficient
 */
const AIRCRAFT_EFFICIENCY: Record<string, number> = {
    // Modern efficient aircraft
    'Airbus A350': 0.85,
    'Boeing 787': 0.85,
    'Airbus A220': 0.88,
    'Boeing 737 MAX': 0.90,
    'Airbus A320neo': 0.90,
    'Airbus A321neo': 0.90,
    
    // Standard modern aircraft
    'Airbus A320': 1.0,
    'Airbus A321': 1.0,
    'Boeing 737': 1.0,
    'Boeing 777': 1.0,
    'Airbus A330': 1.0,
    
    // Older/less efficient
    'Boeing 747': 1.15,
    'Boeing 757': 1.10,
    'Boeing 767': 1.10,
    
    // Regional jets
    'Embraer E190': 1.05,
    'Embraer E195': 1.05,
    'Bombardier CRJ': 1.15,
    
    // Default
    'default': 1.0,
};

/**
 * Determines the haul category based on distance
 * 
 * @param distanceKm - Flight distance in kilometers
 * @returns 'short' | 'medium' | 'long'
 */
function getHaulCategory(distanceKm: number): 'short' | 'medium' | 'long' {
    if (distanceKm < 500) return 'short';
    if (distanceKm < 3700) return 'medium';
    return 'long';
}

/**
 * Gets the aircraft efficiency factor
 * 
 * @param aircraftType - Aircraft model name
 * @returns Efficiency multiplier
 */
function getAircraftEfficiency(aircraftType?: string): number {
    if (!aircraftType) return AIRCRAFT_EFFICIENCY.default;
    
    // Try to match the aircraft type
    const normalizedType = aircraftType.toLowerCase();
    
    for (const [key, value] of Object.entries(AIRCRAFT_EFFICIENCY)) {
        if (key.toLowerCase().includes(normalizedType) || 
            normalizedType.includes(key.toLowerCase().split(' ')[0])) {
            return value;
        }
    }
    
    return AIRCRAFT_EFFICIENCY.default;
}

/**
 * Calculates CO2 emissions for a single flight
 * 
 * @param distanceKm - Flight distance in kilometers
 * @param seatClass - Seat class (Economy, Premium Economy, Business, First)
 * @param aircraftType - Optional aircraft model
 * @param includeRadiativeForcing - Whether to include RF multiplier (default: true)
 * @returns CO2 emissions in kg
 * 
 * @example
 * const emissions = calculateFlightEmissions(5500, 'Economy', 'Boeing 787');
 * console.log(`${emissions} kg CO2`);
 */
export function calculateFlightEmissions(
    distanceKm: number,
    seatClass?: string,
    aircraftType?: string,
    includeRadiativeForcing: boolean = true
): number {
    // Get base emission factor based on distance
    const haul = getHaulCategory(distanceKm);
    let emissionFactor = EMISSION_FACTORS[haul];
    
    // Apply seat class multiplier
    const seatMultiplier = seatClass ? (SEAT_CLASS_MULTIPLIERS[seatClass] || 1.0) : 1.0;
    
    // Apply aircraft efficiency factor
    const aircraftFactor = getAircraftEfficiency(aircraftType);
    
    // Calculate base emissions
    let emissions = distanceKm * emissionFactor * seatMultiplier * aircraftFactor;
    
    // Apply radiative forcing multiplier if requested
    if (includeRadiativeForcing) {
        emissions *= EMISSION_FACTORS.rfMultiplier;
    }
    
    return Math.round(emissions * 10) / 10; // Round to 1 decimal
}

/**
 * Calculates total CO2 emissions for multiple flights
 * 
 * @param flights - Array of Flight objects
 * @returns Total CO2 emissions in kg
 */
export function getTotalEmissions(flights: Flight[]): number {
    return flights.reduce((total, flight) => {
        const emissions = calculateFlightEmissions(
            flight.distance || 0,
            flight.seatClass,
            flight.aircraftType
        );
        return total + emissions;
    }, 0);
}

/**
 * Calculates emissions breakdown by various categories
 * 
 * @param flights - Array of Flight objects
 * @returns Emissions data categorized by different dimensions
 */
export function getEmissionsBreakdown(flights: Flight[]) {
    // By month
    const byMonth: Record<string, number> = {};
    // By aircraft
    const byAircraft: Record<string, number> = {};
    // By seat class
    const bySeatClass: Record<string, number> = {};
    
    flights.forEach(flight => {
        const emissions = calculateFlightEmissions(
            flight.distance || 0,
            flight.seatClass,
            flight.aircraftType
        );
        
        // By month
        const month = new Date(flight.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
        });
        byMonth[month] = (byMonth[month] || 0) + emissions;
        
        // By aircraft
        const aircraft = flight.aircraftType || 'Unknown';
        byAircraft[aircraft] = (byAircraft[aircraft] || 0) + emissions;
        
        // By seat class
        const seatClass = flight.seatClass || 'Economy';
        bySeatClass[seatClass] = (bySeatClass[seatClass] || 0) + emissions;
    });
    
    return {
        byMonth: Object.entries(byMonth).map(([month, emissions]) => ({ month, emissions })),
        byAircraft: Object.entries(byAircraft).map(([aircraft, emissions]) => ({ aircraft, emissions })),
        bySeatClass: Object.entries(bySeatClass).map(([seatClass, emissions]) => ({ seatClass, emissions })),
    };
}

/**
 * Gets carbon offset suggestions based on emissions
 * 
 * @param emissionsKg - CO2 emissions in kg
 * @returns Offset suggestions
 */
export function getCarbonOffsetSuggestions(emissionsKg: number) {
    // Trees needed to offset (average tree absorbs ~22 kg CO2/year)
    const treesNeeded = Math.ceil(emissionsKg / 22);
    
    // Estimated offset cost ($15-25 per tonne)
    const offsetCostLow = Math.round(emissionsKg / 1000 * 15);
    const offsetCostHigh = Math.round(emissionsKg / 1000 * 25);
    
    return {
        treesNeeded,
        offsetCostRange: { low: offsetCostLow, high: offsetCostHigh },
        equivalents: {
            carKm: Math.round(emissionsKg / 0.21), // Average car emits 0.21 kg CO2/km
            beefMeals: Math.round(emissionsKg / 6.5), // ~6.5 kg CO2 per beef meal
            smartphones: Math.round(emissionsKg / 70), // ~70 kg CO2 to manufacture smartphone
        },
    };
}

/**
 * Compares user emissions to average traveler
 * 
 * @param userEmissionsKg - User's total emissions in kg
 * @param numFlights - Number of flights
 * @returns Comparison data
 */
export function compareToAverage(userEmissionsKg: number, numFlights: number) {
    // Global average air traveler emits ~1.5 tonnes CO2/year
    const averageAnnualEmissions = 1500;
    
    // Average emissions per flight (globally)
    const averagePerFlight = 250; // kg CO2
    
    const userAveragePerFlight = numFlights > 0 ? userEmissionsKg / numFlights : 0;
    
    return {
        userTotal: Math.round(userEmissionsKg),
        averageAnnual: averageAnnualEmissions,
        percentOfAverage: Math.round((userEmissionsKg / averageAnnualEmissions) * 100),
        userPerFlight: Math.round(userAveragePerFlight),
        averagePerFlight,
        betterThanAverage: userAveragePerFlight < averagePerFlight,
    };
}

/**
 * Formats emissions for display
 * 
 * @param emissionsKg - Emissions in kg
 * @returns Formatted string
 */
export function formatEmissions(emissionsKg: number): string {
    if (emissionsKg >= 1000) {
        return `${(emissionsKg / 1000).toFixed(1)} tonnes`;
    }
    return `${Math.round(emissionsKg)} kg`;
}

