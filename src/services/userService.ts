/**
 * User Service
 * 
 * Handles user-related operations including social features (following/followers).
 * Phase 4: Social Network Features
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    Timestamp,
    limit,
    orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { SocialUser, User, SocialActivity } from '../types';

/**
 * Follow a user
 * 
 * @param currentUserId - The ID of the user performing the follow action
 * @param targetUserId - The ID of the user to be followed
 */
export async function followUser(currentUserId: string, targetUserId: string): Promise<void> {
    try {
        if (currentUserId === targetUserId) {
            throw new Error("You cannot follow yourself.");
        }

        // Add to current user's "following" collection
        await setDoc(doc(db, 'users', currentUserId, 'following', targetUserId), {
            userId: targetUserId,
            followedAt: Timestamp.now()
        });

        // Add to target user's "followers" collection
        await setDoc(doc(db, 'users', targetUserId, 'followers', currentUserId), {
            userId: currentUserId,
            followedAt: Timestamp.now()
        });

    } catch (error) {
        console.error('Error following user:', error);
        throw error;
    }
}

/**
 * Unfollow a user
 * 
 * @param currentUserId - The ID of the user performing the unfollow action
 * @param targetUserId - The ID of the user to be unfollowed
 */
export async function unfollowUser(currentUserId: string, targetUserId: string): Promise<void> {
    try {
        // Remove from current user's "following" collection
        await deleteDoc(doc(db, 'users', currentUserId, 'following', targetUserId));

        // Remove from target user's "followers" collection
        await deleteDoc(doc(db, 'users', targetUserId, 'followers', currentUserId));

    } catch (error) {
        console.error('Error unfollowing user:', error);
        throw error;
    }
}

/**
 * Get list of users followed by the current user
 * 
 * @param userId - The user ID to get following list for
 * @returns Array of user IDs
 */
export async function getFollowing(userId: string): Promise<string[]> {
    try {
        const q = query(collection(db, 'users', userId, 'following'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.id);
    } catch (error) {
        console.error('Error getting following list:', error);
        return [];
    }
}

/**
 * Get list of followers for a user
 * 
 * @param userId - The user ID to get followers list for
 * @returns Array of user IDs
 */
export async function getFollowers(userId: string): Promise<string[]> {
    try {
        const q = query(collection(db, 'users', userId, 'followers'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.id);
    } catch (error) {
        console.error('Error getting followers list:', error);
        return [];
    }
}

/**
 * Check if current user is following target user
 * 
 * @param currentUserId 
 * @param targetUserId 
 */
export async function isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
        const docRef = doc(db, 'users', currentUserId, 'following', targetUserId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        console.error('Error checking isFollowing:', error);
        return false;
    }
}

/**
 * Search for users by display name or email
 * Note: Firestore doesn't support full-text search natively. 
 * This is a basic prefix search.
 * 
 * @param searchTerm 
 */
export async function searchUsers(searchTerm: string): Promise<SocialUser[]> {
    try {
        if (!searchTerm || searchTerm.length < 3) return [];

        const usersRef = collection(db, 'users');
        // Simple prefix search on displayName
        // Note: This requires a composite index if combining with other filters
        const q = query(
            usersRef,
            where('displayName', '>=', searchTerm),
            where('displayName', '<=', searchTerm + '\uf8ff'),
            limit(10)
        );

        const snapshot = await getDocs(q);

        // Map to SocialUser type (simplified user object)
        const users: SocialUser[] = [];

        for (const docSnap of snapshot.docs) {
            const userData = docSnap.data() as User;

            // Calculate basic stats (in a real app, these might be aggregated in a separate stats doc)
            // For now, we'll fetch them or use placeholders if not available
            // To avoid N+1 queries, we should ideally store these stats on the user doc

            users.push({
                id: docSnap.id,
                displayName: userData.displayName || 'Unknown User',
                photoURL: userData.photoURL,
                homeAirport: userData.homeAirport,
                stats: {
                    totalFlights: 0, // Placeholder - would need to fetch or store this
                    countriesVisited: 0,
                    totalDistance: 0
                }
            });
        }

        return users;

    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
}

/**
 * Get a user's social profile
 * 
 * @param userId 
 */
export async function getSocialProfile(userId: string): Promise<SocialUser | null> {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return null;

        const userData = userDoc.data() as User;

        // Fetch user's flights to calculate stats
        const flightsQuery = query(
            collection(db, 'flights'),
            where('userId', '==', userId)
        );
        const flightsSnapshot = await getDocs(flightsQuery);

        // Calculate stats from flights
        let totalFlights = 0;
        let totalDistance = 0;
        const countries = new Set<string>();

        flightsSnapshot.docs.forEach(doc => {
            const flightData = doc.data();
            totalFlights++;
            totalDistance += flightData.distance || 0;
            if (flightData.originAirport?.country) {
                countries.add(flightData.originAirport.country);
            }
            if (flightData.destinationAirport?.country) {
                countries.add(flightData.destinationAirport.country);
            }
        });

        return {
            id: userDoc.id,
            displayName: userData.displayName || 'Unknown User',
            photoURL: userData.photoURL,
            homeAirport: userData.homeAirport,
            stats: {
                totalFlights,
                countriesVisited: countries.size,
                totalDistance: Math.round(totalDistance)
            }
        };
    } catch (error) {
        console.error('Error getting social profile:', error);
        return null;
    }
}

/**
 * Update user profile
 * 
 * @param userId - The user ID
 * @param updates - Profile fields to update
 */
export async function updateUserProfile(
    userId: string,
    updates: {
        displayName?: string;
        photoURL?: string;
        homeAirport?: string;
        preferences?: any; // TravelPreferences
    }
): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, updates, { merge: true });
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

/**
 * Get leaderboard data
 * 
 * @param currentUserId - The current user's ID
 * @param type - The metric to sort by
 * @param scope - 'global' or 'friends'
 */
export async function getLeaderboard(
    currentUserId: string,
    type: 'distance' | 'flights' | 'countries',
    scope: 'global' | 'friends'
): Promise<SocialUser[]> {
    try {
        let users: SocialUser[] = [];

        if (scope === 'friends') {
            // Get following list
            const followingIds = await getFollowing(currentUserId);
            // Add current user to list
            followingIds.push(currentUserId);

            // Fetch profiles for all users in list
            // Note: In production, this should be optimized (e.g., batch get)
            const promises = followingIds.map(id => getSocialProfile(id));
            const results = await Promise.all(promises);

            // Filter out nulls
            users = results.filter((u): u is SocialUser => u !== null);
        } else {
            // Global leaderboard - for now, just fetch top 10 users
            // In a real app, this would need a dedicated leaderboard collection
            const usersRef = collection(db, 'users');
            const q = query(usersRef, limit(20));
            const snapshot = await getDocs(q);

            const promises = snapshot.docs.map(doc => getSocialProfile(doc.id));
            const results = await Promise.all(promises);
            users = results.filter((u): u is SocialUser => u !== null);
        }

        // Sort by metric
        return users.sort((a, b) => {
            if (type === 'distance') return b.stats.totalDistance - a.stats.totalDistance;
            if (type === 'flights') return b.stats.totalFlights - a.stats.totalFlights;
            if (type === 'countries') return b.stats.countriesVisited - a.stats.countriesVisited;
            return 0;
        });

    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    }
}

/**
 * Get activity feed
 * 
 * @param userId - The current user's ID
 */
export async function getActivityFeed(userId: string): Promise<SocialActivity[]> {
    try {
        const followingIds = await getFollowing(userId);

        if (followingIds.length === 0) return [];

        // Fetch activities where userId is in following list
        // Note: Firestore 'in' query is limited to 10 items. 
        // For production, we'd need a 'feed' collection for each user.
        // For this MVP, we'll just fetch recent activities and filter client-side if list is long,
        // or just fetch for top 10 friends.

        const activitiesRef = collection(db, 'activities');
        // Taking first 10 friends for MVP query limitation
        const targetIds = followingIds.slice(0, 10);

        const q = query(
            activitiesRef,
            where('userId', 'in', targetIds),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SocialActivity));

    } catch (error) {
        console.error('Error getting activity feed:', error);
        return [];
    }
}
