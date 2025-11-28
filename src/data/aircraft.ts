/**
 * Aircraft Data - Phase 2 Enhancement
 * 
 * Contains a comprehensive list of commercial aircraft types
 * with manufacturer, model, and category information.
 * 
 * Usage:
 *   import { searchAircraft, getPopularAircraft, type Aircraft } from './aircraft';
 *   
 *   const results = searchAircraft('787');
 *   const popular = getPopularAircraft();
 */

export interface Aircraft {
    code: string;         // ICAO/IATA code
    manufacturer: string; // e.g., "Boeing", "Airbus"
    model: string;        // e.g., "737-800", "A320neo"
    name: string;         // Full display name
    category: 'narrow' | 'wide' | 'regional' | 'cargo';
    popular?: boolean;    // Common aircraft types
}

/**
 * Comprehensive list of commercial aircraft
 */
export const aircraft: Aircraft[] = [
    // Boeing - Narrow Body
    { code: 'B737', manufacturer: 'Boeing', model: '737', name: 'Boeing 737', category: 'narrow', popular: true },
    { code: 'B738', manufacturer: 'Boeing', model: '737-800', name: 'Boeing 737-800', category: 'narrow', popular: true },
    { code: 'B739', manufacturer: 'Boeing', model: '737-900', name: 'Boeing 737-900', category: 'narrow' },
    { code: 'B37M', manufacturer: 'Boeing', model: '737 MAX 8', name: 'Boeing 737 MAX 8', category: 'narrow', popular: true },
    { code: 'B38M', manufacturer: 'Boeing', model: '737 MAX 8', name: 'Boeing 737 MAX 8', category: 'narrow' },
    { code: 'B39M', manufacturer: 'Boeing', model: '737 MAX 9', name: 'Boeing 737 MAX 9', category: 'narrow' },
    { code: 'B3XM', manufacturer: 'Boeing', model: '737 MAX 10', name: 'Boeing 737 MAX 10', category: 'narrow' },
    { code: 'B752', manufacturer: 'Boeing', model: '757-200', name: 'Boeing 757-200', category: 'narrow' },
    { code: 'B753', manufacturer: 'Boeing', model: '757-300', name: 'Boeing 757-300', category: 'narrow' },
    
    // Boeing - Wide Body
    { code: 'B763', manufacturer: 'Boeing', model: '767-300', name: 'Boeing 767-300', category: 'wide' },
    { code: 'B764', manufacturer: 'Boeing', model: '767-400', name: 'Boeing 767-400', category: 'wide' },
    { code: 'B772', manufacturer: 'Boeing', model: '777-200', name: 'Boeing 777-200', category: 'wide', popular: true },
    { code: 'B773', manufacturer: 'Boeing', model: '777-300', name: 'Boeing 777-300', category: 'wide', popular: true },
    { code: 'B77W', manufacturer: 'Boeing', model: '777-300ER', name: 'Boeing 777-300ER', category: 'wide', popular: true },
    { code: 'B778', manufacturer: 'Boeing', model: '777-8', name: 'Boeing 777-8', category: 'wide' },
    { code: 'B779', manufacturer: 'Boeing', model: '777-9', name: 'Boeing 777-9', category: 'wide' },
    { code: 'B744', manufacturer: 'Boeing', model: '747-400', name: 'Boeing 747-400', category: 'wide' },
    { code: 'B748', manufacturer: 'Boeing', model: '747-8', name: 'Boeing 747-8', category: 'wide' },
    { code: 'B788', manufacturer: 'Boeing', model: '787-8', name: 'Boeing 787-8 Dreamliner', category: 'wide', popular: true },
    { code: 'B789', manufacturer: 'Boeing', model: '787-9', name: 'Boeing 787-9 Dreamliner', category: 'wide', popular: true },
    { code: 'B78X', manufacturer: 'Boeing', model: '787-10', name: 'Boeing 787-10 Dreamliner', category: 'wide' },
    
    // Airbus - Narrow Body
    { code: 'A318', manufacturer: 'Airbus', model: 'A318', name: 'Airbus A318', category: 'narrow' },
    { code: 'A319', manufacturer: 'Airbus', model: 'A319', name: 'Airbus A319', category: 'narrow' },
    { code: 'A19N', manufacturer: 'Airbus', model: 'A319neo', name: 'Airbus A319neo', category: 'narrow' },
    { code: 'A320', manufacturer: 'Airbus', model: 'A320', name: 'Airbus A320', category: 'narrow', popular: true },
    { code: 'A20N', manufacturer: 'Airbus', model: 'A320neo', name: 'Airbus A320neo', category: 'narrow', popular: true },
    { code: 'A321', manufacturer: 'Airbus', model: 'A321', name: 'Airbus A321', category: 'narrow', popular: true },
    { code: 'A21N', manufacturer: 'Airbus', model: 'A321neo', name: 'Airbus A321neo', category: 'narrow', popular: true },
    { code: 'A321XLR', manufacturer: 'Airbus', model: 'A321XLR', name: 'Airbus A321XLR', category: 'narrow' },
    
    // Airbus - Wide Body
    { code: 'A332', manufacturer: 'Airbus', model: 'A330-200', name: 'Airbus A330-200', category: 'wide' },
    { code: 'A333', manufacturer: 'Airbus', model: 'A330-300', name: 'Airbus A330-300', category: 'wide', popular: true },
    { code: 'A338', manufacturer: 'Airbus', model: 'A330-800neo', name: 'Airbus A330-800neo', category: 'wide' },
    { code: 'A339', manufacturer: 'Airbus', model: 'A330-900neo', name: 'Airbus A330-900neo', category: 'wide' },
    { code: 'A342', manufacturer: 'Airbus', model: 'A340-200', name: 'Airbus A340-200', category: 'wide' },
    { code: 'A343', manufacturer: 'Airbus', model: 'A340-300', name: 'Airbus A340-300', category: 'wide' },
    { code: 'A345', manufacturer: 'Airbus', model: 'A340-500', name: 'Airbus A340-500', category: 'wide' },
    { code: 'A346', manufacturer: 'Airbus', model: 'A340-600', name: 'Airbus A340-600', category: 'wide' },
    { code: 'A359', manufacturer: 'Airbus', model: 'A350-900', name: 'Airbus A350-900', category: 'wide', popular: true },
    { code: 'A35K', manufacturer: 'Airbus', model: 'A350-1000', name: 'Airbus A350-1000', category: 'wide', popular: true },
    { code: 'A380', manufacturer: 'Airbus', model: 'A380', name: 'Airbus A380', category: 'wide', popular: true },
    { code: 'A388', manufacturer: 'Airbus', model: 'A380-800', name: 'Airbus A380-800', category: 'wide' },
    
    // Airbus - Regional
    { code: 'A220', manufacturer: 'Airbus', model: 'A220', name: 'Airbus A220', category: 'regional' },
    { code: 'BCS1', manufacturer: 'Airbus', model: 'A220-100', name: 'Airbus A220-100', category: 'regional' },
    { code: 'BCS3', manufacturer: 'Airbus', model: 'A220-300', name: 'Airbus A220-300', category: 'regional', popular: true },
    
    // Embraer
    { code: 'E170', manufacturer: 'Embraer', model: 'E170', name: 'Embraer E170', category: 'regional' },
    { code: 'E175', manufacturer: 'Embraer', model: 'E175', name: 'Embraer E175', category: 'regional', popular: true },
    { code: 'E190', manufacturer: 'Embraer', model: 'E190', name: 'Embraer E190', category: 'regional', popular: true },
    { code: 'E195', manufacturer: 'Embraer', model: 'E195', name: 'Embraer E195', category: 'regional' },
    { code: 'E290', manufacturer: 'Embraer', model: 'E190-E2', name: 'Embraer E190-E2', category: 'regional' },
    { code: 'E295', manufacturer: 'Embraer', model: 'E195-E2', name: 'Embraer E195-E2', category: 'regional' },
    
    // Bombardier / Regional Jets
    { code: 'CRJ2', manufacturer: 'Bombardier', model: 'CRJ-200', name: 'Bombardier CRJ-200', category: 'regional' },
    { code: 'CRJ7', manufacturer: 'Bombardier', model: 'CRJ-700', name: 'Bombardier CRJ-700', category: 'regional' },
    { code: 'CRJ9', manufacturer: 'Bombardier', model: 'CRJ-900', name: 'Bombardier CRJ-900', category: 'regional' },
    { code: 'CRJX', manufacturer: 'Bombardier', model: 'CRJ-1000', name: 'Bombardier CRJ-1000', category: 'regional' },
    { code: 'DH8A', manufacturer: 'De Havilland', model: 'Dash 8-100', name: 'De Havilland Dash 8-100', category: 'regional' },
    { code: 'DH8D', manufacturer: 'De Havilland', model: 'Dash 8-400', name: 'De Havilland Dash 8-400', category: 'regional' },
    
    // ATR (Turboprops)
    { code: 'AT43', manufacturer: 'ATR', model: '42-300', name: 'ATR 42-300', category: 'regional' },
    { code: 'AT45', manufacturer: 'ATR', model: '42-500', name: 'ATR 42-500', category: 'regional' },
    { code: 'AT72', manufacturer: 'ATR', model: '72', name: 'ATR 72', category: 'regional' },
    { code: 'AT76', manufacturer: 'ATR', model: '72-600', name: 'ATR 72-600', category: 'regional' },
    
    // Other Manufacturers
    { code: 'A220', manufacturer: 'Airbus', model: 'A220', name: 'Airbus A220 (Bombardier CS)', category: 'regional' },
    { code: 'SF34', manufacturer: 'Saab', model: '340', name: 'Saab 340', category: 'regional' },
    { code: 'SU95', manufacturer: 'Sukhoi', model: 'Superjet 100', name: 'Sukhoi Superjet 100', category: 'regional' },
    { code: 'C919', manufacturer: 'COMAC', model: 'C919', name: 'COMAC C919', category: 'narrow' },
];

/**
 * Searches aircraft by name, model, manufacturer, or code
 * 
 * @param query - Search query string
 * @returns Array of matching Aircraft objects (max 15)
 */
export function searchAircraft(query: string): Aircraft[] {
    if (!query || query.length < 1) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // Score-based search for better results
    const scored = aircraft.map(ac => {
        let score = 0;
        const name = ac.name.toLowerCase();
        const model = ac.model.toLowerCase();
        const manufacturer = ac.manufacturer.toLowerCase();
        const code = ac.code.toLowerCase();
        
        // Exact matches score highest
        if (name === normalizedQuery) score += 100;
        if (model === normalizedQuery) score += 90;
        if (code === normalizedQuery) score += 80;
        
        // Starts with query
        if (name.startsWith(normalizedQuery)) score += 50;
        if (model.startsWith(normalizedQuery)) score += 45;
        if (manufacturer.startsWith(normalizedQuery)) score += 40;
        if (code.startsWith(normalizedQuery)) score += 35;
        
        // Contains query
        if (name.includes(normalizedQuery)) score += 20;
        if (model.includes(normalizedQuery)) score += 18;
        if (manufacturer.includes(normalizedQuery)) score += 15;
        if (code.includes(normalizedQuery)) score += 10;
        
        // Bonus for popular aircraft
        if (ac.popular && score > 0) score += 5;
        
        return { aircraft: ac, score };
    });
    
    return scored
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map(item => item.aircraft);
}

/**
 * Gets popular/common aircraft types
 * 
 * @returns Array of popular Aircraft objects
 */
export function getPopularAircraft(): Aircraft[] {
    return aircraft.filter(ac => ac.popular);
}

/**
 * Gets all aircraft grouped by manufacturer
 * 
 * @returns Object with manufacturer as key and aircraft array as value
 */
export function getAircraftByManufacturer(): Record<string, Aircraft[]> {
    return aircraft.reduce((acc, ac) => {
        if (!acc[ac.manufacturer]) {
            acc[ac.manufacturer] = [];
        }
        acc[ac.manufacturer].push(ac);
        return acc;
    }, {} as Record<string, Aircraft[]>);
}

/**
 * Finds an aircraft by its code
 * 
 * @param code - ICAO/IATA aircraft code
 * @returns Aircraft object or undefined
 */
export function getAircraftByCode(code: string): Aircraft | undefined {
    return aircraft.find(ac => ac.code.toLowerCase() === code.toLowerCase());
}

/**
 * Finds an aircraft by its full name
 * 
 * @param name - Full aircraft name
 * @returns Aircraft object or undefined
 */
export function getAircraftByName(name: string): Aircraft | undefined {
    const normalized = name.toLowerCase().trim();
    return aircraft.find(ac => ac.name.toLowerCase() === normalized);
}

