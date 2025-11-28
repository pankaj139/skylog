/**
 * AirlineLogo Component
 * 
 * Displays an airline logo with caching support and fallback handling.
 * Uses the airlineLogoCache utility to cache airline data lookups and preload logos.
 * 
 * Usage:
 * <AirlineLogo airlineName="IndiGo" size="md" />
 * <AirlineLogo airlineName="Emirates" size="lg" className="mr-2" />
 * 
 * Props:
 * - airlineName: The name of the airline to display logo for
 * - size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - className: Additional CSS classes
 * - showFallback: Whether to show fallback text when logo fails (default: true)
 */

import { useState, useEffect, useCallback } from 'react';
import { getAirlineData, preloadAirlineLogo } from '../../utils/airlineLogoCache';

interface AirlineLogoProps {
    airlineName: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showFallback?: boolean;
}

const sizeClasses = {
    sm: 'w-8 h-6',
    md: 'w-10 h-8',
    lg: 'w-14 h-10',
    xl: 'w-20 h-14',
};

// Inner component that handles the actual logo rendering
function AirlineLogoInner({ 
    airlineName, 
    size = 'md', 
    className = '',
    showFallback = true 
}: AirlineLogoProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const airline = getAirlineData(airlineName);
    const logoUrl = airline?.logo;

    // Preload the logo when component mounts
    useEffect(() => {
        if (airlineName) {
            preloadAirlineLogo(airlineName);
        }
    }, [airlineName]);

    const handleLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    const handleError = useCallback(() => {
        setImageError(true);
    }, []);

    if (!logoUrl || imageError) {
        if (!showFallback) return null;
        
        // Fallback: Show IATA code or first letters
        const fallbackText = airline?.iata || airlineName.substring(0, 2).toUpperCase();
        return (
            <div 
                className={`${sizeClasses[size]} flex items-center justify-center bg-white/10 rounded ${className}`}
            >
                <span className="text-neon-blue font-bold text-xs">{fallbackText}</span>
            </div>
        );
    }

    return (
        <div className={`${sizeClasses[size]} flex items-center justify-center bg-white/5 rounded overflow-hidden ${className}`}>
            {!imageLoaded && (
                <div className="animate-pulse bg-white/10 w-full h-full absolute" />
            )}
            <img
                src={logoUrl}
                alt={airlineName}
                className={`max-w-full max-h-full object-contain transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
}

// Wrapper component that uses key to reset state when airline changes
export default function AirlineLogo(props: AirlineLogoProps) {
    // Using key to force remount when airline changes, which resets all internal state
    return <AirlineLogoInner key={props.airlineName} {...props} />;
}
