/**
 * Gmail Cloud Functions - Phase 3
 * 
 * Server-side functions for scanning Gmail and parsing flight confirmations.
 * These functions use stored OAuth tokens to access the user's Gmail.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';

const db = admin.firestore();

// Flight email search queries
const FLIGHT_EMAIL_QUERIES = [
    'subject:"booking confirmation" OR subject:"flight confirmation" OR subject:"e-ticket" OR subject:"itinerary"',
    'subject:"your flight" OR subject:"trip confirmation" OR subject:"travel confirmation"',
];

// Common airline email patterns
const AIRLINE_PATTERNS: Record<string, { name: string; domains: string[] }> = {
    delta: { name: 'Delta Air Lines', domains: ['delta.com', 'news.delta.com'] },
    united: { name: 'United Airlines', domains: ['united.com', 'email.united.com'] },
    american: { name: 'American Airlines', domains: ['aa.com', 'email.aa.com'] },
    southwest: { name: 'Southwest Airlines', domains: ['southwest.com'] },
    jetblue: { name: 'JetBlue', domains: ['jetblue.com'] },
    british: { name: 'British Airways', domains: ['britishairways.com'] },
    lufthansa: { name: 'Lufthansa', domains: ['lufthansa.com'] },
    emirates: { name: 'Emirates', domains: ['emirates.com'] },
    singapore: { name: 'Singapore Airlines', domains: ['singaporeair.com'] },
    airfrance: { name: 'Air France', domains: ['airfrance.com'] },
    klm: { name: 'KLM', domains: ['klm.com'] },
    qantas: { name: 'Qantas', domains: ['qantas.com'] },
    airindia: { name: 'Air India', domains: ['airindia.in', 'airindia.com'] },
    indigo: { name: 'IndiGo', domains: ['goindigo.in', 'indigo.in'] },
    vistara: { name: 'Vistara', domains: ['vistara.in'] },
};

interface DetectedFlight {
    id: string;
    origin?: string;
    destination?: string;
    airline?: string;
    flightNumber?: string;
    date?: string;
    confidence: 'high' | 'medium' | 'low';
    rawSubject: string;
    rawSnippet: string;
    emailId: string;
}

/**
 * Extracts airport codes from text
 */
function extractAirportCodes(text: string): string[] {
    const iataPattern = /\b([A-Z]{3})\b/g;
    const matches = text.match(iataPattern) || [];
    // Return unique codes only
    return [...new Set(matches)];
}

/**
 * Extracts flight number from text
 */
function extractFlightNumber(text: string): string | undefined {
    const patterns = [
        /\b([A-Z]{2,3})\s*(\d{1,4})\b/,
        /Flight\s*#?\s*([A-Z]{2,3}\s*\d{1,4})/i,
        /Flight\s+Number[:\s]+([A-Z0-9]+)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1] + (match[2] || '');
        }
    }
    return undefined;
}

/**
 * Extracts date from text
 */
function extractDate(text: string): string | undefined {
    const patterns = [
        /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/i,
        /\b(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?),?\s+(\d{4})\b/i,
        /\b(\d{4})[-/](\d{2})[-/](\d{2})\b/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            try {
                const date = new Date(match[0]);
                if (!isNaN(date.getTime())) {
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
 * Extracts airline from email content
 */
function extractAirline(from: string, subject: string, snippet: string): string | undefined {
    const text = `${from} ${subject} ${snippet}`.toLowerCase();

    for (const airline of Object.values(AIRLINE_PATTERNS)) {
        for (const domain of airline.domains) {
            if (text.includes(domain.toLowerCase())) {
                return airline.name;
            }
        }
        if (text.includes(airline.name.toLowerCase())) {
            return airline.name;
        }
    }

    return undefined;
}

/**
 * Parses email to extract flight information
 */
function parseEmailToFlight(email: {
    id: string;
    from: string;
    subject: string;
    snippet: string;
    date: string;
}): DetectedFlight {
    const combinedText = `${email.subject} ${email.snippet}`;

    const airportCodes = extractAirportCodes(combinedText);
    const origin = airportCodes[0];
    const destination = airportCodes[1];
    const airline = extractAirline(email.from, email.subject, email.snippet);
    const flightNumber = extractFlightNumber(combinedText);
    const flightDate = extractDate(combinedText);

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
        airline,
        flightNumber,
        date: flightDate,
        confidence,
        rawSubject: email.subject,
        rawSnippet: email.snippet,
        emailId: email.id,
    };
}

/**
 * Cloud Function: Scan Gmail for flight emails
 * 
 * This is a callable function that scans the user's Gmail for flight confirmations.
 */
export const scanFlightEmails = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const maxResults = data.maxResults || 50;

    try {
        // Get stored access token
        const tokenDoc = await db.collection('gmailTokens').doc(userId).get();

        if (!tokenDoc.exists) {
            throw new functions.https.HttpsError('failed-precondition', 'Gmail not connected');
        }

        const tokenData = tokenDoc.data();
        if (!tokenData?.accessToken) {
            throw new functions.https.HttpsError('failed-precondition', 'No access token found');
        }

        // Check if token is expired
        const expiresAt = tokenData.expiresAt?.toDate?.() || new Date(tokenData.expiresAt);
        if (expiresAt < new Date()) {
            throw new functions.https.HttpsError('failed-precondition', 'Access token expired. Please reconnect Gmail.');
        }

        // Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: tokenData.accessToken });

        // Create Gmail API client
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Build search query
        const query = FLIGHT_EMAIL_QUERIES.join(' OR ');

        // Search for emails
        const searchResponse = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults,
        });

        const messages = searchResponse.data.messages || [];
        const detectedFlights: DetectedFlight[] = [];

        // Fetch details for each message
        for (const message of messages) {
            if (!message.id) continue;

            try {
                const detailResponse = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'metadata',
                    metadataHeaders: ['Subject', 'From', 'Date'],
                });

                const headers = detailResponse.data.payload?.headers || [];
                const getHeader = (name: string) =>
                    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

                const emailData = {
                    id: message.id,
                    from: getHeader('From'),
                    subject: getHeader('Subject'),
                    snippet: detailResponse.data.snippet || '',
                    date: getHeader('Date'),
                };

                const flight = parseEmailToFlight(emailData);
                detectedFlights.push(flight);
            } catch (error) {
                console.error('Error fetching email details:', error);
            }
        }

        // Update last scan timestamp
        await db.collection('gmailTokens').doc(userId).update({
            lastScanAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            success: true,
            flights: detectedFlights,
            totalScanned: messages.length,
        };
    } catch (error) {
        console.error('Error scanning emails:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to scan emails');
    }
});

/**
 * Cloud Function: Parse a single email for flight information
 * 
 * Useful for re-parsing or testing email parsing logic.
 */
export const parseFlightFromEmail = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { emailId } = data;
    if (!emailId) {
        throw new functions.https.HttpsError('invalid-argument', 'emailId is required');
    }

    const userId = context.auth.uid;

    try {
        // Get stored access token
        const tokenDoc = await db.collection('gmailTokens').doc(userId).get();

        if (!tokenDoc.exists) {
            throw new functions.https.HttpsError('failed-precondition', 'Gmail not connected');
        }

        const tokenData = tokenDoc.data();
        if (!tokenData?.accessToken) {
            throw new functions.https.HttpsError('failed-precondition', 'No access token found');
        }

        // Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: tokenData.accessToken });

        // Create Gmail API client
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Get full email content
        const detailResponse = await gmail.users.messages.get({
            userId: 'me',
            id: emailId,
            format: 'full',
        });

        const headers = detailResponse.data.payload?.headers || [];
        const getHeader = (name: string) =>
            headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

        // Get email body for better parsing
        let body = '';
        const payload = detailResponse.data.payload;

        if (payload?.body?.data) {
            body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        } else if (payload?.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                    body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    break;
                }
            }
        }

        const emailData = {
            id: emailId,
            from: getHeader('From'),
            subject: getHeader('Subject'),
            snippet: detailResponse.data.snippet || body.substring(0, 500),
            date: getHeader('Date'),
        };

        const flight = parseEmailToFlight(emailData);

        return {
            success: true,
            flight,
            rawBody: body.substring(0, 2000), // Return first 2000 chars for debugging
        };
    } catch (error) {
        console.error('Error parsing email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to parse email');
    }
});

