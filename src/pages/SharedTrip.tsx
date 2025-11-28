import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import FlightGlobe from '../components/globe/FlightGlobe';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Flight } from '../types';
import AirlineLogo from '../components/common/AirlineLogo';
import { formatDistance, formatDuration, formatDate } from '../utils/formatters';

const SharedTrip: React.FC = () => {
    const { tripId } = useParams<{ tripId: string }>();
    const [flight, setFlight] = useState<Flight | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFlight = async () => {
            if (!tripId) return;

            try {
                // Note: In a real app, this would likely fetch from a 'shared_trips' collection
                // or check a 'public' flag on the flight document.
                // For now, we'll fetch directly from flights collection for demonstration.
                const docRef = doc(db, 'flights', tripId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setFlight({ id: docSnap.id, ...docSnap.data() } as Flight);
                } else {
                    setError('Flight not found or link expired.');
                }
            } catch (err) {
                console.error('Error fetching shared flight:', err);
                setError('Failed to load flight details.');
            } finally {
                setLoading(false);
            }
        };

        fetchFlight();
    }, [tripId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !flight) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
                <div className="glass p-8 rounded-xl border border-white/10 text-center max-w-md">
                    <div className="text-4xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
                    <p className="text-gray-400">{error || 'Something went wrong.'}</p>
                </div>
            </div>
        );
    }

    const arcData = [{
        startLat: flight.originAirport.latitude,
        startLng: flight.originAirport.longitude,
        endLat: flight.destinationAirport.latitude,
        endLng: flight.destinationAirport.longitude,
        flight: flight,
    }];

    const pointData = [
        {
            lat: flight.originAirport.latitude,
            lng: flight.originAirport.longitude,
            label: flight.originAirport.iata,
            color: '#00ffff'
        },
        {
            lat: flight.destinationAirport.latitude,
            lng: flight.destinationAirport.longitude,
            label: flight.destinationAirport.iata,
            color: '#00ffff'
        }
    ];

    return (
        <div className="min-h-screen bg-dark-bg relative overflow-hidden">
            {/* Full Screen Globe */}
            <div className="absolute inset-0 z-0">
                <FlightGlobe
                    arcs={arcData}
                    points={pointData}
                    flights={[flight]}
                    autoRotate={true}
                    height={window.innerHeight}
                />
            </div>

            {/* Overlay Content */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-12">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="glass px-6 py-3 rounded-full border border-white/10 pointer-events-auto">
                        <span className="text-neon-blue font-bold tracking-wider">SKYLOG</span>
                    </div>
                </div>

                {/* Flight Details Card */}
                <div className="glass p-6 md:p-8 rounded-2xl border border-white/10 max-w-md w-full mx-auto mb-8 pointer-events-auto animate-slide-up">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <AirlineLogo airlineName={flight.airline} size="md" />
                            <div>
                                <h3 className="text-white font-bold text-lg">{flight.airline}</h3>
                                <p className="text-gray-400 text-sm">{flight.flightNumber}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-medium">{formatDate(flight.date)}</p>
                            {flight.seatClass && (
                                <span className="text-xs text-neon-blue uppercase tracking-wider font-bold">
                                    {flight.seatClass}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between relative mb-6">
                        {/* Origin */}
                        <div className="text-left">
                            <div className="text-3xl font-bold text-white mb-1">{flight.originAirport.iata}</div>
                            <div className="text-sm text-gray-400">{flight.originAirport.city}</div>
                        </div>

                        {/* Path Visual */}
                        <div className="flex-1 px-4 flex flex-col items-center">
                            <div className="text-xs text-gray-500 mb-1">{formatDuration(flight.duration || 0)}</div>
                            <div className="w-full h-0.5 bg-white/20 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">✈️</div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{formatDistance(flight.distance || 0)}</div>
                        </div>

                        {/* Destination */}
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white mb-1">{flight.destinationAirport.iata}</div>
                            <div className="text-sm text-gray-400">{flight.destinationAirport.city}</div>
                        </div>
                    </div>

                    {flight.aircraftType && (
                        <div className="text-center pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-500">Operated by</p>
                            <p className="text-white font-medium">{flight.aircraftType}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SharedTrip;
