/**
 * Authentication Hook and Functions
 * 
 * Handles Firebase authentication with email/password and Google OAuth.
 * Uses onAuthStateChanged to listen for auth state changes and sync with Zustand store.
 * 
 * Usage:
 * - useAuth() - Hook to initialize auth listener (call once in App.tsx)
 * - loginWithEmail(email, password) - Sign in with email/password
 * - signupWithEmail(email, password) - Create account with email/password
 * - loginWithGoogle() - Sign in with Google (popup)
 * - logout() - Sign out current user
 */

import { useEffect } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    signInWithPopup,
    GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
    const { setUser, setLoading } = useAuthStore();

    useEffect(() => {
        // Set loading true at start
        setLoading(true);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('Auth state changed:', firebaseUser?.email || 'No user');
            
            if (firebaseUser) {
                try {
                    // Fetch or create user document
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                    const user: User = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email!,
                        displayName: firebaseUser.displayName || undefined,
                        photoURL: firebaseUser.photoURL || undefined,
                        createdAt: userDoc.exists()
                            ? userDoc.data().createdAt?.toDate?.() || new Date()
                            : new Date(),
                    };

                    // Create user document if it doesn't exist
                    if (!userDoc.exists()) {
                        const userData: { email: string; createdAt: Date; displayName?: string; photoURL?: string } = {
                            email: user.email,
                            createdAt: new Date(),
                        };

                        // Only add optional fields if they exist
                        if (user.displayName) {
                            userData.displayName = user.displayName;
                        }
                        if (user.photoURL) {
                            userData.photoURL = user.photoURL;
                        }

                        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
                    }

                    console.log('User authenticated:', user.email);
                    setUser(user);
                } catch (error) {
                    console.error('Error setting up user:', error);
                    setUser(null);
                }
            } else {
                console.log('No user, clearing auth state');
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUser, setLoading]);
}

export async function loginWithEmail(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function signupWithEmail(email: string, password: string) {
    return await createUserWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
    // Use popup for better UX and reliability
    // Popup is more reliable than redirect for single-page apps
    googleProvider.setCustomParameters({
        prompt: 'select_account' // Always show account picker
    });
    return await signInWithPopup(auth, googleProvider);
}

export async function logout() {
    // Clear persisted auth state
    localStorage.removeItem('auth-storage');
    return await signOut(auth);
}
