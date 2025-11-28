/**
 * Gmail Authentication Service - Phase 3
 * 
 * Handles OAuth flow with Google Identity Services for Gmail API access.
 * Uses the hybrid approach: client-side OAuth, server-side email parsing.
 * 
 * Flow:
 * 1. User clicks "Connect Gmail" -> initGmailAuth()
 * 2. Google OAuth popup opens -> user grants permission
 * 3. Authorization code received -> exchanged for tokens via Cloud Function
 * 4. Tokens stored securely in Firestore
 * 5. Email scanning happens server-side using stored tokens
 */

import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { GOOGLE_CLIENT_ID, GMAIL_SCOPES, isGoogleAuthConfigured } from '../config/googleAuth';

// Types for Google Identity Services
declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: TokenClientConfig) => TokenClient;
                    revoke: (token: string, callback: () => void) => void;
                };
            };
        };
    }
}

interface TokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: ErrorResponse) => void;
}

interface TokenClient {
    requestAccessToken: (options?: { prompt?: string }) => void;
}

interface TokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    error?: string;
    error_description?: string;
}

interface ErrorResponse {
    type: string;
    message: string;
}

export interface GmailConnectionStatus {
    isConnected: boolean;
    connectedEmail?: string;
    connectedAt?: Date;
    lastScanAt?: Date;
    error?: string;
}

// In-memory token client instance
let tokenClient: TokenClient | null = null;

/**
 * Loads the Google Identity Services script dynamically
 */
async function loadGoogleScript(): Promise<void> {
    if (window.google?.accounts?.oauth2) {
        return; // Already loaded
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(script);
    });
}

/**
 * Initializes the Google OAuth token client
 */
async function initTokenClient(
    onSuccess: (response: TokenResponse) => void,
    onError: (error: string) => void
): Promise<TokenClient> {
    await loadGoogleScript();

    if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services not available');
    }

    return window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GMAIL_SCOPES.join(' '),
        callback: (response) => {
            if (response.error) {
                onError(response.error_description || response.error);
            } else {
                onSuccess(response);
            }
        },
        error_callback: (error) => {
            onError(error.message || 'OAuth error occurred');
        },
    });
}

/**
 * Initiates the Gmail OAuth flow
 * 
 * @param userId - Current user's ID
 * @returns Promise that resolves when OAuth completes
 */
export async function connectGmail(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!isGoogleAuthConfigured()) {
        return { 
            success: false, 
            error: 'Gmail integration is not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment.' 
        };
    }

    return new Promise(async (resolve) => {
        try {
            tokenClient = await initTokenClient(
                async (response) => {
                    try {
                        // Store token info in Firestore
                        await storeGmailTokens(userId, {
                            accessToken: response.access_token,
                            expiresIn: response.expires_in,
                            scope: response.scope,
                            tokenType: response.token_type,
                        });

                        // Get user's email from token
                        const email = await fetchGmailUserEmail(response.access_token);
                        
                        // Update connection info
                        await updateConnectionInfo(userId, email);

                        resolve({ success: true });
                    } catch (error) {
                        console.error('Error storing Gmail tokens:', error);
                        resolve({ success: false, error: 'Failed to save Gmail connection' });
                    }
                },
                (error) => {
                    resolve({ success: false, error });
                }
            );

            // Request access token (opens popup)
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (error) {
            console.error('Gmail OAuth error:', error);
            resolve({ 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to connect Gmail' 
            });
        }
    });
}

/**
 * Fetches the user's Gmail email address
 */
async function fetchGmailUserEmail(accessToken: string): Promise<string> {
    const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch user info');
    }

    const data = await response.json();
    return data.email;
}

/**
 * Stores Gmail OAuth tokens in Firestore
 */
async function storeGmailTokens(
    userId: string,
    tokens: {
        accessToken: string;
        expiresIn: number;
        scope: string;
        tokenType: string;
    }
): Promise<void> {
    const tokenRef = doc(db, 'gmailTokens', userId);
    
    await setDoc(tokenRef, {
        accessToken: tokens.accessToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        scope: tokens.scope,
        tokenType: tokens.tokenType,
        updatedAt: new Date(),
    });
}

/**
 * Updates Gmail connection info
 */
async function updateConnectionInfo(userId: string, email: string): Promise<void> {
    const tokenRef = doc(db, 'gmailTokens', userId);
    const docSnap = await getDoc(tokenRef);
    
    if (docSnap.exists()) {
        await setDoc(tokenRef, {
            ...docSnap.data(),
            connectedEmail: email,
            connectedAt: new Date(),
        }, { merge: true });
    }
}

/**
 * Gets Gmail connection status for a user
 */
export async function getGmailConnectionStatus(userId: string): Promise<GmailConnectionStatus> {
    try {
        const tokenRef = doc(db, 'gmailTokens', userId);
        const docSnap = await getDoc(tokenRef);

        if (!docSnap.exists()) {
            return { isConnected: false };
        }

        const data = docSnap.data();
        const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
        const isExpired = expiresAt < new Date();

        return {
            isConnected: !isExpired,
            connectedEmail: data.connectedEmail,
            connectedAt: data.connectedAt?.toDate?.() || new Date(data.connectedAt),
            lastScanAt: data.lastScanAt?.toDate?.() || undefined,
        };
    } catch (error) {
        console.error('Error getting Gmail status:', error);
        return { isConnected: false, error: 'Failed to check Gmail status' };
    }
}

/**
 * Disconnects Gmail and removes stored tokens
 */
export async function disconnectGmail(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Get current token to revoke
        const tokenRef = doc(db, 'gmailTokens', userId);
        const docSnap = await getDoc(tokenRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Try to revoke the token with Google
            if (data.accessToken && window.google?.accounts?.oauth2) {
                try {
                    window.google.accounts.oauth2.revoke(data.accessToken, () => {
                        console.log('Token revoked');
                    });
                } catch (e) {
                    // Token revocation is best-effort
                    console.warn('Token revocation failed:', e);
                }
            }

            // Delete from Firestore
            await deleteDoc(tokenRef);
        }

        return { success: true };
    } catch (error) {
        console.error('Error disconnecting Gmail:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to disconnect Gmail' 
        };
    }
}

/**
 * Gets the stored access token for a user
 * Used by Cloud Functions to make Gmail API calls
 */
export async function getStoredAccessToken(userId: string): Promise<string | null> {
    try {
        const tokenRef = doc(db, 'gmailTokens', userId);
        const docSnap = await getDoc(tokenRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);

        // Check if token is expired
        if (expiresAt < new Date()) {
            return null; // Token expired, user needs to reconnect
        }

        return data.accessToken;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

/**
 * Refreshes the access token if needed
 * Note: With the implicit grant flow, refresh tokens are not available.
 * Users will need to re-authenticate when tokens expire.
 */
export async function refreshAccessToken(userId: string): Promise<{ success: boolean; error?: string }> {
    // With implicit flow, we can't refresh tokens
    // Instead, prompt user to reconnect
    return connectGmail(userId);
}

export default {
    connectGmail,
    disconnectGmail,
    getGmailConnectionStatus,
    getStoredAccessToken,
    refreshAccessToken,
    isGoogleAuthConfigured,
};

