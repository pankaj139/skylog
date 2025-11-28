/**
 * Google OAuth Configuration - Phase 3
 * 
 * Configuration for Gmail API integration using Google Identity Services.
 * This enables reading flight confirmation emails from the user's Gmail account.
 * 
 * Prerequisites:
 * 1. Enable Gmail API in Google Cloud Console
 * 2. Create OAuth 2.0 credentials (Web application)
 * 3. Add your domain to authorized origins
 * 4. Set VITE_GOOGLE_CLIENT_ID in .env.local
 */

// Google OAuth Client ID from Google Cloud Console
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Gmail API scopes required for reading flight confirmation emails
export const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly', // Read-only access to emails
    'https://www.googleapis.com/auth/userinfo.email', // Get user's email address
    'https://www.googleapis.com/auth/userinfo.profile', // Get user's basic profile
];

// Discovery document for Gmail API
export const GMAIL_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

// Gmail API endpoint
export const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

/**
 * Search queries used to find flight confirmation emails
 */
export const FLIGHT_EMAIL_QUERIES = [
    // Subject-based queries
    'subject:"booking confirmation" OR subject:"flight confirmation" OR subject:"e-ticket" OR subject:"itinerary"',
    'subject:"your flight" OR subject:"trip confirmation" OR subject:"travel confirmation"',
    
    // Airline-specific queries (common airlines)
    'from:(delta.com OR united.com OR aa.com OR britishairways.com OR emirates.com OR lufthansa.com)',
    'from:(airfrance.com OR klm.com OR singaporeair.com OR qantas.com OR cathaypacific.com)',
    'from:(southwest.com OR jetblue.com OR alaskaair.com OR spirit.com OR frontier.com)',
    'from:(ryanair.com OR easyjet.com OR vueling.com OR norwegianair.com OR eurowings.com)',
    'from:(airindia.in OR indigo.in OR spicejet.com OR goair.in OR vistara.in)',
];

/**
 * Combines search queries with date filter
 * @param afterDate - Only search emails after this date (ISO string)
 * @param beforeDate - Only search emails before this date (ISO string)
 */
export function buildGmailSearchQuery(afterDate?: string, beforeDate?: string): string {
    const baseQuery = FLIGHT_EMAIL_QUERIES.join(' OR ');
    
    let query = `(${baseQuery})`;
    
    if (afterDate) {
        const timestamp = Math.floor(new Date(afterDate).getTime() / 1000);
        query += ` after:${timestamp}`;
    }
    
    if (beforeDate) {
        const timestamp = Math.floor(new Date(beforeDate).getTime() / 1000);
        query += ` before:${timestamp}`;
    }
    
    return query;
}

/**
 * Google Identity Services configuration
 */
export const GIS_CONFIG = {
    client_id: GOOGLE_CLIENT_ID,
    scope: GMAIL_SCOPES.join(' '),
    callback: '', // Set dynamically
    auto_select: false,
    cancel_on_tap_outside: true,
};

/**
 * Check if Google Auth is configured
 */
export function isGoogleAuthConfigured(): boolean {
    return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.length > 0);
}

/**
 * Common airline sender patterns for email detection
 */
export const AIRLINE_EMAIL_PATTERNS = {
    // US Airlines
    'delta': { name: 'Delta Air Lines', domains: ['delta.com', 'news.delta.com'] },
    'united': { name: 'United Airlines', domains: ['united.com', 'email.united.com'] },
    'american': { name: 'American Airlines', domains: ['aa.com', 'email.aa.com'] },
    'southwest': { name: 'Southwest Airlines', domains: ['southwest.com', 'luv.southwest.com'] },
    'jetblue': { name: 'JetBlue', domains: ['jetblue.com', 'email.jetblue.com'] },
    'alaska': { name: 'Alaska Airlines', domains: ['alaskaair.com'] },
    
    // European Airlines
    'british': { name: 'British Airways', domains: ['britishairways.com', 'email.britishairways.com'] },
    'lufthansa': { name: 'Lufthansa', domains: ['lufthansa.com', 'news.lufthansa.com'] },
    'airfrance': { name: 'Air France', domains: ['airfrance.com', 'airfranceklm.com'] },
    'klm': { name: 'KLM', domains: ['klm.com', 'airfranceklm.com'] },
    'ryanair': { name: 'Ryanair', domains: ['ryanair.com'] },
    'easyjet': { name: 'easyJet', domains: ['easyjet.com'] },
    
    // Middle Eastern Airlines
    'emirates': { name: 'Emirates', domains: ['emirates.com', 'email.emirates.com'] },
    'qatar': { name: 'Qatar Airways', domains: ['qatarairways.com'] },
    'etihad': { name: 'Etihad', domains: ['etihad.com'] },
    
    // Asian Airlines
    'singapore': { name: 'Singapore Airlines', domains: ['singaporeair.com'] },
    'cathay': { name: 'Cathay Pacific', domains: ['cathaypacific.com'] },
    'ana': { name: 'ANA', domains: ['ana.co.jp'] },
    'jal': { name: 'Japan Airlines', domains: ['jal.com'] },
    
    // Indian Airlines
    'airindia': { name: 'Air India', domains: ['airindia.in', 'airindia.com'] },
    'airindiaexpress': { name: 'Air India Express', domains: ['airindiaexpress.in', 'airindiaexpress.com'] },
    'indigo': { name: 'IndiGo', domains: ['goindigo.in', 'indigo.in', '6e.in'] },
    'vistara': { name: 'Vistara', domains: ['vistara.in', 'airvistara.com'] },
    'spicejet': { name: 'SpiceJet', domains: ['spicejet.com'] },
    'akasaair': { name: 'Akasa Air', domains: ['akasaair.com'] },
    
    // Oceania Airlines
    'qantas': { name: 'Qantas', domains: ['qantas.com', 'qantasairways.com'] },
    'airnz': { name: 'Air New Zealand', domains: ['airnewzealand.com', 'airnz.co.nz'] },
};

export default {
    GOOGLE_CLIENT_ID,
    GMAIL_SCOPES,
    GMAIL_DISCOVERY_DOC,
    GMAIL_API_BASE,
    FLIGHT_EMAIL_QUERIES,
    buildGmailSearchQuery,
    GIS_CONFIG,
    isGoogleAuthConfigured,
    AIRLINE_EMAIL_PATTERNS,
};

