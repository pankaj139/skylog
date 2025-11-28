// Airlines database with logos
// Data sourced from various airline directories

export interface Airline {
    iata: string;
    name: string;
    logo: string;
    country: string;
}

// Using airline logos from a CDN that hosts airline logos
// Format: https://pics.avs.io/200/80/{IATA_CODE}.png (or similar services)
const getAirlineLogo = (iata: string) => `https://pics.avs.io/200/80/${iata}.png`;

export const AIRLINES: Airline[] = [
    // Indian Airlines
    { iata: '6E', name: 'IndiGo', logo: getAirlineLogo('6E'), country: 'India' },
    { iata: 'AI', name: 'Air India', logo: getAirlineLogo('AI'), country: 'India' },
    { iata: 'IX', name: 'Air India Express', logo: getAirlineLogo('IX'), country: 'India' },
    { iata: 'I5', name: 'Air Asia India', logo: getAirlineLogo('I5'), country: 'India' },
    { iata: 'QP', name: 'Akasa Air', logo: getAirlineLogo('QP'), country: 'India' },
    { iata: 'SG', name: 'SpiceJet', logo: getAirlineLogo('SG'), country: 'India' },
    { iata: 'UK', name: 'Vistara', logo: getAirlineLogo('UK'), country: 'India' },
    { iata: 'G8', name: 'Go First', logo: getAirlineLogo('G8'), country: 'India' },

    // Middle East Airlines
    { iata: 'EK', name: 'Emirates', logo: getAirlineLogo('EK'), country: 'United Arab Emirates' },
    { iata: 'EY', name: 'Etihad Airways', logo: getAirlineLogo('EY'), country: 'United Arab Emirates' },
    { iata: 'QR', name: 'Qatar Airways', logo: getAirlineLogo('QR'), country: 'Qatar' },
    { iata: 'G9', name: 'Air Arabia', logo: getAirlineLogo('G9'), country: 'United Arab Emirates' },
    { iata: 'FZ', name: 'flydubai', logo: getAirlineLogo('FZ'), country: 'United Arab Emirates' },
    { iata: 'GF', name: 'Gulf Air', logo: getAirlineLogo('GF'), country: 'Bahrain' },
    { iata: 'WY', name: 'Oman Air', logo: getAirlineLogo('WY'), country: 'Oman' },
    { iata: 'KU', name: 'Kuwait Airways', logo: getAirlineLogo('KU'), country: 'Kuwait' },
    { iata: 'SV', name: 'Saudia', logo: getAirlineLogo('SV'), country: 'Saudi Arabia' },
    { iata: 'J9', name: 'Jazeera Airways', logo: getAirlineLogo('J9'), country: 'Kuwait' },

    // European Airlines
    { iata: 'BA', name: 'British Airways', logo: getAirlineLogo('BA'), country: 'United Kingdom' },
    { iata: 'LH', name: 'Lufthansa', logo: getAirlineLogo('LH'), country: 'Germany' },
    { iata: 'AF', name: 'Air France', logo: getAirlineLogo('AF'), country: 'France' },
    { iata: 'KL', name: 'KLM', logo: getAirlineLogo('KL'), country: 'Netherlands' },
    { iata: 'IB', name: 'Iberia', logo: getAirlineLogo('IB'), country: 'Spain' },
    { iata: 'AZ', name: 'ITA Airways', logo: getAirlineLogo('AZ'), country: 'Italy' },
    { iata: 'LX', name: 'Swiss International', logo: getAirlineLogo('LX'), country: 'Switzerland' },
    { iata: 'OS', name: 'Austrian Airlines', logo: getAirlineLogo('OS'), country: 'Austria' },
    { iata: 'SK', name: 'SAS Scandinavian', logo: getAirlineLogo('SK'), country: 'Sweden' },
    { iata: 'AY', name: 'Finnair', logo: getAirlineLogo('AY'), country: 'Finland' },
    { iata: 'EI', name: 'Aer Lingus', logo: getAirlineLogo('EI'), country: 'Ireland' },
    { iata: 'TP', name: 'TAP Portugal', logo: getAirlineLogo('TP'), country: 'Portugal' },
    { iata: 'TK', name: 'Turkish Airlines', logo: getAirlineLogo('TK'), country: 'Turkey' },
    { iata: 'VS', name: 'Virgin Atlantic', logo: getAirlineLogo('VS'), country: 'United Kingdom' },
    { iata: 'VY', name: 'Vueling', logo: getAirlineLogo('VY'), country: 'Spain' },
    { iata: 'U2', name: 'easyJet', logo: getAirlineLogo('U2'), country: 'United Kingdom' },
    { iata: 'FR', name: 'Ryanair', logo: getAirlineLogo('FR'), country: 'Ireland' },
    { iata: 'W6', name: 'Wizz Air', logo: getAirlineLogo('W6'), country: 'Hungary' },
    { iata: 'DE', name: 'Condor', logo: getAirlineLogo('DE'), country: 'Germany' },
    { iata: 'T3', name: 'Eastern Airways', logo: getAirlineLogo('T3'), country: 'United Kingdom' },

    // Asian Airlines
    { iata: 'SQ', name: 'Singapore Airlines', logo: getAirlineLogo('SQ'), country: 'Singapore' },
    { iata: 'CX', name: 'Cathay Pacific', logo: getAirlineLogo('CX'), country: 'Hong Kong' },
    { iata: 'TG', name: 'Thai Airways', logo: getAirlineLogo('TG'), country: 'Thailand' },
    { iata: 'MH', name: 'Malaysia Airlines', logo: getAirlineLogo('MH'), country: 'Malaysia' },
    { iata: 'GA', name: 'Garuda Indonesia', logo: getAirlineLogo('GA'), country: 'Indonesia' },
    { iata: 'PR', name: 'Philippine Airlines', logo: getAirlineLogo('PR'), country: 'Philippines' },
    { iata: 'VN', name: 'Vietnam Airlines', logo: getAirlineLogo('VN'), country: 'Vietnam' },
    { iata: 'JL', name: 'Japan Airlines', logo: getAirlineLogo('JL'), country: 'Japan' },
    { iata: 'NH', name: 'All Nippon Airways', logo: getAirlineLogo('NH'), country: 'Japan' },
    { iata: 'KE', name: 'Korean Air', logo: getAirlineLogo('KE'), country: 'South Korea' },
    { iata: 'OZ', name: 'Asiana Airlines', logo: getAirlineLogo('OZ'), country: 'South Korea' },
    { iata: 'CA', name: 'Air China', logo: getAirlineLogo('CA'), country: 'China' },
    { iata: 'MU', name: 'China Eastern', logo: getAirlineLogo('MU'), country: 'China' },
    { iata: 'CZ', name: 'China Southern', logo: getAirlineLogo('CZ'), country: 'China' },
    { iata: 'HU', name: 'Hainan Airlines', logo: getAirlineLogo('HU'), country: 'China' },
    { iata: 'BR', name: 'EVA Air', logo: getAirlineLogo('BR'), country: 'Taiwan' },
    { iata: 'CI', name: 'China Airlines', logo: getAirlineLogo('CI'), country: 'Taiwan' },
    { iata: 'UL', name: 'SriLankan Airlines', logo: getAirlineLogo('UL'), country: 'Sri Lanka' },
    { iata: 'PK', name: 'Pakistan International', logo: getAirlineLogo('PK'), country: 'Pakistan' },
    { iata: 'BG', name: 'Biman Bangladesh', logo: getAirlineLogo('BG'), country: 'Bangladesh' },
    { iata: 'RA', name: 'Nepal Airlines', logo: getAirlineLogo('RA'), country: 'Nepal' },

    // Low Cost Asian
    { iata: 'AK', name: 'AirAsia', logo: getAirlineLogo('AK'), country: 'Malaysia' },
    { iata: 'D7', name: 'AirAsia X', logo: getAirlineLogo('D7'), country: 'Malaysia' },
    { iata: 'QZ', name: 'Indonesia AirAsia', logo: getAirlineLogo('QZ'), country: 'Indonesia' },
    { iata: 'FD', name: 'Thai AirAsia', logo: getAirlineLogo('FD'), country: 'Thailand' },
    { iata: 'TR', name: 'Scoot', logo: getAirlineLogo('TR'), country: 'Singapore' },
    { iata: '3K', name: 'Jetstar Asia', logo: getAirlineLogo('3K'), country: 'Singapore' },
    { iata: 'JQ', name: 'Jetstar', logo: getAirlineLogo('JQ'), country: 'Australia' },
    { iata: 'VJ', name: 'VietJet Air', logo: getAirlineLogo('VJ'), country: 'Vietnam' },
    { iata: 'Z2', name: 'AirAsia Philippines', logo: getAirlineLogo('Z2'), country: 'Philippines' },
    { iata: 'XJ', name: 'Thai AirAsia X', logo: getAirlineLogo('XJ'), country: 'Thailand' },
    { iata: 'MM', name: 'Peach Aviation', logo: getAirlineLogo('MM'), country: 'Japan' },
    { iata: 'TW', name: 'T\'way Air', logo: getAirlineLogo('TW'), country: 'South Korea' },
    { iata: 'LJ', name: 'Jin Air', logo: getAirlineLogo('LJ'), country: 'South Korea' },
    { iata: '7C', name: 'Jeju Air', logo: getAirlineLogo('7C'), country: 'South Korea' },

    // American Airlines
    { iata: 'AA', name: 'American Airlines', logo: getAirlineLogo('AA'), country: 'United States' },
    { iata: 'UA', name: 'United Airlines', logo: getAirlineLogo('UA'), country: 'United States' },
    { iata: 'DL', name: 'Delta Air Lines', logo: getAirlineLogo('DL'), country: 'United States' },
    { iata: 'WN', name: 'Southwest Airlines', logo: getAirlineLogo('WN'), country: 'United States' },
    { iata: 'B6', name: 'JetBlue', logo: getAirlineLogo('B6'), country: 'United States' },
    { iata: 'AS', name: 'Alaska Airlines', logo: getAirlineLogo('AS'), country: 'United States' },
    { iata: 'F9', name: 'Frontier Airlines', logo: getAirlineLogo('F9'), country: 'United States' },
    { iata: 'NK', name: 'Spirit Airlines', logo: getAirlineLogo('NK'), country: 'United States' },
    { iata: 'HA', name: 'Hawaiian Airlines', logo: getAirlineLogo('HA'), country: 'United States' },
    { iata: 'AC', name: 'Air Canada', logo: getAirlineLogo('AC'), country: 'Canada' },
    { iata: 'WS', name: 'WestJet', logo: getAirlineLogo('WS'), country: 'Canada' },
    { iata: 'AM', name: 'Aeromexico', logo: getAirlineLogo('AM'), country: 'Mexico' },
    { iata: 'Y4', name: 'Volaris', logo: getAirlineLogo('Y4'), country: 'Mexico' },
    { iata: 'CM', name: 'Copa Airlines', logo: getAirlineLogo('CM'), country: 'Panama' },
    { iata: 'AV', name: 'Avianca', logo: getAirlineLogo('AV'), country: 'Colombia' },
    { iata: 'LA', name: 'LATAM Airlines', logo: getAirlineLogo('LA'), country: 'Chile' },
    { iata: 'G3', name: 'GOL Airlines', logo: getAirlineLogo('G3'), country: 'Brazil' },
    { iata: 'AD', name: 'Azul Airlines', logo: getAirlineLogo('AD'), country: 'Brazil' },
    { iata: 'AR', name: 'Aerolineas Argentinas', logo: getAirlineLogo('AR'), country: 'Argentina' },

    // Oceania Airlines
    { iata: 'QF', name: 'Qantas', logo: getAirlineLogo('QF'), country: 'Australia' },
    { iata: 'VA', name: 'Virgin Australia', logo: getAirlineLogo('VA'), country: 'Australia' },
    { iata: 'NZ', name: 'Air New Zealand', logo: getAirlineLogo('NZ'), country: 'New Zealand' },
    { iata: 'FJ', name: 'Fiji Airways', logo: getAirlineLogo('FJ'), country: 'Fiji' },

    // African Airlines
    { iata: 'ET', name: 'Ethiopian Airlines', logo: getAirlineLogo('ET'), country: 'Ethiopia' },
    { iata: 'SA', name: 'South African Airways', logo: getAirlineLogo('SA'), country: 'South Africa' },
    { iata: 'KQ', name: 'Kenya Airways', logo: getAirlineLogo('KQ'), country: 'Kenya' },
    { iata: 'MS', name: 'EgyptAir', logo: getAirlineLogo('MS'), country: 'Egypt' },
    { iata: 'AT', name: 'Royal Air Maroc', logo: getAirlineLogo('AT'), country: 'Morocco' },
    { iata: 'WB', name: 'RwandAir', logo: getAirlineLogo('WB'), country: 'Rwanda' },

    // Other Airlines
    { iata: 'SU', name: 'Aeroflot', logo: getAirlineLogo('SU'), country: 'Russia' },
    { iata: 'PS', name: 'Ukraine International', logo: getAirlineLogo('PS'), country: 'Ukraine' },
    { iata: 'LO', name: 'LOT Polish Airlines', logo: getAirlineLogo('LO'), country: 'Poland' },
    { iata: 'OK', name: 'Czech Airlines', logo: getAirlineLogo('OK'), country: 'Czech Republic' },
    { iata: 'RO', name: 'TAROM', logo: getAirlineLogo('RO'), country: 'Romania' },
    { iata: 'JU', name: 'Air Serbia', logo: getAirlineLogo('JU'), country: 'Serbia' },
    { iata: 'OU', name: 'Croatia Airlines', logo: getAirlineLogo('OU'), country: 'Croatia' },
    { iata: 'BT', name: 'airBaltic', logo: getAirlineLogo('BT'), country: 'Latvia' },
    { iata: 'A3', name: 'Aegean Airlines', logo: getAirlineLogo('A3'), country: 'Greece' },
    { iata: 'PC', name: 'Pegasus Airlines', logo: getAirlineLogo('PC'), country: 'Turkey' },
    { iata: 'XQ', name: 'SunExpress', logo: getAirlineLogo('XQ'), country: 'Turkey' },
    { iata: 'LY', name: 'El Al', logo: getAirlineLogo('LY'), country: 'Israel' },
    { iata: 'RJ', name: 'Royal Jordanian', logo: getAirlineLogo('RJ'), country: 'Jordan' },
    { iata: 'ME', name: 'Middle East Airlines', logo: getAirlineLogo('ME'), country: 'Lebanon' },
];

// Create a map for fast lookup
const airlineMap = new Map<string, Airline>();
AIRLINES.forEach(airline => airlineMap.set(airline.iata.toUpperCase(), airline));

export function searchAirlines(query: string): Airline[] {
    if (!query || query.length < 1) return [];

    const searchTerm = query.toLowerCase();

    return AIRLINES.filter(airline =>
        airline.iata.toLowerCase().includes(searchTerm) ||
        airline.name.toLowerCase().includes(searchTerm) ||
        airline.country.toLowerCase().includes(searchTerm)
    ).slice(0, 10);
}

export function getAirlineByIata(iata: string): Airline | undefined {
    return airlineMap.get(iata.toUpperCase());
}

export function getAllAirlines(): Airline[] {
    return AIRLINES;
}

// Get popular airlines (for quick selection)
export function getPopularAirlines(): Airline[] {
    const popularIata = ['6E', 'AI', 'EK', 'QR', 'SG', 'BA', 'LH', 'SQ', 'AA', 'UA', 'DL', 'QF'];
    return popularIata.map(iata => airlineMap.get(iata)).filter(Boolean) as Airline[];
}

