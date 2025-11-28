/**
 * Firebase Cloud Functions - SkyLog Phase 3
 * 
 * Server-side functions for Gmail integration and email parsing.
 * These functions handle secure token storage and Gmail API interactions.
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Gmail functions
export { scanFlightEmails, parseFlightFromEmail } from './gmail';

