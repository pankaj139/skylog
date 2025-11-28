# Gmail Integration Setup Guide for SkyLog

This guide walks you through setting up Gmail integration to automatically import flight confirmations.

## Prerequisites

- Firebase project already set up (from Phase 1)
- Firebase Blaze plan (pay-as-you-go) - required for Cloud Functions with external API calls

## Step 1: Enable Gmail API in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (or create a new one linked to Firebase)
3. Navigate to **APIs & Services** > **Library**
4. Search for "Gmail API"
5. Click on **Gmail API** and then click **Enable**

## Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (for testing) or **Internal** (if using Google Workspace)
3. Fill in the required fields:
   - **App name:** SkyLog
   - **User support email:** Your email
   - **Developer contact:** Your email
4. Click **Save and Continue**
5. Add scopes:
   - Click **Add or Remove Scopes**
   - Search and add these scopes:
     - `https://www.googleapis.com/auth/gmail.readonly` (read emails)
     - `https://www.googleapis.com/auth/userinfo.email` (get user's email)
     - `https://www.googleapis.com/auth/userinfo.profile` (get user's profile)
   - Click **Update** and then **Save and Continue**
6. Add test users (for development):
   - Add your email address as a test user
   - Click **Save and Continue**
7. Review and click **Back to Dashboard**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the OAuth client:
   - **Name:** SkyLog Web Client
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (for development)
     - `https://your-production-domain.com` (for production)
   - **Authorized redirect URIs:**
     - `http://localhost:5173` (for development)
     - `https://your-production-domain.com` (for production)
5. Click **Create**
6. Copy the **Client ID** (you'll need this)

## Step 4: Add Client ID to Environment Variables

1. Open `.env.local` in your project root
2. Add the Google Client ID:

```env
# Existing Firebase variables...
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id

# Phase 3: Gmail Integration
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

3. Restart your development server after adding the variable

## Step 5: Set Up Firebase Cloud Functions (Backend)

### Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Cloud Functions

```bash
cd /path/to/flightPath
firebase init functions
```

When prompted:

- Select your Firebase project
- Choose **TypeScript** as the language
- Say **Yes** to ESLint
- Say **Yes** to install dependencies

### Deploy Functions

After implementing the functions (see `functions/` directory):

```bash
cd functions
npm run deploy
```

## Step 6: Update Firestore Security Rules

Add these rules to your Firestore security rules to allow token storage:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Existing rules...
    
    // Gmail tokens collection (Phase 3)
    match /gmailTokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Imported flights staging collection
    match /importedFlightsStaging/{userId}/flights/{flightId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## How Gmail Import Works

1. **User clicks "Connect Gmail"** - Initiates OAuth flow
2. **User grants permission** - Google returns authorization code
3. **Tokens stored securely** - Access/refresh tokens saved in Firestore
4. **Email scan triggered** - Cloud Function searches for flight emails
5. **Flight data parsed** - Extracts dates, airlines, airports from emails
6. **Preview shown** - User reviews detected flights
7. **User confirms import** - Selected flights added to their account

## Security Considerations

- OAuth tokens are encrypted before storing in Firestore
- Tokens are never exposed to the frontend after initial authorization
- Gmail access is read-only (cannot modify or delete emails)
- Users can disconnect Gmail at any time (tokens are deleted)

## Troubleshooting

### "Error 400: redirect_uri_mismatch"

- Ensure your redirect URI in Google Cloud Console exactly matches your app URL
- Include the protocol (http:// or https://)
- Don't include trailing slashes inconsistently

### "Access blocked: This app's request is invalid"

- Verify the OAuth consent screen is properly configured
- Ensure you're using a test user account during development

### "Permission denied" in Cloud Functions

- Ensure Firebase Blaze plan is active
- Check that the Gmail API is enabled in Google Cloud Console

### Tokens not refreshing

- Verify the refresh token is being stored
- Check Cloud Functions logs for refresh errors

## Testing the Integration

1. Start your development server: `npm run dev`
2. Login to SkyLog
3. Go to History page
4. Click "Import from Gmail" button
5. Follow the Google sign-in flow
6. Grant email reading permission
7. Click "Scan Emails" to detect flight confirmations
8. Review and import detected flights

## Rate Limits

Gmail API has the following quotas:

- 250 quota units per user per second
- 1,000,000,000 quota units per day

Most operations cost 1-5 quota units. The app implements rate limiting to stay within these bounds.
