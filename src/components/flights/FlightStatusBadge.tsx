import type { FlightStatus } from '../../types';

interface FlightStatusBadgeProps {
    status: FlightStatus;
    className?: string;
}

export default function FlightStatusBadge({ status, className = '' }: FlightStatusBadgeProps) {
    const getStatusColor = () => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'scheduled':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'landed':
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'delayed':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'cancelled':
                return 'bg-red-900/20 text-red-500 border-red-900/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'active': return 'In Air';
            case 'scheduled': return 'Scheduled';
            case 'landed': return 'Landed';
            case 'delayed': return 'Delayed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    return (
        <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${getStatusColor()}
            ${className}
        `}>
            {status === 'active' && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />
            )}
            {getStatusLabel()}
        </span>
    );
}
