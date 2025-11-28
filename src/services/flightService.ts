/**
 * Flight Service
 * 
 * Handles all CRUD operations for flights in Firestore.
 * Updated: Phase 2 - Added photos and tripId support
 */

import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Flight, Airport } from '../types';
import { calculateDistance, estimateFlightDuration } from '../utils/calculations';

/**
 * Creates a new flight in Firestore
 * 
 * @param userId - The ID of the user creating the flight
 * @param flightData - The flight data
 * @returns The ID of the newly created flight
 */
export async function createFlight(userId: string, flightData: {
    originAirport: Airport;
    destinationAirport: Airport;
    airline: string;
    flightNumber?: string;
    date: Date;
    aircraftType?: string;
    seatNumber?: string;
    seatClass?: 'Economy' | 'Premium Economy' | 'Business' | 'First';
    pnr?: string; // Passenger Name Record / Booking reference
    notes?: string;
    photos?: string[]; // Phase 2: Photo URLs
    tripId?: string; // Phase 2: Optional trip assignment
}): Promise<string> {
    try {
        // Calculate distance and duration
        const distance = calculateDistance(
            flightData.originAirport.latitude,
            flightData.originAirport.longitude,
            flightData.destinationAirport.latitude,
            flightData.destinationAirport.longitude
        );

        const duration = estimateFlightDuration(distance);

        const docRef = await addDoc(collection(db, 'flights'), {
            userId,
            originAirport: flightData.originAirport,
            destinationAirport: flightData.destinationAirport,
            airline: flightData.airline,
            flightNumber: flightData.flightNumber || null,
            date: Timestamp.fromDate(flightData.date),
            aircraftType: flightData.aircraftType || null,
            seatNumber: flightData.seatNumber || null,
            seatClass: flightData.seatClass || null,
            pnr: flightData.pnr || null, // Passenger Name Record
            notes: flightData.notes || null,
            photos: flightData.photos || [], // Phase 2
            tripId: flightData.tripId || null, // Phase 2
            distance,
            duration,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error creating flight:', error);
        throw error;
    }
}

// Get all flights for a user
export async function getUserFlights(userId: string): Promise<Flight[]> {
    try {
        const q = query(
            collection(db, 'flights'),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
        })) as Flight[];
    } catch (error) {
        console.error('Error getting flights:', error);
        throw error;
    }
}

/**
 * Updates a flight in Firestore
 * Filters out undefined values (Firestore doesn't accept undefined)
 * 
 * @param flightId - The ID of the flight to update
 * @param updates - Partial flight data to update
 */
export async function updateFlight(flightId: string, updates: Partial<Flight>): Promise<void> {
    try {
        const flightRef = doc(db, 'flights', flightId);

        // If origin or destination changed, recalculate distance and duration
        if (updates.originAirport || updates.destinationAirport) {
            if (updates.originAirport && updates.destinationAirport) {
                updates.distance = calculateDistance(
                    updates.originAirport.latitude,
                    updates.originAirport.longitude,
                    updates.destinationAirport.latitude,
                    updates.destinationAirport.longitude
                );
                updates.duration = estimateFlightDuration(updates.distance);
            }
        }

        // Clean the updates object - convert undefined to null for Firestore
        // Firestore doesn't accept undefined values
        const cleanedUpdates: Record<string, unknown> = {};
        
        Object.entries(updates).forEach(([key, value]) => {
            // Skip internal fields that shouldn't be updated directly
            if (key === 'id' || key === 'createdAt') return;
            
            // Convert undefined to null, keep other values as-is
            cleanedUpdates[key] = value === undefined ? null : value;
        });

        // Add updatedAt timestamp
        cleanedUpdates.updatedAt = Timestamp.now();

        // Convert date to Timestamp if present
        if (cleanedUpdates.date && cleanedUpdates.date instanceof Date) {
            cleanedUpdates.date = Timestamp.fromDate(cleanedUpdates.date);
        }

        await updateDoc(flightRef, cleanedUpdates);
    } catch (error) {
        console.error('Error updating flight:', error);
        throw error;
    }
}

// Delete a flight
export async function deleteFlight(flightId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'flights', flightId));
    } catch (error) {
        console.error('Error deleting flight:', error);
        throw error;
    }
}
