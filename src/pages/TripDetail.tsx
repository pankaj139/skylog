/**
 * TripDetail Page - Phase 2: Multi-segment Trip Grouping
 * 
 * Detailed view of a single trip with multi-arc globe visualization.
 * Shows all flights in the trip animated sequentially.
 * 
 * Features:
 * - Multi-segment flight path visualization
 * - Trip statistics
 * - List of flights in the trip
 * - Option to add/remove flights
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripsStore } from '../store/tripsStore';
import { useFlightsStore } from '../store/flightsStore';
import { useAuthStore } from '../store/authStore';
import { getUserTrips } from '../services/tripService';
import { getUserFlights } from '../services/flightService';
import AnimatedJourneyGlobe from '../components/globe/AnimatedJourneyGlobe';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AirlineLogo from '../components/common/AirlineLogo';
import ExportButton from '../components/export/ExportButton';
import { formatDistance, formatDuration, formatDate } from '../utils/formatters';
import type { Trip } from '../types';

export default function TripDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { trips, setTrips } = useTripsStore();
    const { flights, setFlights } = useFlightsStore();
    const [loading, setLoading] = useState(true);
    const [trip, setTrip] = useState<Trip | null>(null);

    useEffect(() => {
        const loadTrip = async () => {
            if (!user || !id) return;

            try {
                // Load trips and flights if not already loaded
                if (trips.length === 0) {
                    const userTrips = await getUserTrips(user.id);
                    setTrips(userTrips);
                    const foundTrip = userTrips.find(t => t.id === id);
                    setTrip(foundTrip || null);
                } else {
                    const foundTrip = trips.find(t => t.id === id);
                    setTrip(foundTrip || null);
                }

                if (flights.length === 0) {
                    const userFlights = await getUserFlights(user.id);
                    setFlights(userFlights);
                }
            } catch (error) {
                console.error('Error loading trip:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTrip();
    }, [id, user, trips, flights, setTrips, setFlights]);

    // Get flights for this trip, sorted by date
    const tripFlights = useMemo(() => {
        if (!trip) return [];
        return flights
            .filter(f => trip.flightIds.includes(f.id))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [trip, flights]);

    // Calculate trip statistics
    const stats = useMemo(() => {
        if (tripFlights.length === 0) {
            return {
                totalDistance: 0,
                totalDuration: 0,
                countries: 0,
                airports: 0,
                airlines: 0,
            };
        }

        const totalDistance = tripFlights.reduce((sum, f) => sum + (f.distance || 0), 0);
        const totalDuration = tripFlights.reduce((sum, f) => sum + (f.duration || 0), 0);
        const countries = new Set([
            ...tripFlights.map(f => f.originAirport.country),
            ...tripFlights.map(f => f.destinationAirport.country),
        ]).size;
        const airports = new Set([
            ...tripFlights.map(f => f.originAirport.iata),
            ...tripFlights.map(f => f.destinationAirport.iata),
        ]).size;
        const airlines = new Set(tripFlights.map(f => f.airline)).size;

        return { totalDistance, totalDuration, countries, airports, airlines };
    }, [tripFlights]);

    // Format date range
    const formatDateRange = () => {
        if (!trip) return '';
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    // Calculate trip duration in days
    const tripDays = useMemo(() => {
        if (!trip) return 0;
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }, [trip]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <span className="text-6xl mb-4 block">🗺️</span>
                    <h2 className="text-2xl font-bold text-white mb-4">Trip Not Found</h2>
                    <button
                        onClick={() => navigate('/trips')}
                        className="px-6 py-3 bg-neon-cyan hover:bg-neon-cyan/80 rounded-lg text-white font-medium transition-colors"
                    >
                        Back to Trips
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col lg:flex-row bg-dark-bg overflow-hidden">
            {/* Left Panel - Globe */}
            <div className="flex-1 relative h-[60vh] lg:h-screen bg-gradient-radial from-dark-surface to-dark-bg overflow-hidden">
                {/* Back Button */}
                <div className="absolute top-6 left-6 z-50">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 glass border border-white/10 rounded-lg text-white hover:border-neon-cyan/40 transition-all flex items-center gap-2 group"
                    >
                        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                        <span>Back</span>
                    </button>
                </div>

                {tripFlights.length > 0 ? (
                    <AnimatedJourneyGlobe flights={tripFlights} showControls={true} />
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-6xl mb-4 block">✈️</span>
                            <p className="text-gray-400">No flights in this trip yet</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel - Details */}
            <div className="w-full lg:w-[450px] flex-shrink-0 overflow-y-auto border-l border-white/10 bg-dark-surface/30 backdrop-blur-md lg:h-screen">
                <div className="p-6 space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">{trip.name}</h1>
                            <p className="text-sm text-gray-400">{formatDateRange()}</p>
                        </div>
                        <ExportButton type="trip" trip={trip} flights={tripFlights} variant="secondary" size="sm" />
                    </div>

                    {/* Statistics Cards */}
                    <div className="glass rounded-2xl p-5 border border-white/10">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Statistics</h2>
                        <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                            <StatItem icon="✈️" value={tripFlights.length} label="Flights" />
                            <StatItem icon="📅" value={tripDays} label="Days" />
                            <StatItem icon="🌍" value={stats.countries} label="Countries" />
                            <StatItem icon="🛫" value={stats.airports} label="Airports" />
                            <StatItem icon="📏" value={formatDistance(stats.totalDistance)} label="Distance" isText />
                            <StatItem icon="⏱️" value={formatDuration(stats.totalDuration)} label="Time" isText />
                        </div>
                    </div>

                    {/* Description */}
                    {trip.description && (
                        <div>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About</h2>
                            <p className="text-gray-300 leading-relaxed">{trip.description}</p>
                        </div>
                    )}

                    {/* Tags */}
                    {trip.tags && trip.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {trip.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full text-xs text-neon-cyan"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Flight List */}
                    <div>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Itinerary ({tripFlights.length})
                        </h2>

                        {tripFlights.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                <p className="text-gray-400 text-sm">No flights added yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-0 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-white/10" />

                                {tripFlights.map((flight, index) => (
                                    <div key={flight.id} className="relative pl-10 pb-6 last:pb-0">
                                        {/* Dot */}
                                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-dark-bg border border-neon-cyan/50 flex items-center justify-center z-10">
                                            <span className="text-xs text-neon-cyan font-bold">{index + 1}</span>
                                        </div>

                                        {/* Card */}
                                        <div
                                            onClick={() => navigate(`/journey/${flight.id}`)}
                                            className="glass rounded-xl p-4 border border-white/10 hover:border-neon-cyan/40 transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-semibold text-white group-hover:text-neon-cyan transition-colors">
                                                    {flight.originAirport.iata} → {flight.destinationAirport.iata}
                                                </div>
                                                <div className="text-xs text-gray-400">{formatDate(flight.date)}</div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-3">
                                                <AirlineLogo airlineName={flight.airline} size="sm" />
                                                <span className="text-sm text-gray-300">{flight.airline}</span>
                                            </div>

                                            <div className="flex gap-3 text-xs text-gray-500">
                                                <span>{formatDistance(flight.distance || 0)}</span>
                                                <span>•</span>
                                                <span>{formatDuration(flight.duration || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * StatItem component for displaying trip statistics
 */
interface StatItemProps {
    icon: string;
    value: string | number;
    label: string;
    isText?: boolean;
}

function StatItem({ icon, value, label, isText }: StatItemProps) {
    return (
        <div className="text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`font-bold text-white ${isText ? 'text-lg' : 'text-2xl'}`}>
                {value}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
        </div>
    );
}

