const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = '/Users/pankaj.khandelwal/Downloads/airports.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.split('\n');
const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));

// Find column indices
const typeIdx = headers.indexOf('type');
const nameIdx = headers.indexOf('name');
const latIdx = headers.indexOf('latitude_deg');
const lngIdx = headers.indexOf('longitude_deg');
const countryIdx = headers.indexOf('iso_country');
const cityIdx = headers.indexOf('municipality');
const iataIdx = headers.indexOf('iata_code');

console.log('Column indices:', { typeIdx, nameIdx, latIdx, lngIdx, countryIdx, cityIdx, iataIdx });

// Country code to name mapping
const countryNames = {
    'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
    'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
    'JP': 'Japan', 'CN': 'China', 'IN': 'India', 'KR': 'South Korea', 'SG': 'Singapore',
    'HK': 'Hong Kong', 'TH': 'Thailand', 'MY': 'Malaysia', 'ID': 'Indonesia', 'PH': 'Philippines',
    'AE': 'United Arab Emirates', 'SA': 'Saudi Arabia', 'QA': 'Qatar', 'TR': 'Turkey',
    'BR': 'Brazil', 'MX': 'Mexico', 'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colombia',
    'ZA': 'South Africa', 'EG': 'Egypt', 'NG': 'Nigeria', 'KE': 'Kenya', 'MA': 'Morocco',
    'NZ': 'New Zealand', 'RU': 'Russia', 'CH': 'Switzerland', 'AT': 'Austria', 'BE': 'Belgium',
    'PT': 'Portugal', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland',
    'IE': 'Ireland', 'PL': 'Poland', 'CZ': 'Czech Republic', 'GR': 'Greece', 'IL': 'Israel',
    'TW': 'Taiwan', 'VN': 'Vietnam', 'PK': 'Pakistan', 'BD': 'Bangladesh', 'LK': 'Sri Lanka',
    'NP': 'Nepal', 'MM': 'Myanmar', 'KH': 'Cambodia', 'LA': 'Laos',
    'PE': 'Peru', 'EC': 'Ecuador', 'VE': 'Venezuela', 'UY': 'Uruguay', 'PY': 'Paraguay',
    'PA': 'Panama', 'CR': 'Costa Rica', 'GT': 'Guatemala', 'CU': 'Cuba', 'DO': 'Dominican Republic',
    'JM': 'Jamaica', 'TT': 'Trinidad and Tobago', 'BS': 'Bahamas', 'BB': 'Barbados',
    'ET': 'Ethiopia', 'TZ': 'Tanzania', 'GH': 'Ghana', 'SN': 'Senegal', 'CI': 'Ivory Coast',
    'MU': 'Mauritius', 'SC': 'Seychelles', 'MV': 'Maldives', 'FJ': 'Fiji',
    'HU': 'Hungary', 'RO': 'Romania', 'BG': 'Bulgaria', 'HR': 'Croatia', 'SK': 'Slovakia',
    'SI': 'Slovenia', 'RS': 'Serbia', 'UA': 'Ukraine', 'BY': 'Belarus', 'LT': 'Lithuania',
    'LV': 'Latvia', 'EE': 'Estonia', 'IS': 'Iceland', 'LU': 'Luxembourg', 'MT': 'Malta',
    'CY': 'Cyprus', 'JO': 'Jordan', 'LB': 'Lebanon', 'KW': 'Kuwait', 'BH': 'Bahrain',
    'OM': 'Oman', 'IQ': 'Iraq', 'IR': 'Iran', 'AF': 'Afghanistan', 'UZ': 'Uzbekistan',
    'KZ': 'Kazakhstan', 'MN': 'Mongolia', 'SB': 'Solomon Islands', 'NR': 'Nauru',
    'PG': 'Papua New Guinea', 'NC': 'New Caledonia', 'PF': 'French Polynesia',
    'WS': 'Samoa', 'TO': 'Tonga', 'VU': 'Vanuatu', 'GU': 'Guam', 'MP': 'Northern Mariana Islands',
    'AS': 'American Samoa', 'PR': 'Puerto Rico', 'VI': 'U.S. Virgin Islands',
    'AW': 'Aruba', 'CW': 'Curaçao', 'SX': 'Sint Maarten', 'BM': 'Bermuda', 'KY': 'Cayman Islands',
    'TC': 'Turks and Caicos', 'AG': 'Antigua and Barbuda', 'LC': 'Saint Lucia',
    'VC': 'Saint Vincent', 'GD': 'Grenada', 'DM': 'Dominica', 'KN': 'Saint Kitts and Nevis',
    'HT': 'Haiti', 'BZ': 'Belize', 'HN': 'Honduras', 'NI': 'Nicaragua', 'SV': 'El Salvador',
    'BO': 'Bolivia', 'GY': 'Guyana', 'SR': 'Suriname', 'GF': 'French Guiana',
    'FK': 'Falkland Islands', 'GL': 'Greenland', 'FO': 'Faroe Islands',
    'AO': 'Angola', 'MZ': 'Mozambique', 'ZW': 'Zimbabwe', 'ZM': 'Zambia', 'BW': 'Botswana',
    'NA': 'Namibia', 'MW': 'Malawi', 'UG': 'Uganda', 'RW': 'Rwanda', 'BI': 'Burundi',
    'DJ': 'Djibouti', 'ER': 'Eritrea', 'SO': 'Somalia', 'SD': 'Sudan', 'SS': 'South Sudan',
    'TD': 'Chad', 'CF': 'Central African Republic', 'CM': 'Cameroon', 'GA': 'Gabon',
    'CG': 'Republic of the Congo', 'CD': 'DR Congo', 'GQ': 'Equatorial Guinea',
    'ST': 'São Tomé and Príncipe', 'CV': 'Cape Verde', 'GM': 'Gambia', 'GW': 'Guinea-Bissau',
    'GN': 'Guinea', 'SL': 'Sierra Leone', 'LR': 'Liberia', 'ML': 'Mali', 'BF': 'Burkina Faso',
    'NE': 'Niger', 'BJ': 'Benin', 'TG': 'Togo', 'MR': 'Mauritania', 'TN': 'Tunisia',
    'LY': 'Libya', 'DZ': 'Algeria', 'EH': 'Western Sahara', 'MG': 'Madagascar',
    'RE': 'Réunion', 'YT': 'Mayotte', 'KM': 'Comoros',
    'AL': 'Albania', 'ME': 'Montenegro', 'MK': 'North Macedonia', 'BA': 'Bosnia and Herzegovina',
    'XK': 'Kosovo', 'MD': 'Moldova', 'GE': 'Georgia', 'AM': 'Armenia', 'AZ': 'Azerbaijan',
    'TM': 'Turkmenistan', 'TJ': 'Tajikistan', 'KG': 'Kyrgyzstan',
    'YE': 'Yemen', 'SY': 'Syria', 'PS': 'Palestine',
    'BN': 'Brunei', 'TL': 'Timor-Leste', 'MO': 'Macau', 'BT': 'Bhutan',
};

// Parse a CSV line handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

const airports = [];

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields = parseCSVLine(line);
    
    const type = fields[typeIdx];
    const iata = fields[iataIdx];
    const lat = parseFloat(fields[latIdx]);
    const lng = parseFloat(fields[lngIdx]);
    
    // Only include medium and large airports with valid IATA codes
    if ((type === 'medium_airport' || type === 'large_airport') && 
        iata && iata.length === 3 && !isNaN(lat) && !isNaN(lng)) {
        
        const countryCode = fields[countryIdx];
        const country = countryNames[countryCode] || countryCode;
        const city = fields[cityIdx] || '';
        const name = fields[nameIdx] || '';
        
        airports.push({
            iata,
            name,
            city,
            country,
            latitude: Math.round(lat * 10000) / 10000,
            longitude: Math.round(lng * 10000) / 10000
        });
    }
}

console.log(`Found ${airports.length} airports with IATA codes`);

// Sort by IATA code
airports.sort((a, b) => a.iata.localeCompare(b.iata));

// Generate TypeScript file
const tsContent = `// Airport database - ${airports.length} airports (medium and large)
// Auto-generated from airports.csv

import type { Airport } from '../types';

export const AIRPORTS: Airport[] = ${JSON.stringify(airports, null, 2)};

// Create a map for fast lookup by IATA code
const airportMap = new Map<string, Airport>();
AIRPORTS.forEach(airport => airportMap.set(airport.iata, airport));

export function searchAirports(query: string): Airport[] {
    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase();

    return AIRPORTS.filter(airport =>
        airport.iata.toLowerCase().includes(searchTerm) ||
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.city.toLowerCase().includes(searchTerm) ||
        airport.country.toLowerCase().includes(searchTerm)
    ).slice(0, 15); // Limit to 15 results
}

export function getAirportByIata(iata: string): Airport | undefined {
    return airportMap.get(iata.toUpperCase());
}

export function getAllAirports(): Airport[] {
    return AIRPORTS;
}
`;

// Write to file
const outputPath = path.join(__dirname, '../src/data/airports.ts');
fs.writeFileSync(outputPath, tsContent);
console.log(`Written to ${outputPath}`);

