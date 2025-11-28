# Firebase Setup Guide for SkyLog

Follow these steps to set up Firebase for your SkyLog application.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `skylog` (or your preferred name)
4. Click "Continue"
5. Disable Google Analytics (optional for MVP)
6. Click "Create project"

## Step 2: Enable Authentication

1. In the Firebase console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"
4. Enable **Google**:
   - Click on "Google"
   - Toggle "Enable"
   - Select your support email
   - Click "Save"

## Step 3: Create Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in **test mode**" (for development)
   - Note: We'll secure it with rules later
4. Choose your Cloud Firestore location (closest to you)
5. Click "Enable"

## Step 4: Get Your Firebase Configuration (Storage Step Skipped)

> **Note:** Firebase Storage is optional for Phase 1 MVP. It's only needed for Phase 2 when we add photo uploads. You can skip this for now if it requires a paid plan.

1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>` to add a web app
5. Give it a nickname: "SkyLog Web"
6. Check "Also set up Firebase Hosting" (optional)
7. Click "Register app"
8. **Copy the configuration object** - it should look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 5: Add Configuration to Your App

1. Open the file: `.env.local` in your project root
2. Fill in the values from your Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

3. Save the file

## Step 6: Set Up Security Rules

### Firestore Rules

1. In Firebase Console, go to "Firestore Database"
2. Click the "Rules" tab
3. Replace the content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Flights collection
    match /flights/{flightId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // Trips collection (Phase 2)
    match /trips/{tripId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // Gmail tokens collection (Phase 3 - Gmail Integration)
    match /gmailTokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User Progress / Achievements collection (Phase 3 - Gamification)
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click "Publish"

### Storage Rules (Optional - Skip for MVP)

> **Note:** Only set this up when you're ready to add photo upload features in Phase 2.

## Step 7: Test the Application

1. Make sure your dev server is running:
```bash
npm run dev
```

2. Open browser to `http://localhost:5173`

3. You should see the SkyLog authentication page

4. Try creating an account with email/password or Google

5. You should be redirected to the Dashboard after successful authentication

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure you've filled in ALL the environment variables in `.env.local`
- Restart your dev server after adding the `.env.local` file

### "Firebase: Error (auth/operation-not-allowed)"
- Make sure you've enabled Email/Password and Google authentication in Firebase Console

### "Missing or insufficient permissions"
- Make sure you've published the Firestore security rules
- Make sure the rules match the ones shown above

## Next Steps

Once authentication is working, we'll add:
- Flight management (add/edit/delete flights)
- 3D globe visualization
- Travel statistics dashboard
- And more!
