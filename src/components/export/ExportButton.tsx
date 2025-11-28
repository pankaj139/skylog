/**
 * ExportButton Component - Phase 2: Export Trip as PDF
 * 
 * A button component for exporting flights or trips as PDF.
 * 
 * Usage:
 *   // For a single flight
 *   <ExportButton type="flight" flight={flight} />
 *   
 *   // For a trip
 *   <ExportButton type="trip" trip={trip} flights={tripFlights} />
 */

import type { Flight, Trip } from '../../types';
import { generateFlightPDF, generateTripPDF } from '../../utils/pdfGenerator';

interface ExportButtonProps {
    type: 'flight' | 'trip';
    flight?: Flight;
    trip?: Trip;
    flights?: Flight[];
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * ExportButton triggers PDF generation for flights or trips
 * 
 * @param type - 'flight' for single flight, 'trip' for trip with flights
 * @param flight - Flight to export (required for type='flight')
 * @param trip - Trip to export (required for type='trip')
 * @param flights - Flights in the trip (required for type='trip')
 */
export default function ExportButton({
    type,
    flight,
    trip,
    flights,
    variant = 'secondary',
    size = 'md',
    className = '',
}: ExportButtonProps) {
    const handleExport = () => {
        if (type === 'flight' && flight) {
            generateFlightPDF(flight);
        } else if (type === 'trip' && trip && flights) {
            generateTripPDF(trip, flights);
        }
    };

    const isDisabled = 
        (type === 'flight' && !flight) || 
        (type === 'trip' && (!trip || !flights));

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
        primary: 'bg-neon-blue hover:bg-neon-cyan text-white',
        secondary: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white',
        ghost: 'hover:bg-white/10 text-gray-300 hover:text-white',
    };

    return (
        <button
            onClick={handleExport}
            disabled={isDisabled}
            className={`
                inline-flex items-center gap-2 rounded-lg font-medium transition-all
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            title={`Export ${type} as PDF`}
        >
            <svg 
                className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
            </svg>
            <span>Export PDF</span>
        </button>
    );
}

/**
 * Compact export icon button
 */
export function ExportIconButton({
    type,
    flight,
    trip,
    flights,
    className = '',
}: Omit<ExportButtonProps, 'variant' | 'size'>) {
    const handleExport = () => {
        if (type === 'flight' && flight) {
            generateFlightPDF(flight);
        } else if (type === 'trip' && trip && flights) {
            generateTripPDF(trip, flights);
        }
    };

    const isDisabled = 
        (type === 'flight' && !flight) || 
        (type === 'trip' && (!trip || !flights));

    return (
        <button
            onClick={handleExport}
            disabled={isDisabled}
            className={`
                p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            title={`Export ${type} as PDF`}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
            </svg>
        </button>
    );
}

