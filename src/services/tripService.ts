/**
 * Trip Service - Phase 2: Multi-segment Trip Grouping
 * 
 * This service handles all CRUD operations for trips in Firestore.
 * Trips allow users to group multiple flights into cohesive journeys.
 * 
 * Usage:
 *   import { createTrip, getUserTrips, updateTrip, deleteTrip } from './tripService';
 *   
 *   // Create a new trip
 *   const tripId = await createTrip(userId, { name: 'Europe 2024', ... });
 *   
 *   // Get all trips for a user
 *   const trips = await getUserTrips(userId);
 */

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    getDoc,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Trip, TripFormData } from '../types';

/**
 * Creates a new trip in Firestore
 * 
 * @param userId - The ID of the user creating the trip
 * @param tripData - The trip data including name, dates, and flight IDs
 * @returns The ID of the newly created trip
 * 
 * @example
 * const tripId = await createTrip('user123', {
 *   name: 'Europe Summer 2024',
 *   description: 'Backpacking through Europe',
 *   startDate: '2024-06-01',
 *   endDate: '2024-06-15',
 *   flightIds: ['flight1', 'flight2'],
 *   tags: ['vacation', 'europe']
 * });
 */
export async function createTrip(userId: string, tripData: TripFormData): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'trips'), {
            userId,
            name: tripData.name,
            description: tripData.description || null,
            startDate: Timestamp.fromDate(new Date(tripData.startDate)),
            endDate: Timestamp.fromDate(new Date(tripData.endDate)),
            flightIds: tripData.flightIds || [],
            coverPhoto: tripData.coverPhoto || null,
            tags: tripData.tags || [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        // Update flights to reference this trip
        if (tripData.flightIds && tripData.flightIds.length > 0) {
            await assignFlightsToTrip(docRef.id, tripData.flightIds);
        }

        return docRef.id;
    } catch (error) {
        console.error('Error creating trip:', error);
        throw error;
    }
}

/**
 * Retrieves all trips for a specific user
 * 
 * @param userId - The ID of the user whose trips to fetch
 * @returns Array of Trip objects sorted by start date (newest first)
 * 
 * @example
 * const trips = await getUserTrips('user123');
 * trips.forEach(trip => console.log(trip.name));
 */
export async function getUserTrips(userId: string): Promise<Trip[]> {
    try {
        const q = query(
            collection(db, 'trips'),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);

        const trips = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startDate: doc.data().startDate.toDate(),
            endDate: doc.data().endDate.toDate(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
        })) as Trip[];

        // Sort by start date (newest first)
        return trips.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    } catch (error) {
        console.error('Error getting trips:', error);
        throw error;
    }
}

/**
 * Retrieves a single trip by its ID
 * 
 * @param tripId - The ID of the trip to fetch
 * @returns The Trip object or null if not found
 * 
 * @example
 * const trip = await getTripById('trip123');
 * if (trip) console.log(trip.name);
 */
export async function getTripById(tripId: string): Promise<Trip | null> {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);

        if (!tripSnap.exists()) {
            return null;
        }

        const data = tripSnap.data();
        return {
            id: tripSnap.id,
            ...data,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
        } as Trip;
    } catch (error) {
        console.error('Error getting trip:', error);
        throw error;
    }
}

/**
 * Updates an existing trip in Firestore
 * 
 * @param tripId - The ID of the trip to update
 * @param updates - Partial trip data to update
 * 
 * @example
 * await updateTrip('trip123', { name: 'Updated Trip Name' });
 */
export async function updateTrip(tripId: string, updates: Partial<TripFormData>): Promise<void> {
    try {
        const tripRef = doc(db, 'trips', tripId);

        const updateData: Record<string, unknown> = {
            updatedAt: Timestamp.now(),
        };

        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.startDate !== undefined) updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
        if (updates.endDate !== undefined) updateData.endDate = Timestamp.fromDate(new Date(updates.endDate));
        if (updates.flightIds !== undefined) updateData.flightIds = updates.flightIds;
        if (updates.coverPhoto !== undefined) updateData.coverPhoto = updates.coverPhoto;
        if (updates.tags !== undefined) updateData.tags = updates.tags;

        await updateDoc(tripRef, updateData);
    } catch (error) {
        console.error('Error updating trip:', error);
        throw error;
    }
}

/**
 * Deletes a trip and removes trip association from its flights
 * 
 * @param tripId - The ID of the trip to delete
 * 
 * @example
 * await deleteTrip('trip123');
 */
export async function deleteTrip(tripId: string): Promise<void> {
    try {
        // First, get the trip to find associated flights
        const trip = await getTripById(tripId);

        if (trip && trip.flightIds.length > 0) {
            // Remove tripId from all associated flights
            await removeFlightsFromTrip(tripId, trip.flightIds);
        }

        // Delete the trip
        await deleteDoc(doc(db, 'trips', tripId));
    } catch (error) {
        console.error('Error deleting trip:', error);
        throw error;
    }
}

/**
 * Assigns flights to a trip by updating their tripId field
 * 
 * @param tripId - The ID of the trip
 * @param flightIds - Array of flight IDs to assign to the trip
 * 
 * @example
 * await assignFlightsToTrip('trip123', ['flight1', 'flight2']);
 */
export async function assignFlightsToTrip(tripId: string, flightIds: string[]): Promise<void> {
    try {
        const batch = writeBatch(db);

        flightIds.forEach(flightId => {
            const flightRef = doc(db, 'flights', flightId);
            batch.update(flightRef, {
                tripId,
                updatedAt: Timestamp.now()
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error assigning flights to trip:', error);
        throw error;
    }
}

/**
 * Removes flights from a trip by clearing their tripId field
 * 
 * @param tripId - The ID of the trip
 * @param flightIds - Array of flight IDs to remove from the trip
 * 
 * @example
 * await removeFlightsFromTrip('trip123', ['flight1']);
 */
export async function removeFlightsFromTrip(_tripId: string, flightIds: string[]): Promise<void> {
    try {
        const batch = writeBatch(db);

        flightIds.forEach(flightId => {
            const flightRef = doc(db, 'flights', flightId);
            batch.update(flightRef, {
                tripId: null,
                updatedAt: Timestamp.now()
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error removing flights from trip:', error);
        throw error;
    }
}

/**
 * Adds a single flight to a trip
 * 
 * @param tripId - The ID of the trip
 * @param flightId - The ID of the flight to add
 * 
 * @example
 * await addFlightToTrip('trip123', 'flight456');
 */
export async function addFlightToTrip(tripId: string, flightId: string): Promise<void> {
    try {
        // Get current trip to update flightIds array
        const trip = await getTripById(tripId);
        if (!trip) {
            throw new Error('Trip not found');
        }

        // Add flightId to trip's flightIds array if not already present
        if (!trip.flightIds.includes(flightId)) {
            const updatedFlightIds = [...trip.flightIds, flightId];
            await updateTrip(tripId, { flightIds: updatedFlightIds });
        }

        // Update flight's tripId
        await assignFlightsToTrip(tripId, [flightId]);
    } catch (error) {
        console.error('Error adding flight to trip:', error);
        throw error;
    }
}

/**
 * Removes a single flight from a trip
 * 
 * @param tripId - The ID of the trip
 * @param flightId - The ID of the flight to remove
 * 
 * @example
 * await removeFlightFromTrip('trip123', 'flight456');
 */
export async function removeFlightFromTrip(tripId: string, flightId: string): Promise<void> {
    try {
        // Get current trip to update flightIds array
        const trip = await getTripById(tripId);
        if (!trip) {
            throw new Error('Trip not found');
        }

        // Remove flightId from trip's flightIds array
        const updatedFlightIds = trip.flightIds.filter(id => id !== flightId);
        await updateTrip(tripId, { flightIds: updatedFlightIds });

        // Remove tripId from flight
        await removeFlightsFromTrip(tripId, [flightId]);
    } catch (error) {
        console.error('Error removing flight from trip:', error);
        throw error;
    }
}

