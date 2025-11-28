/**
 * GlobeVisualization Component - Phase 3 Enhanced
 * 
 * Wrapper component that converts flight data to globe-compatible format.
 * Supports multiple visualization modes and filtering.
 */

import { useMemo, useState, useEffect } from 'react';
import FlightGlobe from '../../components/globe/FlightGlobe';
import type { Flight, ArcData, PointData } from '../../types';
import type { GlobeVisualizationMode, GlobeColorMode } from './GlobeModeSelector';

interface GlobeVisualizationProps {
    flights: Flight[];
    visualizationMode?: GlobeVisualizationMode;
    colorMode?: GlobeColorMode;
    timelapseYear?: number;
    filterYear?: number;
    filterAirline?: string;
}

export default function GlobeVisualization({ 
    flights,
    visualizationMode = 'routes',
    colorMode = 'default',
    timelapseYear,
    filterYear,
    filterAirline,
}: GlobeVisualizationProps) {
    const [globeHeight, setGlobeHeight] = useState(500);

    // Responsive height based on screen size
    useEffect(() => {
        const updateHeight = () => {
            if (window.innerWidth < 640) {
                setGlobeHeight(300);
            } else if (window.innerWidth < 1024) {
                setGlobeHeight(400);
            } else {
                setGlobeHeight(500);
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    // Convert flights to arc data for the globe
    const arcs = useMemo<ArcData[]>(() => {
        return flights.map(flight => ({
            startLat: flight.originAirport.latitude,
            startLng: flight.originAirport.longitude,
            endLat: flight.destinationAirport.latitude,
            endLng: flight.destinationAirport.longitude,
            flight,
        }));
    }, [flights]);

    // Get unique airports for point markers with connection count
    const points = useMemo<PointData[]>(() => {
        const airportMap = new Map<string, PointData & { count: number }>();

        flights.forEach(flight => {
            // Add origin airport
            const originKey = flight.originAirport.iata;
            if (airportMap.has(originKey)) {
                const existing = airportMap.get(originKey)!;
                existing.count++;
            } else {
                airportMap.set(originKey, {
                    lat: flight.originAirport.latitude,
                    lng: flight.originAirport.longitude,
                    label: `${flight.originAirport.iata} - ${flight.originAirport.city}`,
                    count: 1,
                });
            }

            // Add destination airport
            const destKey = flight.destinationAirport.iata;
            if (airportMap.has(destKey)) {
                const existing = airportMap.get(destKey)!;
                existing.count++;
            } else {
                airportMap.set(destKey, {
                    lat: flight.destinationAirport.latitude,
                    lng: flight.destinationAirport.longitude,
                    label: `${flight.destinationAirport.iata} - ${flight.destinationAirport.city}`,
                    count: 1,
                });
            }
        });

        return Array.from(airportMap.values());
    }, [flights]);

    return (
        <div className="w-full h-full">
            <FlightGlobe
                arcs={arcs}
                points={points}
                flights={flights}
                autoRotate={true}
                height={globeHeight}
                visualizationMode={visualizationMode}
                colorMode={colorMode}
                timelapseYear={timelapseYear}
                filterYear={filterYear}
                filterAirline={filterAirline}
            />
        </div>
    );
}
