/**
 * useGmailImport Hook - Phase 3
 * 
 * Custom hook for managing Gmail import functionality.
 * Handles connection status, email scanning, and flight import.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import {
    connectGmail,
    disconnectGmail,
    getGmailConnectionStatus,
    getStoredAccessToken,
    type GmailConnectionStatus,
} from '../services/gmailAuthService';
import { isGoogleAuthConfigured, buildGmailSearchQuery, AIRLINE_EMAIL_PATTERNS } from '../config/googleAuth';
import type { Airport } from '../types';
import { AIRPORTS } from '../data/airports';

export interface DetectedFlight {
    id: string;
    origin?: string; // IATA code
    destination?: string; // IATA code
    originAirport?: Airport;
    destinationAirport?: Airport;
    airline?: string;
    flightNumber?: string;
    date?: string;
    pnr?: string; // Booking reference for deduplication
    confidence: 'high' | 'medium' | 'low';
    rawSubject: string;
    rawSnippet: string;
    emailId: string;
    selected: boolean;
    errors: string[];
}

interface GmailImportState {
    connectionStatus: GmailConnectionStatus;
    isLoading: boolean;
    isScanning: boolean;
    isImporting: boolean;
    detectedFlights: DetectedFlight[];
    error: string | null;
    scanProgress: number;
}

/**
 * Searches for an airport by IATA code
 */
function findAirportByIata(iata: string): Airport | undefined {
    return AIRPORTS.find(a => a.iata.toUpperCase() === iata.toUpperCase());
}

/**
 * Common city name to airport code mapping for Indian cities
 */
const CITY_TO_AIRPORT: { [key: string]: string } = {
    // India
    'delhi': 'DEL',
    'new delhi': 'DEL',
    'mumbai': 'BOM',
    'bombay': 'BOM',
    'bangalore': 'BLR',
    'bengaluru': 'BLR',
    'hyderabad': 'HYD',
    'chennai': 'MAA',
    'madras': 'MAA',
    'kolkata': 'CCU',
    'calcutta': 'CCU',
    'pune': 'PNQ',
    'ahmedabad': 'AMD',
    'jaipur': 'JAI',
    'goa': 'GOI',
    'cochin': 'COK',
    'kochi': 'COK',
    'trivandrum': 'TRV',
    'thiruvananthapuram': 'TRV',
    'lucknow': 'LKO',
    'indore': 'IDR',
    'bhopal': 'BHO',
    'nagpur': 'NAG',
    'patna': 'PAT',
    'chandigarh': 'IXC',
    'amritsar': 'ATQ',
    'srinagar': 'SXR',
    'guwahati': 'GAU',
    'varanasi': 'VNS',
    'bhubaneswar': 'BBI',
    'visakhapatnam': 'VTZ',
    'vizag': 'VTZ',
    'coimbatore': 'CJB',
    'mangalore': 'IXE',
    'udaipur': 'UDR',
    'jodhpur': 'JDH',
    'ranchi': 'IXR',
    'raipur': 'RPR',
    'dehradun': 'DED',
    'surat': 'STV',
    'vadodara': 'BDQ',
    'rajkot': 'RAJ',
    'bagdogra': 'IXB',
    'siliguri': 'IXB',
    'darjeeling': 'IXB',
    'port blair': 'IXZ',
    'andaman': 'IXZ',
    'leh': 'IXL',
    'ladakh': 'IXL',
    // International hubs
    'dubai': 'DXB',
    'singapore': 'SIN',
    'bangkok': 'BKK',
    'london': 'LHR',
    'new york': 'JFK',
    'hong kong': 'HKG',
    'kuala lumpur': 'KUL',
    'doha': 'DOH',
    'abu dhabi': 'AUH',
    'sharjah': 'SHJ',
    'muscat': 'MCT',
    'kathmandu': 'KTM',
    'colombo': 'CMB',
    'dhaka': 'DAC',
    'male': 'MLE',
    'maldives': 'MLE',
    'phuket': 'HKT',
    'bali': 'DPS',
    'tokyo': 'NRT',
    'paris': 'CDG',
    'frankfurt': 'FRA',
    'amsterdam': 'AMS',
    'toronto': 'YYZ',
    'sydney': 'SYD',
    'melbourne': 'MEL',
};

/**
 * Finds airport code from city name
 */
function findAirportByCity(cityName: string): string | undefined {
    const normalized = cityName.toLowerCase().trim();
    return CITY_TO_AIRPORT[normalized];
}

/**
 * Words that look like airport codes but aren't (false positives)
 */
const FALSE_POSITIVE_CODES = [
    'PNR', // Passenger Name Record (booking reference)
    'ETD', // Estimated Time of Departure
    'ETA', // Estimated Time of Arrival
    'UTC', // Coordinated Universal Time
    'GMT', // Greenwich Mean Time
    'IST', // Often means Indian Standard Time, not Istanbul
    'PDF', // Document format
    'REF', // Reference
    'VIA', // Through/via
    'THE', // Common word
    'FOR', // Common word
    'AND', // Common word
    'HRS', // Hours
    // Days of week abbreviations
    'SUN', // Sunday (not Hailey, Idaho airport)
    'MON', // Monday
    'TUE', // Tuesday
    'WED', // Wednesday
    'THU', // Thursday
    'FRI', // Friday (not Frisco, Colorado)
    'SAT', // Saturday
    // Month abbreviations that are also airport codes
    'JAN', // January (not Jundiaí airport)
    'FEB', // February
    'MAR', // March (not Mara Lodges airport)
    'APR', // April
    'MAY', // May (not Mandalay airport - but MAY is not a real IATA code)
    'JUN', // June
    'JUL', // July
    'AUG', // August (not Augusta airport)
    'SEP', // September
    'OCT', // October
    'NOV', // November (not Huambo airport in context of dates)
    'DEC', // December
];


/**
 * Common airline codes (2-character IATA codes)
 */
const AIRLINE_CODES = [
    // Indian Airlines
    '6E', 'AI', 'IX', 'SG', 'UK', 'I5', 'G8', 'QP',
    // US Airlines
    'AA', 'UA', 'DL', 'WN', 'B6', 'AS', 'NK', 'F9', 'HA',
    // European Airlines
    'BA', 'LH', 'AF', 'KL', 'IB', 'AZ', 'SK', 'AY', 'TP', 'SN',
    'FR', 'U2', 'W6', 'VY', 'DY', 'EW',
    // Middle East Airlines
    'EK', 'QR', 'EY', 'GF', 'WY', 'SV', 'MS',
    // Asian Airlines
    'SQ', 'CX', 'NH', 'JL', 'OZ', 'KE', 'TG', 'MH', 'GA', 'PR', 'VN', 'CI', 'BR',
    // Oceania Airlines
    'QF', 'NZ', 'VA', 'JQ', 'FJ',
    // Other major airlines
    'AC', 'WS', 'AM', 'AV', 'LA', 'CM', 'G3', 'AD',
    'TK', 'LO', 'OS', 'LX', 'EI', 'A3',
    'ET', 'KQ', 'SA', 'RW',
];

/**
 * Extracts flight number from text
 */
function extractFlightNumber(text: string): string | undefined {
    // Priority 1: Look for "Flight Number: Vistara UK 871" or "Flight Number: UK 871"
    const flightNumPatterns = [
        // "Flight Number: Vistara UK 871" or "Flight Number: UK 871"
        /Flight\s+Number[:\s]+(?:Vistara\s+)?([A-Z]{2})\s*(\d{1,4})\b/i,
        // "Flight Number: 6E 377"
        /Flight\s+Number[:\s]+([A-Z0-9]{2})\s*(\d{1,4})\b/i,
    ];
    
    for (const pattern of flightNumPatterns) {
        const match = text.match(pattern);
        if (match) {
            return `${match[1].toUpperCase()} ${match[2]}`;
        }
    }
    
    // Priority 2: Try to find flight numbers with known airline codes (most reliable)
    for (const code of AIRLINE_CODES) {
        // Pattern: "IX 2890" or "IX2890" but not followed by year-like numbers
        const pattern = new RegExp(`\\b${code}\\s*(\\d{1,4})\\b(?!\\s*(?:hrs|hr|,|\\d{4}))`, 'i');
        const match = text.match(pattern);
        if (match) {
            const num = parseInt(match[1]);
            // Skip if it looks like a year
            if (num >= 2020 && num <= 2030) continue;
            return `${code} ${match[1]}`.toUpperCase();
        }
    }
    
    // Priority 3: Common flight number patterns
    const patterns = [
        // "flight 6E 377" or "flight 6E377"
        /flight\s+([A-Z]{2})\s*(\d{1,4})\b/i,
        // "Flight #XX123" or "Flight XX123"
        /Flight\s*#?\s*([A-Z]{2})\s*(\d{1,4})\b/i,
        // Standalone pattern with letter-only airline code (not numbers to avoid date confusion)
        /\b([A-Z]{2})\s+(\d{2,4})\b(?!\s*hrs|\s*hr|\s*,|\s*\d{4})/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[2]) {
            const numPart = parseInt(match[2]);
            // Reject if it looks like a year (2020-2030)
            if (numPart >= 2020 && numPart <= 2030) {
                continue;
            }
            return `${match[1].toUpperCase()} ${match[2]}`;
        }
    }
    return undefined;
}

/**
 * Month name to number mapping
 */
const MONTH_MAP: { [key: string]: number } = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
};

/**
 * Extracts date from email content
 */
function extractDate(text: string): string | undefined {
    const currentYear = new Date().getFullYear();
    
    // Common date patterns - ordered by specificity
    const patterns: Array<{ regex: RegExp; parser: (match: RegExpMatchArray) => Date | null }> = [
        // "5Apr" or "5 Apr" or "5-Apr" (short format common in Indian airlines)
        {
            regex: /\b(\d{1,2})[-\s]?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i,
            parser: (match) => {
                const day = parseInt(match[1], 10);
                const month = MONTH_MAP[match[2].toLowerCase()];
                if (month !== undefined && day >= 1 && day <= 31) {
                    return new Date(currentYear, month, day);
                }
                return null;
            }
        },
        // "Apr 5" or "Apr5" or "April 5"
        {
            regex: /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*(\d{1,2})(?:st|nd|rd|th)?\b/i,
            parser: (match) => {
                const month = MONTH_MAP[match[1].toLowerCase().substring(0, 3)];
                const day = parseInt(match[2], 10);
                if (month !== undefined && day >= 1 && day <= 31) {
                    return new Date(currentYear, month, day);
                }
                return null;
            }
        },
        // January 15, 2024 or Jan 15, 2024
        {
            regex: /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/i,
            parser: (match) => {
                const month = MONTH_MAP[match[1].toLowerCase().substring(0, 3)];
                const day = parseInt(match[2], 10);
                const year = parseInt(match[3], 10);
                if (month !== undefined) {
                    return new Date(year, month, day);
                }
                return null;
            }
        },
        // 15 January 2024 or 15 Jan 2024
        {
            regex: /\b(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?),?\s+(\d{4})\b/i,
            parser: (match) => {
                const day = parseInt(match[1], 10);
                const month = MONTH_MAP[match[2].toLowerCase().substring(0, 3)];
                const year = parseInt(match[3], 10);
                if (month !== undefined) {
                    return new Date(year, month, day);
                }
                return null;
            }
        },
        // 2024-01-15 or 2024/01/15
        {
            regex: /\b(\d{4})[-/](\d{2})[-/](\d{2})\b/,
            parser: (match) => {
                const year = parseInt(match[1], 10);
                const month = parseInt(match[2], 10) - 1;
                const day = parseInt(match[3], 10);
                return new Date(year, month, day);
            }
        },
        // 15/01/2024 (DD/MM/YYYY - common in India/UK)
        {
            regex: /\b(\d{2})\/(\d{2})\/(\d{4})\b/,
            parser: (match) => {
                const day = parseInt(match[1], 10);
                const month = parseInt(match[2], 10) - 1;
                const year = parseInt(match[3], 10);
                return new Date(year, month, day);
            }
        },
    ];

    for (const { regex, parser } of patterns) {
        const match = text.match(regex);
        if (match) {
            try {
                const date = parser(match);
                if (date && !isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            } catch {
                continue;
            }
        }
    }
    return undefined;
}

/**
 * Additional airline name patterns for text matching
 */
const AIRLINE_TEXT_PATTERNS: { pattern: RegExp; name: string }[] = [
    // Match specific phrases first (more specific = higher priority)
    { pattern: /air india express/i, name: 'Air India Express' },
    { pattern: /\bix\s*\d{1,4}\b/i, name: 'Air India Express' }, // IX is Air India Express code
    { pattern: /air india/i, name: 'Air India' },
    { pattern: /indigo|6e\s*\d{1,4}/i, name: 'IndiGo' },
    { pattern: /spicejet/i, name: 'SpiceJet' },
    { pattern: /vistara/i, name: 'Vistara' },
    { pattern: /akasa/i, name: 'Akasa Air' },
    { pattern: /go first|go air/i, name: 'Go First' },
];

/**
 * Extracts airline name from sender or content
 */
function extractAirline(from: string, subject: string, snippet: string): string | undefined {
    const text = `${from} ${subject} ${snippet}`;
    const textLower = text.toLowerCase();
    
    // First, check text patterns (more reliable for inline mentions like "Air India Express")
    for (const { pattern, name } of AIRLINE_TEXT_PATTERNS) {
        if (pattern.test(text)) {
            return name;
        }
    }
    
    // Then check domain-based patterns
    for (const [, airline] of Object.entries(AIRLINE_EMAIL_PATTERNS)) {
        for (const domain of airline.domains) {
            if (textLower.includes(domain.toLowerCase())) {
                return airline.name;
            }
        }
        if (textLower.includes(airline.name.toLowerCase())) {
            return airline.name;
        }
    }
    
    return undefined;
}

/**
 * Extracts PNR (Passenger Name Record) / Booking Reference from text
 */
function extractPNR(text: string): string | undefined {
    // Common PNR patterns - ordered by specificity
    const patterns = [
        // "Booking reservation number: NWFFT4" (Vistara format)
        /Booking\s+reservation\s+number[:\s]+[‎\s]*([A-Z0-9]{5,8})\b/i,
        // "PNR: OZJW4Y" or "PNR-OZJW4Y" or "PNR OZJW4Y"
        /PNR[:\s-]+([A-Z0-9]{5,8})\b/i,
        // "Booking Reference: ABC123" or "Booking Code: ABC123"
        /Booking\s+(?:Reference|Code|Number)[:\s]+([A-Z0-9]{5,8})\b/i,
        // "Confirmation Number: ABC123" or "Confirmation: ABC123"
        /Confirmation(?:\s+Number)?[:\s]+([A-Z0-9]{5,8})\b/i,
        // "Reference: ABC123" or "Ref: ABC123"
        /Ref(?:erence)?[:\s]+([A-Z0-9]{5,8})\b/i,
        // "Conf#: ABC123" or "Conf #ABC123"
        /Conf(?:irmation)?\s*#?\s*[:\s]*([A-Z0-9]{5,8})\b/i,
        // "reservation number ABC123" or "reservation #ABC123"
        /reservation\s+(?:number\s*)?#?\s*([A-Z0-9]{5,8})\b/i,
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            // PNRs are typically 6 alphanumeric characters
            const pnr = match[1].toUpperCase();
            // Validate: typically has both letters and numbers, or is exactly 6 chars
            if ((/[A-Z]/.test(pnr) && /\d/.test(pnr)) || pnr.length === 6) {
                return pnr;
            }
            // Also accept all-letter PNRs of length 6 (common in some airlines)
            if (/^[A-Z]{6}$/.test(pnr)) {
                return pnr;
            }
        }
    }
    return undefined;
}

// ============================================================================
// AIRLINE-SPECIFIC PARSERS
// ============================================================================

interface ParsedFlightData {
    origin?: string;
    destination?: string;
    flightNumber?: string;
    date?: string;
    pnr?: string;
    airline: string;
}

/**
 * Vistara (UK) Email Parser
 * Format: "Delhi to Hyderabad", "Flight Number: Vistara UK 871", "Booking reservation number: NWFFT4"
 */
function parseVistaraEmail(text: string): ParsedFlightData | null {
    const result: ParsedFlightData = { airline: 'Vistara' };
    
    // PNR: "Booking reservation number: NWFFT4"
    const pnrMatch = text.match(/Booking\s+reservation\s+number[:\s]+[‎\s]*([A-Z0-9]{5,8})\b/i);
    if (pnrMatch) result.pnr = pnrMatch[1].toUpperCase();
    
    // Route: "Delhi to Hyderabad" or city names in Departure/Arrival
    const routeMatch = text.match(/\b(\w+(?:\s+\w+)?)\s+to\s+(\w+(?:\s+\w+)?)\b/i);
    if (routeMatch) {
        const originCode = findAirportByCity(routeMatch[1]);
        const destCode = findAirportByCity(routeMatch[2]);
        if (originCode) result.origin = originCode;
        if (destCode) result.destination = destCode;
    }
    
    // Also try Departure/Arrival pattern
    if (!result.origin || !result.destination) {
        const depMatch = text.match(/Departure[:\s]+[\d:]+\s+([A-Za-z\s]+?)(?:,|\s+-)/i);
        const arrMatch = text.match(/Arrival[:\s]+[\d:]+\s+([A-Za-z\s]+?)(?:,|\s+-)/i);
        if (depMatch) {
            const code = findAirportByCity(depMatch[1].trim());
            if (code) result.origin = code;
        }
        if (arrMatch) {
            const code = findAirportByCity(arrMatch[1].trim());
            if (code) result.destination = code;
        }
    }
    
    // Flight Number: "Flight Number: Vistara UK 871" or "UK 871"
    const flightMatch = text.match(/(?:Flight\s+Number[:\s]+)?(?:Vistara\s+)?(UK)\s*(\d{1,4})\b/i);
    if (flightMatch) result.flightNumber = `UK ${flightMatch[2]}`;
    
    // Date: "Sun, 28 Apr 2024" or "28 Apr 2024"
    const dateMatch = text.match(/(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)[,\s]+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = MONTH_MAP[dateMatch[2].toLowerCase()];
        const year = parseInt(dateMatch[3]);
        if (month !== undefined) {
            result.date = new Date(year, month, day).toISOString().split('T')[0];
        }
    }
    
    return result;
}

/**
 * IndiGo (6E) Email Parser
 * Format: "HYD-IDR 0550-0715 hrs", "6E 377", "PNR-KZ7YMS"
 */
function parseIndigoEmail(text: string): ParsedFlightData | null {
    const result: ParsedFlightData = { airline: 'IndiGo' };
    
    // PNR: "PNR-KZ7YMS" or "PNR: KZ7YMS"
    const pnrMatch = text.match(/PNR[:\s-]+([A-Z0-9]{5,8})\b/i);
    if (pnrMatch) result.pnr = pnrMatch[1].toUpperCase();
    
    // Route: "HYD-IDR" pattern (airport codes with hyphen)
    const routeMatch = text.match(/\b([A-Z]{3})\s*[-–]\s*([A-Z]{3})\b/);
    if (routeMatch) {
        const originAirport = findAirportByIata(routeMatch[1]);
        const destAirport = findAirportByIata(routeMatch[2]);
        if (originAirport && !FALSE_POSITIVE_CODES.includes(routeMatch[1])) {
            result.origin = routeMatch[1];
        }
        if (destAirport && !FALSE_POSITIVE_CODES.includes(routeMatch[2])) {
            result.destination = routeMatch[2];
        }
    }
    
    // Flight Number: "6E 377" or "flight 6E 377"
    const flightMatch = text.match(/\b(6E)\s*(\d{1,4})\b/i);
    if (flightMatch) result.flightNumber = `6E ${flightMatch[2]}`;
    
    // Date: "5Apr" or "on 5Apr" or "5 Apr 2024"
    const dateMatch = text.match(/\b(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+(\d{4}))?\b/i);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = MONTH_MAP[dateMatch[2].toLowerCase()];
        const year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();
        if (month !== undefined) {
            result.date = new Date(year, month, day).toISOString().split('T')[0];
        }
    }
    
    return result;
}

/**
 * Air India Express (IX) Email Parser
 * Format: "IX 2890 Nov 23 2025", "PNR: OZJW4Y", "Air India Express"
 */
function parseAirIndiaExpressEmail(text: string): ParsedFlightData | null {
    const result: ParsedFlightData = { airline: 'Air India Express' };
    
    // PNR: "PNR: OZJW4Y"
    const pnrMatch = text.match(/PNR[:\s]+([A-Z0-9]{5,8})\b/i);
    if (pnrMatch) result.pnr = pnrMatch[1].toUpperCase();
    
    // Flight Number: "IX 2890"
    const flightMatch = text.match(/\b(IX)\s*(\d{1,4})\b/i);
    if (flightMatch) result.flightNumber = `IX ${flightMatch[2]}`;
    
    // Route: Try to find airport codes or city names
    const routeCodeMatch = text.match(/\b([A-Z]{3})\s*(?:to|-|–)\s*([A-Z]{3})\b/);
    if (routeCodeMatch) {
        if (findAirportByIata(routeCodeMatch[1]) && !FALSE_POSITIVE_CODES.includes(routeCodeMatch[1])) {
            result.origin = routeCodeMatch[1];
        }
        if (findAirportByIata(routeCodeMatch[2]) && !FALSE_POSITIVE_CODES.includes(routeCodeMatch[2])) {
            result.destination = routeCodeMatch[2];
        }
    }
    
    // Date: "Nov 23 2025" or "23 Nov 2025"
    const dateMatch1 = text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4})/i);
    const dateMatch2 = text.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
    
    if (dateMatch1) {
        const month = MONTH_MAP[dateMatch1[1].toLowerCase()];
        const day = parseInt(dateMatch1[2]);
        const year = parseInt(dateMatch1[3]);
        if (month !== undefined) {
            result.date = new Date(year, month, day).toISOString().split('T')[0];
        }
    } else if (dateMatch2) {
        const day = parseInt(dateMatch2[1]);
        const month = MONTH_MAP[dateMatch2[2].toLowerCase()];
        const year = parseInt(dateMatch2[3]);
        if (month !== undefined) {
            result.date = new Date(year, month, day).toISOString().split('T')[0];
        }
    }
    
    return result;
}

/**
 * Air India (AI) Email Parser
 */
function parseAirIndiaEmail(text: string): ParsedFlightData | null {
    const result: ParsedFlightData = { airline: 'Air India' };
    
    // PNR
    const pnrMatch = text.match(/(?:PNR|Booking\s+Reference)[:\s]+([A-Z0-9]{5,8})\b/i);
    if (pnrMatch) result.pnr = pnrMatch[1].toUpperCase();
    
    // Flight Number: "AI 123"
    const flightMatch = text.match(/\b(AI)\s*(\d{1,4})\b/i);
    if (flightMatch) result.flightNumber = `AI ${flightMatch[2]}`;
    
    // Route
    const routeMatch = text.match(/\b([A-Z]{3})\s*(?:to|-|–|→)\s*([A-Z]{3})\b/);
    if (routeMatch) {
        if (findAirportByIata(routeMatch[1])) result.origin = routeMatch[1];
        if (findAirportByIata(routeMatch[2])) result.destination = routeMatch[2];
    }
    
    // Date
    result.date = extractDate(text);
    
    return result;
}

/**
 * SpiceJet (SG) Email Parser
 */
function parseSpiceJetEmail(text: string): ParsedFlightData | null {
    const result: ParsedFlightData = { airline: 'SpiceJet' };
    
    // PNR
    const pnrMatch = text.match(/(?:PNR|Booking\s+Reference|Confirmation)[:\s]+([A-Z0-9]{5,8})\b/i);
    if (pnrMatch) result.pnr = pnrMatch[1].toUpperCase();
    
    // Flight Number: "SG 123"
    const flightMatch = text.match(/\b(SG)\s*(\d{1,4})\b/i);
    if (flightMatch) result.flightNumber = `SG ${flightMatch[2]}`;
    
    // Route
    const routeMatch = text.match(/\b([A-Z]{3})\s*(?:to|-|–|→)\s*([A-Z]{3})\b/);
    if (routeMatch) {
        if (findAirportByIata(routeMatch[1])) result.origin = routeMatch[1];
        if (findAirportByIata(routeMatch[2])) result.destination = routeMatch[2];
    }
    
    // Date
    result.date = extractDate(text);
    
    return result;
}

/**
 * Akasa Air (QP) Email Parser
 */
function parseAkasaAirEmail(text: string): ParsedFlightData | null {
    const result: ParsedFlightData = { airline: 'Akasa Air' };
    
    // PNR
    const pnrMatch = text.match(/(?:PNR|Booking\s+Reference|Confirmation)[:\s]+([A-Z0-9]{5,8})\b/i);
    if (pnrMatch) result.pnr = pnrMatch[1].toUpperCase();
    
    // Flight Number: "QP 123"
    const flightMatch = text.match(/\b(QP)\s*(\d{1,4})\b/i);
    if (flightMatch) result.flightNumber = `QP ${flightMatch[2]}`;
    
    // Route
    const routeMatch = text.match(/\b([A-Z]{3})\s*(?:to|-|–|→)\s*([A-Z]{3})\b/);
    if (routeMatch) {
        if (findAirportByIata(routeMatch[1])) result.origin = routeMatch[1];
        if (findAirportByIata(routeMatch[2])) result.destination = routeMatch[2];
    }
    
    // Date
    result.date = extractDate(text);
    
    return result;
}

/**
 * Generic/International Airline Parser (fallback)
 */
function parseGenericEmail(text: string, detectedAirline?: string): ParsedFlightData | null {
    const result: ParsedFlightData = { airline: detectedAirline || 'Unknown' };
    
    // PNR - try multiple patterns
    result.pnr = extractPNR(text);
    
    // Route - try IATA codes
    const routeMatch = text.match(/\b([A-Z]{3})\s*(?:to|-|–|→)\s*([A-Z]{3})\b/);
    if (routeMatch) {
        if (findAirportByIata(routeMatch[1]) && !FALSE_POSITIVE_CODES.includes(routeMatch[1])) {
            result.origin = routeMatch[1];
        }
        if (findAirportByIata(routeMatch[2]) && !FALSE_POSITIVE_CODES.includes(routeMatch[2])) {
            result.destination = routeMatch[2];
        }
    }
    
    // Try city names if IATA codes not found
    if (!result.origin || !result.destination) {
        const cityRouteMatch = text.match(/\b(\w+(?:\s+\w+)?)\s+to\s+(\w+(?:\s+\w+)?)\b/i);
        if (cityRouteMatch) {
            const originCode = findAirportByCity(cityRouteMatch[1]);
            const destCode = findAirportByCity(cityRouteMatch[2]);
            if (originCode && !result.origin) result.origin = originCode;
            if (destCode && !result.destination) result.destination = destCode;
        }
    }
    
    // Flight number - try known airline codes
    result.flightNumber = extractFlightNumber(text);
    
    // Date
    result.date = extractDate(text);
    
    return result;
}

/**
 * Detects airline from email and returns appropriate parser result
 */
function detectAndParseEmail(email: { from: string; subject: string; snippet: string }): ParsedFlightData | null {
    const text = `${email.from} ${email.subject} ${email.snippet}`;
    const textLower = text.toLowerCase();
    
    // Detect airline and use specific parser
    if (textLower.includes('vistara') || textLower.includes('airvistara') || /\buk\s*\d{3,4}\b/i.test(text)) {
        return parseVistaraEmail(text);
    }
    
    if (textLower.includes('indigo') || textLower.includes('goindigo') || textLower.includes('6e.in') || /\b6e\s*\d{3,4}\b/i.test(text)) {
        return parseIndigoEmail(text);
    }
    
    if (textLower.includes('air india express') || /\bix\s*\d{3,4}\b/i.test(text)) {
        return parseAirIndiaExpressEmail(text);
    }
    
    if ((textLower.includes('air india') && !textLower.includes('express')) || /\bai\s*\d{3,4}\b/i.test(text)) {
        return parseAirIndiaEmail(text);
    }
    
    if (textLower.includes('spicejet') || /\bsg\s*\d{3,4}\b/i.test(text)) {
        return parseSpiceJetEmail(text);
    }
    
    if (textLower.includes('akasa') || /\bqp\s*\d{3,4}\b/i.test(text)) {
        return parseAkasaAirEmail(text);
    }
    
    // Fallback to generic parser
    const detectedAirline = extractAirline(email.from, email.subject, email.snippet);
    return parseGenericEmail(text, detectedAirline);
}

// ============================================================================
// MAIN PARSING FUNCTION
// ============================================================================

/**
 * Parses email data to extract flight information using airline-specific parsers
 */
function parseEmailToFlight(email: { id: string; from: string; subject: string; snippet: string; date: string }): DetectedFlight {
    const errors: string[] = [];
    
    // Use airline-specific parser
    const parsed = detectAndParseEmail(email);
    
    let origin: string | undefined;
    let destination: string | undefined;
    let airline: string | undefined;
    let flightNumber: string | undefined;
    let flightDate: string | undefined;
    let pnr: string | undefined;
    
    if (parsed) {
        origin = parsed.origin;
        destination = parsed.destination;
        airline = parsed.airline;
        flightNumber = parsed.flightNumber;
        flightDate = parsed.date;
        pnr = parsed.pnr;
    }
    
    // Validation and error collection
    if (!origin) errors.push('Origin airport not detected');
    if (!destination) errors.push('Destination airport not detected');
    if (!airline || airline === 'Unknown') errors.push('Airline not detected');
    if (!flightDate) errors.push('Date not detected');
    
    // Calculate confidence
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (origin && destination && airline && flightDate) {
        confidence = 'high';
    } else if ((origin || destination) && (airline || flightDate)) {
        confidence = 'medium';
    }
    
    return {
        id: email.id,
        origin,
        destination,
        originAirport: origin ? findAirportByIata(origin) : undefined,
        destinationAirport: destination ? findAirportByIata(destination) : undefined,
        airline,
        flightNumber,
        date: flightDate,
        pnr,
        confidence,
        rawSubject: email.subject,
        rawSnippet: email.snippet,
        emailId: email.id,
        selected: confidence === 'high',
        errors,
    };
}

/**
 * Fetches emails from Gmail API
 */
async function fetchGmailEmails(accessToken: string, maxResults: number = 50): Promise<DetectedFlight[]> {
    const query = buildGmailSearchQuery();
    
    // Search for emails
    const searchResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    );

    if (!searchResponse.ok) {
        throw new Error('Failed to search Gmail');
    }

    const searchData = await searchResponse.json();
    const messages = searchData.messages || [];

    // Fetch details for each message
    const detectedFlights: DetectedFlight[] = [];

    for (const message of messages) {
        try {
            const detailResponse = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            if (!detailResponse.ok) continue;

            const detailData = await detailResponse.json();
            const headers = detailData.payload?.headers || [];
            
            const getHeader = (name: string) => 
                headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

            const emailData = {
                id: message.id,
                from: getHeader('From'),
                subject: getHeader('Subject'),
                snippet: detailData.snippet || '',
                date: getHeader('Date'),
            };

            const flight = parseEmailToFlight(emailData);
            detectedFlights.push(flight);
        } catch (error) {
            console.error('Error fetching email details:', error);
        }
    }

    // Deduplicate by PNR - keep only the first occurrence of each PNR
    const seenPNRs = new Set<string>();
    const uniqueFlights = detectedFlights.filter(flight => {
        if (flight.pnr) {
            if (seenPNRs.has(flight.pnr)) {
                console.log(`Skipping duplicate flight with PNR: ${flight.pnr}`);
                return false;
            }
            seenPNRs.add(flight.pnr);
        }
        return true;
    });

    return uniqueFlights;
}

/**
 * Custom hook for Gmail import functionality
 */
export function useGmailImport() {
    const { user } = useAuthStore();
    const [state, setState] = useState<GmailImportState>({
        connectionStatus: { isConnected: false },
        isLoading: true,
        isScanning: false,
        isImporting: false,
        detectedFlights: [],
        error: null,
        scanProgress: 0,
    });

    // Check connection status on mount and user change
    useEffect(() => {
        async function checkConnection() {
            if (!user) {
                setState(prev => ({ ...prev, isLoading: false }));
                return;
            }

            setState(prev => ({ ...prev, isLoading: true }));
            
            try {
                const status = await getGmailConnectionStatus(user.id);
                setState(prev => ({ 
                    ...prev, 
                    connectionStatus: status, 
                    isLoading: false 
                }));
            } catch {
                setState(prev => ({ 
                    ...prev, 
                    isLoading: false,
                    error: 'Failed to check Gmail connection status'
                }));
            }
        }

        checkConnection();
    }, [user]);

    // Connect Gmail account
    const connect = useCallback(async () => {
        if (!user) {
            setState(prev => ({ ...prev, error: 'Please log in first' }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const result = await connectGmail(user.id);

        if (result.success) {
            const status = await getGmailConnectionStatus(user.id);
            setState(prev => ({ 
                ...prev, 
                connectionStatus: status, 
                isLoading: false 
            }));
        } else {
            setState(prev => ({ 
                ...prev, 
                isLoading: false, 
                error: result.error || 'Failed to connect Gmail' 
            }));
        }
    }, [user]);

    // Disconnect Gmail account
    const disconnect = useCallback(async () => {
        if (!user) return;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const result = await disconnectGmail(user.id);

        if (result.success) {
            setState(prev => ({ 
                ...prev, 
                connectionStatus: { isConnected: false }, 
                detectedFlights: [],
                isLoading: false 
            }));
        } else {
            setState(prev => ({ 
                ...prev, 
                isLoading: false, 
                error: result.error || 'Failed to disconnect Gmail' 
            }));
        }
    }, [user]);

    // Scan emails for flights
    const scanEmails = useCallback(async () => {
        if (!user) return;

        setState(prev => ({ ...prev, isScanning: true, error: null, scanProgress: 0 }));

        try {
            const accessToken = await getStoredAccessToken(user.id);
            
            if (!accessToken) {
                setState(prev => ({ 
                    ...prev, 
                    isScanning: false, 
                    error: 'Gmail access expired. Please reconnect your account.' 
                }));
                return;
            }

            setState(prev => ({ ...prev, scanProgress: 20 }));

            const flights = await fetchGmailEmails(accessToken);

            setState(prev => ({ 
                ...prev, 
                isScanning: false, 
                detectedFlights: flights,
                scanProgress: 100 
            }));
        } catch (error) {
            console.error('Error scanning emails:', error);
            setState(prev => ({ 
                ...prev, 
                isScanning: false, 
                error: error instanceof Error ? error.message : 'Failed to scan emails' 
            }));
        }
    }, [user]);

    // Toggle flight selection
    const toggleFlightSelection = useCallback((flightId: string) => {
        setState(prev => ({
            ...prev,
            detectedFlights: prev.detectedFlights.map(f =>
                f.id === flightId ? { ...f, selected: !f.selected } : f
            ),
        }));
    }, []);

    // Select all flights
    const selectAllFlights = useCallback(() => {
        setState(prev => ({
            ...prev,
            detectedFlights: prev.detectedFlights.map(f => ({ ...f, selected: true })),
        }));
    }, []);

    // Deselect all flights
    const deselectAllFlights = useCallback(() => {
        setState(prev => ({
            ...prev,
            detectedFlights: prev.detectedFlights.map(f => ({ ...f, selected: false })),
        }));
    }, []);

    // Update a detected flight
    const updateDetectedFlight = useCallback((flightId: string, updates: Partial<DetectedFlight>) => {
        setState(prev => ({
            ...prev,
            detectedFlights: prev.detectedFlights.map(f =>
                f.id === flightId ? { ...f, ...updates } : f
            ),
        }));
    }, []);

    // Clear detected flights
    const clearDetectedFlights = useCallback(() => {
        setState(prev => ({ ...prev, detectedFlights: [], scanProgress: 0 }));
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        isConfigured: isGoogleAuthConfigured(),
        connect,
        disconnect,
        scanEmails,
        toggleFlightSelection,
        selectAllFlights,
        deselectAllFlights,
        updateDetectedFlight,
        clearDetectedFlights,
        clearError,
    };
}

export default useGmailImport;

