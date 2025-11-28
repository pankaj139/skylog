/**
 * TripCard Component - Phase 2: Multi-segment Trip Grouping
 * 
 * Displays a trip in a card format with summary information.
 * Shows trip name, dates, flight count, and total distance.
 * 
 * Usage:
 *   <TripCard 
 *     trip={trip} 
 *     flights={tripFlights}
 *     onClick={() => navigate(`/trip/${trip.id}`)}
 *     onEdit={() => handleEdit(trip)}
 *     onDelete={() => handleDelete(trip)}
 *   />
 */

import type { Trip, Flight } from '../../types';
import { formatDistance, formatDuration } from '../../utils/formatters';

interface TripCardProps {
    trip: Trip;
    flights: Flight[];
    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

/**
 * TripCard displays a summary of a trip
 * 
 * @param trip - The trip data to display
 * @param flights - Array of flights belonging to this trip
 * @param onClick - Handler for clicking the card
 * @param onEdit - Handler for edit button
 * @param onDelete - Handler for delete button
 */
export default function TripCard({ trip, flights, onClick, onEdit, onDelete }: TripCardProps) {
    // Calculate trip statistics
    const totalDistance = flights.reduce((sum, f) => sum + (f.distance || 0), 0);
    const totalDuration = flights.reduce((sum, f) => sum + (f.duration || 0), 0);
    const countries = new Set([
        ...flights.map(f => f.originAirport.country),
        ...flights.map(f => f.destinationAirport.country)
    ]);

    // Format date range
    const formatDateRange = () => {
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    // Get route summary (e.g., "NYC → PAR → ROM → NYC")
    const getRouteSummary = () => {
        if (flights.length === 0) return 'No flights added';
        
        const sortedFlights = [...flights].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        const airports: string[] = [sortedFlights[0].originAirport.iata];
        sortedFlights.forEach(f => {
            if (airports[airports.length - 1] !== f.destinationAirport.iata) {
                airports.push(f.destinationAirport.iata);
            }
        });
        
        if (airports.length > 4) {
            return `${airports.slice(0, 3).join(' → ')} → ... → ${airports[airports.length - 1]}`;
        }
        return airports.join(' → ');
    };

    const handleCardClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        onClick?.();
    };

    return (
        <div
            onClick={handleCardClick}
            className="glass rounded-xl p-6 border border-white/10 hover:border-neon-cyan/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-neon-cyan/20 cursor-pointer group"
        >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left Section - Trip Info */}
                <div className="flex items-start gap-4 flex-1">
                    {/* Trip Icon/Cover */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 flex items-center justify-center text-3xl flex-shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
                        {trip.coverPhoto ? (
                            <img 
                                src={trip.coverPhoto} 
                                alt={trip.name}
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            '🗺️'
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-neon-cyan transition-colors">
                            {trip.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">{formatDateRange()}</p>
                        <p className="text-sm text-neon-blue font-medium">{getRouteSummary()}</p>
                        {trip.description && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{trip.description}</p>
                        )}
                    </div>
                </div>

                {/* Right Section - Stats */}
                <div className="flex flex-wrap lg:flex-col gap-4 lg:gap-2 lg:text-right lg:min-w-[140px]">
                    <div className="flex items-center gap-2 lg:justify-end">
                        <span className="text-lg">✈️</span>
                        <span className="text-white font-semibold">{flights.length}</span>
                        <span className="text-gray-400 text-sm">flights</span>
                    </div>
                    <div className="flex items-center gap-2 lg:justify-end">
                        <span className="text-lg">🌍</span>
                        <span className="text-white font-semibold">{countries.size}</span>
                        <span className="text-gray-400 text-sm">countries</span>
                    </div>
                    <div className="flex items-center gap-2 lg:justify-end">
                        <span className="text-lg">📏</span>
                        <span className="text-white font-semibold text-sm">{formatDistance(totalDistance)}</span>
                    </div>
                    <div className="flex items-center gap-2 lg:justify-end">
                        <span className="text-lg">⏱️</span>
                        <span className="text-white font-semibold text-sm">{formatDuration(totalDuration)}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                {(onEdit || onDelete) && (
                    <div className="flex gap-2 lg:flex-col">
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 hover:border-neon-cyan rounded-lg text-neon-cyan text-sm transition-all font-medium"
                                aria-label="Edit trip"
                            >
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 rounded-lg text-red-400 text-sm transition-all font-medium"
                                aria-label="Delete trip"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Tags */}
            {trip.tags && trip.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                    {trip.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

