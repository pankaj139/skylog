/**
 * CSV Parser Utility - Phase 2: CSV Import
 * 
 * Parses CSV files and validates flight data for bulk import.
 * 
 * Usage:
 *   import { parseCSV, validateFlightRow, mapCSVToFlights } from './csvParser';
 *   
 *   const { headers, rows } = parseCSV(csvContent);
 *   const validatedRows = rows.map(row => validateFlightRow(row, airports));
 */

import type { Airport, CSVFlightRow } from '../types';

/**
 * Column mapping options for CSV headers
 */
export const COLUMN_MAPPINGS = {
    originIata: ['origin', 'from', 'departure', 'origin_iata', 'dep', 'from_airport'],
    destinationIata: ['destination', 'to', 'arrival', 'destination_iata', 'arr', 'to_airport'],
    airline: ['airline', 'carrier', 'airline_name'],
    flightNumber: ['flight', 'flight_number', 'flight_no', 'flightno'],
    date: ['date', 'departure_date', 'flight_date', 'travel_date'],
    aircraftType: ['aircraft', 'aircraft_type', 'plane', 'equipment'],
    seatNumber: ['seat', 'seat_number', 'seat_no'],
    seatClass: ['class', 'cabin', 'seat_class', 'cabin_class'],
    notes: ['notes', 'comments', 'memo'],
};

/**
 * Parses a CSV string into headers and rows
 * 
 * @param csvContent - Raw CSV string content
 * @returns Object with headers array and rows (as objects)
 */
export function parseCSV(csvContent: string): {
    headers: string[];
    rows: Record<string, string>[];
} {
    const lines = csvContent
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
    }

    // Parse header row
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

    // Parse data rows
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
        });

        rows.push(row);
    }

    return { headers, rows };
}

/**
 * Parses a single CSV line, handling quoted values
 * 
 * @param line - Single CSV line
 * @returns Array of values
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip the next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current); // Add the last field
    return result;
}

/**
 * Attempts to automatically detect column mappings
 * 
 * @param headers - CSV headers
 * @returns Mapping of field names to header indices
 */
export function detectColumnMapping(headers: string[]): Record<string, number | null> {
    const mapping: Record<string, number | null> = {
        originIata: null,
        destinationIata: null,
        airline: null,
        flightNumber: null,
        date: null,
        aircraftType: null,
        seatNumber: null,
        seatClass: null,
        notes: null,
    };

    headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().replace(/[_\s-]/g, '');

        for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
            if (mapping[field] === null) {
                for (const alias of aliases) {
                    if (normalizedHeader === alias.replace(/[_\s-]/g, '') ||
                        normalizedHeader.includes(alias.replace(/[_\s-]/g, ''))) {
                        mapping[field] = index;
                        break;
                    }
                }
            }
        }
    });

    return mapping;
}

/**
 * Validates a single flight row
 * 
 * @param row - CSV row as object
 * @param mapping - Column mapping
 * @param airports - Map of IATA codes to airports
 * @returns Validation result
 */
export function validateFlightRow(
    row: Record<string, string>,
    mapping: Record<string, string>,
    airports: Map<string, Airport>
): { valid: boolean; errors: string[]; data?: CSVFlightRow } {
    const errors: string[] = [];

    // Get values using mapping
    const getValue = (field: string) => row[mapping[field]] || '';

    const originIata = getValue('originIata').toUpperCase();
    const destinationIata = getValue('destinationIata').toUpperCase();
    const airline = getValue('airline');
    const date = getValue('date');

    // Required field validation
    if (!originIata) {
        errors.push('Missing origin airport');
    } else if (!airports.has(originIata)) {
        errors.push(`Unknown origin airport: ${originIata}`);
    }

    if (!destinationIata) {
        errors.push('Missing destination airport');
    } else if (!airports.has(destinationIata)) {
        errors.push(`Unknown destination airport: ${destinationIata}`);
    }

    if (originIata === destinationIata && originIata) {
        errors.push('Origin and destination cannot be the same');
    }

    if (!airline) {
        errors.push('Missing airline');
    }

    if (!date) {
        errors.push('Missing date');
    } else if (!isValidDate(date)) {
        errors.push(`Invalid date format: ${date}`);
    }

    // Validate seat class if provided
    const seatClass = getValue('seatClass');
    const validClasses = ['economy', 'premium economy', 'business', 'first', ''];
    if (seatClass && !validClasses.includes(seatClass.toLowerCase())) {
        errors.push(`Invalid seat class: ${seatClass}`);
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return {
        valid: true,
        errors: [],
        data: {
            originIata,
            destinationIata,
            airline,
            flightNumber: getValue('flightNumber') || undefined,
            date,
            aircraftType: getValue('aircraftType') || undefined,
            seatNumber: getValue('seatNumber') || undefined,
            seatClass: normalizeSeatsClass(getValue('seatClass')) || undefined,
            notes: getValue('notes') || undefined,
        },
    };
}

/**
 * Checks if a date string is valid
 */
function isValidDate(dateStr: string): boolean {
    // Try various date formats
    const formats = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
        /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
    ];

    if (!formats.some(f => f.test(dateStr))) {
        return false;
    }

    const parsed = new Date(dateStr);
    return !isNaN(parsed.getTime());
}

/**
 * Normalizes seat class to match our enum
 */
function normalizeSeatsClass(seatClass: string): string | undefined {
    if (!seatClass) return undefined;

    const normalized = seatClass.toLowerCase().trim();
    const mapping: Record<string, string> = {
        'economy': 'Economy',
        'eco': 'Economy',
        'y': 'Economy',
        'premium economy': 'Premium Economy',
        'premium eco': 'Premium Economy',
        'premium': 'Premium Economy',
        'w': 'Premium Economy',
        'business': 'Business',
        'biz': 'Business',
        'j': 'Business',
        'c': 'Business',
        'first': 'First',
        'f': 'First',
    };

    return mapping[normalized] || undefined;
}

/**
 * Parses a date string and returns a Date object
 */
export function parseDate(dateStr: string): Date {
    // Handle various formats
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [month, day, year] = dateStr.split('/');
        return new Date(`${year}-${month}-${day}`);
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('-');
        return new Date(`${year}-${month}-${day}`);
    }
    return new Date(dateStr);
}

/**
 * Generates a sample CSV template
 */
export function generateSampleCSV(): string {
    return `origin,destination,airline,flight_number,date,aircraft,seat,class,notes
JFK,LHR,British Airways,BA178,2024-06-15,Boeing 777,12A,Economy,Great flight!
LHR,CDG,Air France,AF1234,2024-06-20,Airbus A320,4C,Business,
CDG,JFK,Delta,DL456,2024-06-25,Boeing 787,24F,Economy,Return flight`;
}

