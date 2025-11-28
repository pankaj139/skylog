import type { Flight } from '../../types';
import { formatDistance, formatDuration, formatDate } from '../../utils/formatters';
import AirlineLogo from '../common/AirlineLogo';

interface FlightCardProps {
    flight: Flight;
    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function FlightCard({ flight, onClick, onEdit, onDelete }: FlightCardProps) {
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
            className="glass rounded-xl p-6 border border-white/10 hover:border-neon-blue/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-neon/50 cursor-pointer group"
        >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left Section - Route Info */}
                <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl flex-shrink-0 transition-transform group-hover:scale-110">
                        🛫
                    </div>
                    <div className="flex-1">
                        <div className="text-xl font-semibold text-white mb-1">
                            {flight.originAirport.iata} → {flight.destinationAirport.iata}
                        </div>
                        <div className="text-sm text-gray-400">
                            {flight.originAirport.city} → {flight.destinationAirport.city}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {formatDistance(flight.distance || 0)} • {formatDuration(flight.duration || 0)}
                        </div>
                    </div>
                </div>

                {/* Right Section - Flight Details */}
                <div className="flex flex-col lg:items-end gap-2 lg:text-right">
                    <div className="flex items-center gap-3 lg:flex-row-reverse">
                        {/* Airline Logo */}
                        <AirlineLogo airlineName={flight.airline} size="md" />
                        <div className="text-white font-semibold">{flight.airline}</div>
                    </div>
                    {flight.flightNumber && (
                        <div className="text-sm text-gray-400">{flight.flightNumber}</div>
                    )}
                    <div className="text-sm text-gray-400">{formatDate(flight.date)}</div>
                    {flight.seatClass && (
                        <div className="text-xs text-neon-blue font-medium uppercase tracking-wider">
                            {flight.seatClass}
                        </div>
                    )}
                    {flight.aircraftType && (
                        <div className="text-xs text-gray-500">{flight.aircraftType}</div>
                    )}
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
                                className="px-4 py-2 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 hover:border-neon-blue rounded-lg text-neon-blue text-sm transition-all font-medium"
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
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 rounded-lg text-red-400 text-sm transition-all font-medium"
                                aria-label="Delete flight"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

