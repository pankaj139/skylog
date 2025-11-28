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
        <div className="flex min-h-screen flex-col lg:flex-row bg-dark-bg overflow-hidden">
            {/* Left Panel - Globe */}
            <div className="flex-1 relative h-[60vh] lg:h-screen bg-gradient-radial from-dark-surface to-dark-bg overflow-hidden">
                {/* Back Button */}
                <div className="absolute top-6 left-6 z-50">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 glass border border-white/10 rounded-lg text-white hover:border-neon-blue/40 transition-all flex items-center gap-2 group"
                    >
                        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                        <span>Back</span>
                    </button>
                </div>

                {/* Share and Export Buttons */}
                <div className="absolute top-6 right-6 z-50 flex gap-2">
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/share/${flight.id}`;
                            navigator.clipboard.writeText(url);
                            alert('Link copied to clipboard!');
                        }}
                        className="px-4 py-2 glass border border-white/10 rounded-lg text-white hover:border-neon-blue/40 transition-all flex items-center gap-2 group"
                    >
                        <span>🔗</span>
                        <span className="hidden sm:inline">Share</span>
                    </button>
                    <ExportButton type="flight" flight={flight} variant="secondary" size="sm" />
                </div>

                {/* Globe Container - Positioned to fill entire left panel */}
                <div className="w-full h-full">
                    <AnimatedJourneyGlobe flight={flight} />
                </div>
            </div>

            {/* Right Panel - Flight Details */}
            <div className="w-full lg:w-[450px] flex-shrink-0 overflow-y-auto border-l border-white/10 bg-dark-surface/30 backdrop-blur-md lg:h-screen">
                <div className="p-6 space-y-6">
                    {/* Route Header */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">🛫</div>
                            <div>
                                <div className="text-xl font-bold text-white">
                                    {flight.originAirport.iata} → {flight.destinationAirport.iata}
                                </div>
                                <div className="text-sm text-gray-400">
                                    {flight.originAirport.city} → {flight.destinationAirport.city}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <AirlineLogo airlineName={flight.airline} size="md" />
                            <div className="text-right">
                                <div className="text-white font-semibold text-sm">{flight.airline}</div>
                                {flight.flightNumber && (
                                    <div className="text-gray-400 text-xs">{flight.flightNumber}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Flight Details Grid */}
                    <div className="glass rounded-xl p-5 border border-white/10">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Flight Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                    Date
                                </div>
                                <div className="text-white font-medium text-sm">{formatDate(flight.date)}</div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                    Distance
                                </div>
                                <div className="text-white font-medium text-sm">
                                    {formatDistance(flight.distance || 0)}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                    Duration
                                </div>
                                <div className="text-white font-medium text-sm">
                                    {formatDuration(flight.duration || 0)}
                                </div>
                            </div>

                            {flight.seatClass && (
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                        Class
                                    </div>
                                    <div className="text-neon-blue font-medium text-sm">{flight.seatClass}</div>
                                </div>
                            )}

                            {flight.aircraftType && (
                                <div className="col-span-2">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                        Aircraft
                                    </div>
                                    <div className="text-white font-medium text-sm">{flight.aircraftType}</div>
                                </div>
                            )}

                            {flight.seatNumber && (
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                        Seat
                                    </div>
                                    <div className="text-white font-medium text-sm">{flight.seatNumber}</div>
                                </div>
                            )}

                            {flight.pnr && (
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                        PNR / Booking Ref
                                    </div>
                                    <div className="text-neon-cyan font-mono font-medium text-sm">{flight.pnr}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {flight.notes && (
                        <div className="glass rounded-xl p-5 border border-white/10">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notes</h2>
                            <div className="text-gray-300 text-sm leading-relaxed">{flight.notes}</div>
                        </div>
                    )}

                    {/* Photos - Phase 2 */}
                    {flight.photos && flight.photos.length > 0 && (
                        <div className="glass rounded-xl p-5 border border-white/10">
                            <PhotoGallery
                                photos={flight.photos}
                                title="Flight Photos"
                                maxDisplay={6}
                                columns={2}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

