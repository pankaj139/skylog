import { create } from 'zustand';
import type { Flight } from '../types';

interface FlightsState {
    flights: Flight[];
    loading: boolean;
    error: string | null;

    // Actions
    setFlights: (flights: Flight[]) => void;
    addFlight: (flight: Flight) => void;
    updateFlight: (id: string, flight: Partial<Flight>) => void;
    updateFlightInStore: (id: string, flight: Flight) => void;
    deleteFlight: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useFlightsStore = create<FlightsState>((set) => ({
    flights: [],
    loading: false,
    error: null,

    setFlights: (flights) => set({ flights, loading: false }),

    addFlight: (flight) =>
        set((state) => ({
            flights: [...state.flights, flight],
        })),

    updateFlight: (id, updatedFlight) =>
        set((state) => ({
            flights: state.flights.map((f) =>
                f.id === id ? { ...f, ...updatedFlight } : f
            ),
        })),

    updateFlightInStore: (id, flight) =>
        set((state) => ({
            flights: state.flights.map((f) =>
                f.id === id ? flight : f
            ),
        })),

    deleteFlight: (id) =>
        set((state) => ({
            flights: state.flights.filter((f) => f.id !== id),
        })),

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
