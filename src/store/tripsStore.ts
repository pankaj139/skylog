/**
 * Trips Store - Phase 2: Multi-segment Trip Grouping
 * 
 * This Zustand store manages the state for trips in the SkyLog application.
 * It handles loading, creating, updating, and deleting trips.
 * 
 * Usage:
 *   import { useTripsStore } from './tripsStore';
 *   
 *   const { trips, setTrips, addTrip, updateTrip, deleteTrip } = useTripsStore();
 */

import { create } from 'zustand';
import type { Trip } from '../types';

interface TripsState {
    // State
    trips: Trip[];
    loading: boolean;
    error: string | null;
    selectedTripId: string | null;

    // Actions
    setTrips: (trips: Trip[]) => void;
    addTrip: (trip: Trip) => void;
    updateTrip: (id: string, updates: Partial<Trip>) => void;
    deleteTrip: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSelectedTripId: (tripId: string | null) => void;

    // Selectors
    getTripById: (id: string) => Trip | undefined;
    getTripsByFlightId: (flightId: string) => Trip[];
}

/**
 * Zustand store for managing trips state
 * 
 * @example
 * // In a component
 * const { trips, addTrip, deleteTrip } = useTripsStore();
 * 
 * // Add a new trip to the store
 * addTrip({ id: '123', name: 'Europe 2024', ... });
 * 
 * // Delete a trip from the store
 * deleteTrip('123');
 */
export const useTripsStore = create<TripsState>((set, get) => ({
    // Initial state
    trips: [],
    loading: false,
    error: null,
    selectedTripId: null,

    /**
     * Sets the trips array (typically from Firestore fetch)
     * @param trips - Array of Trip objects
     */
    setTrips: (trips) => set({ trips, loading: false, error: null }),

    /**
     * Adds a new trip to the store
     * @param trip - The Trip object to add
     */
    addTrip: (trip) =>
        set((state) => ({
            trips: [trip, ...state.trips], // Add to beginning (newest first)
        })),

    /**
     * Updates an existing trip in the store
     * @param id - The ID of the trip to update
     * @param updates - Partial Trip object with fields to update
     */
    updateTrip: (id, updates) =>
        set((state) => ({
            trips: state.trips.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            ),
        })),

    /**
     * Removes a trip from the store
     * @param id - The ID of the trip to delete
     */
    deleteTrip: (id) =>
        set((state) => ({
            trips: state.trips.filter((t) => t.id !== id),
            // Clear selection if the deleted trip was selected
            selectedTripId: state.selectedTripId === id ? null : state.selectedTripId,
        })),

    /**
     * Sets the loading state
     * @param loading - Boolean indicating loading state
     */
    setLoading: (loading) => set({ loading }),

    /**
     * Sets an error message
     * @param error - Error message string or null to clear
     */
    setError: (error) => set({ error }),

    /**
     * Sets the currently selected trip ID
     * @param tripId - The ID of the trip to select, or null to deselect
     */
    setSelectedTripId: (tripId) => set({ selectedTripId: tripId }),

    /**
     * Gets a trip by its ID
     * @param id - The ID of the trip to find
     * @returns The Trip object or undefined if not found
     */
    getTripById: (id) => get().trips.find((t) => t.id === id),

    /**
     * Gets all trips that contain a specific flight
     * @param flightId - The ID of the flight to search for
     * @returns Array of trips containing the flight
     */
    getTripsByFlightId: (flightId) =>
        get().trips.filter((t) => t.flightIds.includes(flightId)),
}));

