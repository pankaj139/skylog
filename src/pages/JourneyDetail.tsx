/**
 * JourneyDetail Page
 * 
 * Detailed view of a single flight with animated globe visualization.
 * Updated: Phase 2 - Added photo gallery support
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlightsStore } from '../store/flightsStore';
import { useAuthStore } from '../store/authStore';
import { getUserFlights } from '../services/flightService';
import AnimatedJourneyGlobe from '../components/globe/AnimatedJourneyGlobe';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AirlineLogo from '../components/common/AirlineLogo';
import PhotoGallery from '../components/photos/PhotoGallery';
import ExportButton from '../components/export/ExportButton';
import { formatDistance, formatDuration, formatDate } from '../utils/formatters';
import type { Flight } from '../types';

export default function JourneyDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { flights, setFlights } = useFlightsStore();
    const [loading, setLoading] = useState(true);
    const [flight, setFlight] = useState<Flight | null>(null);

    useEffect(() => {
        const loadFlight = async () => {
            if (!user || !id) return;

            try {
                // If flights not loaded, load them
                if (flights.length === 0) {
                    const userFlights = await getUserFlights(user.id);
                    setFlights(userFlights);
                    const foundFlight = userFlights.find((f) => f.id === id);
                    setFlight(foundFlight || null);
                } else {
                    const foundFlight = flights.find((f) => f.id === id);
                    setFlight(foundFlight || null);
                }
            } catch (error) {
                console.error('Error loading flight:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFlight();
    }, [id, user, flights, setFlights]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!flight) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <span className="text-6xl mb-4 block">✈️</span>
                    <h2 className="text-2xl font-bold text-white mb-4">Flight Not Found</h2>
                    <button
                        onClick={() => navigate('/history')}
                        className="px-6 py-3 bg-neon-blue hover:bg-neon-cyan rounded-lg text-white font-medium transition-colors"
                    >
                        Back to History
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg relative">
            {/* Top Buttons */}
            <div className="absolute top-6 left-6 right-6 z-50 flex justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 glass border border-white/10 rounded-lg text-white hover:border-neon-blue/40 transition-all flex items-center gap-2 group"
                >
                    <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Back</span>
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/share/${flight.id}`;
                            navigator.clipboard.writeText(url);
                            // You might want to add a toast notification here
                            alert('Link copied to clipboard!');
                        }}
                        className="px-4 py-2 glass border border-white/10 rounded-lg text-white hover:border-neon-blue/40 transition-all flex items-center gap-2 group"
                    >
                        <span>🔗</span>
                        <span>Share</span>
                    </button>
                    <ExportButton type="flight" flight={flight} variant="secondary" size="md" />
                </div>
            </div>

            {/* Full-screen Globe */}
            <div className="h-screen w-full">
                <AnimatedJourneyGlobe flight={flight} />
            </div>

            {/* Flight Info Overlay Card */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6">
                <div className="glass rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
                    {/* Route Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">🛫</div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {flight.originAirport.iata} → {flight.destinationAirport.iata}
                                </div>
                                <div className="text-gray-400">
                                    {flight.originAirport.city} → {flight.destinationAirport.city}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <AirlineLogo airlineName={flight.airline} size="xl" />
                            <div className="text-right">
                                <div className="text-white font-semibold text-lg">{flight.airline}</div>
                                {flight.flightNumber && (
                                    <div className="text-gray-400 text-sm">{flight.flightNumber}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Flight Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                Date
                            </div>
                            <div className="text-white font-medium">{formatDate(flight.date)}</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                Distance
                            </div>
                            <div className="text-white font-medium">
                                {formatDistance(flight.distance || 0)}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                Duration
                            </div>
                            <div className="text-white font-medium">
                                {formatDuration(flight.duration || 0)}
                            </div>
                        </div>

                        {flight.seatClass && (
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                    Class
                                </div>
                                <div className="text-neon-blue font-medium">{flight.seatClass}</div>
                            </div>
                        )}

                        {flight.aircraftType && (
                            <div className="col-span-2">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                    Aircraft
                                </div>
                                <div className="text-white font-medium">{flight.aircraftType}</div>
                            </div>
                        )}

                        {flight.seatNumber && (
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                    Seat
                                </div>
                                <div className="text-white font-medium">{flight.seatNumber}</div>
                            </div>
                        )}

                        {flight.pnr && (
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                    PNR / Booking Ref
                                </div>
                                <div className="text-neon-cyan font-mono font-medium">{flight.pnr}</div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {flight.notes && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                                Notes
                            </div>
                            <div className="text-gray-300">{flight.notes}</div>
                        </div>
                    )}

                    {/* Photos - Phase 2 */}
                    {flight.photos && flight.photos.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <PhotoGallery
                                photos={flight.photos}
                                title="Flight Photos"
                                maxDisplay={6}
                                columns={3}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

