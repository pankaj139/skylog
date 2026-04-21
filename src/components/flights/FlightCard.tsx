/**
 * FlightCard Component
 * 
 * Displays a flight card with route information, airline details, and action buttons.
 * Optimized for compact display with horizontal layout.
 * 
 * Usage:
 * <FlightCard
 *   flight={flightObject}
 *   onClick={() => navigate('/journey/123')}
 *   onEdit={() => openEditModal()}
 *   onDelete={() => openDeleteDialog()}
 * />
 */

import type { Flight } from '../../types';
import { formatDistance, formatDuration, formatDate, formatInr, formatPoints } from '../../utils/formatters';
import AirlineLogo from '../common/AirlineLogo';

interface FlightCardProps {
    flight: Flight;
    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function FlightCard({ flight, onClick, onEdit, onDelete }: FlightCardProps) {
    const bookingSummary = [
        (flight.passengerCount ?? 1) > 1 ? `${flight.passengerCount} pax` : '',
        flight.amountPaidInr != null && flight.amountPaidInr > 0 ? formatInr(flight.amountPaidInr) : '',
        flight.pointsPaid != null && flight.pointsPaid > 0 ? formatPoints(flight.pointsPaid) : '',
    ]
        .filter(Boolean)
        .join(' · ');

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger card click if clicking on action buttons
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        onClick?.();
    };

    return (
        <div
            onClick={handleCardClick}
            className="glass rounded-xl p-4 sm:p-5 border border-white/10 hover:border-neon-blue/40 transition-all duration-300 hover:scale-[1.01] hover:shadow-neon/50 cursor-pointer group"
        >
            <div className="flex items-center justify-between gap-4">
                {/* Left Section - Route Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl sm:text-3xl flex-shrink-0 transition-transform group-hover:scale-110">
                        🛫
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-lg sm:text-xl font-semibold text-white mb-0.5">
                            {flight.originAirport.iata} → {flight.destinationAirport.iata}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400 truncate">
                            {flight.originAirport.city} → {flight.destinationAirport.city}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {formatDistance(flight.distance || 0)} • {formatDuration(flight.duration || 0)}
                        </div>
                    </div>
                </div>

                {/* Middle Section - Flight Details (Right-aligned) */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden sm:flex flex-col items-end gap-1 text-right">
                        <div className="flex items-center gap-2">
                            <div className="text-sm text-white font-semibold">{flight.airline}</div>
                            <AirlineLogo airlineName={flight.airline} size="sm" />
                        </div>
                        {flight.flightNumber && (
                            <div className="text-xs text-gray-400">{flight.flightNumber}</div>
                        )}
                        <div className="text-xs text-gray-400">{formatDate(flight.date)}</div>
                        {bookingSummary && (
                            <div className="text-xs text-gray-500">{bookingSummary}</div>
                        )}
                        <div className="flex items-center gap-2">
                            {flight.seatClass && (
                                <span className="text-xs text-neon-blue font-medium uppercase tracking-wider">
                                    {flight.seatClass}
                                </span>
                            )}
                            {flight.aircraftType && (
                                <span className="text-xs text-gray-500">• {flight.aircraftType}</span>
                            )}
                            {flight.aircraftRegistration && (
                                <span className="text-xs text-gray-500">• {flight.aircraftRegistration}</span>
                            )}
                        </div>
                    </div>

                    {/* Mobile: Compact airline info */}
                    <div className="flex sm:hidden flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                            <AirlineLogo airlineName={flight.airline} size="sm" />
                            <div className="text-xs text-white font-semibold">{flight.airline}</div>
                        </div>
                        {flight.flightNumber && (
                            <div className="text-xs text-gray-400">{flight.flightNumber}</div>
                        )}
                        <div className="text-xs text-gray-400">{formatDate(flight.date)}</div>
                    </div>

                    {/* Action Buttons */}
                    {(onEdit || onDelete) && (
                        <div className="flex gap-2 flex-shrink-0">
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 hover:border-neon-blue rounded-lg text-neon-blue text-xs sm:text-sm transition-all font-medium whitespace-nowrap"
                                    aria-label="Edit flight"
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
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 rounded-lg text-red-400 text-xs sm:text-sm transition-all font-medium whitespace-nowrap"
                                    aria-label="Delete flight"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile: Additional details row */}
            <div className="flex sm:hidden items-center justify-between mt-2 pt-2 border-t border-white/5 gap-2">
                {flight.seatClass && (
                    <span className="text-xs text-neon-blue font-medium uppercase tracking-wider">
                        {flight.seatClass}
                    </span>
                )}
                {(flight.aircraftType || flight.aircraftRegistration) && (
                    <span className="text-xs text-gray-500 ml-auto">
                        {[flight.aircraftType, flight.aircraftRegistration].filter(Boolean).join(' • ')}
                    </span>
                )}
            </div>
        </div>
    );
}

