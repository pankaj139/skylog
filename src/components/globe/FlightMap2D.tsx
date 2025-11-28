/**
 * FlightMap2D Component
 * 
 * A 2D map visualization of flight routes using Leaflet.
 * Displays flight paths as curved arcs, airports as markers, and supports
 * different visualization modes (routes, heatmap, timelapse).
 * 
 * Usage:
 *   <FlightMap2D 
 *     flights={flights} 
 *     visualizationMode="routes"
 *     colorMode="default"
 *   />
 * 
 * Props:
 *   - flights: Array of Flight objects to visualize
 *   - visualizationMode: 'routes' | 'heatmap' | 'timelapse'
 *   - colorMode: 'default' | 'airline' | 'class' | 'distance'
 *   - timelapseYear?: Year to filter for timelapse mode
 *   - filterYear?: Year to filter flights
 *   - filterAirline?: Airline to filter flights
 * 
 * Returns:
 *   A 2D interactive map with flight routes and airport markers
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Flight } from '../../types';
import type { GlobeVisualizationMode, GlobeColorMode } from './GlobeModeSelector';
import 'leaflet/dist/leaflet.css';

interface FlightMap2DProps {
    flights: Flight[];
    visualizationMode?: GlobeVisualizationMode;
    colorMode?: GlobeColorMode;
    timelapseYear?: number;
    filterYear?: number;
    filterAirline?: string;
}

// Create custom airplane icon
const createAirplaneIcon = (rotation: number) => {
    return L.divIcon({
        html: `
            <div style="
                transform: rotate(${rotation}deg);
                font-size: 24px;
                filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.8));
            ">✈️</div>
        `,
        className: 'airplane-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

// Component to animate airplane along a route
function AnimatedAirplane({ flight }: { flight: Flight }) {
    const [position, setPosition] = useState<[number, number]>([
        flight.originAirport.latitude,
        flight.originAirport.longitude
    ]);
    const [rotation, setRotation] = useState(0);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        const duration = 3000; // 3 seconds per flight
        startTimeRef.current = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Interpolate position
            const lat = flight.originAirport.latitude + 
                (flight.destinationAirport.latitude - flight.originAirport.latitude) * progress;
            const lng = flight.originAirport.longitude + 
                (flight.destinationAirport.longitude - flight.originAirport.longitude) * progress;

            setPosition([lat, lng]);

            // Calculate rotation (bearing)
            const dLng = flight.destinationAirport.longitude - flight.originAirport.longitude;
            const lat1 = flight.originAirport.latitude * Math.PI / 180;
            const lat2 = flight.destinationAirport.latitude * Math.PI / 180;
            const dLngRad = dLng * Math.PI / 180;

            const y = Math.sin(dLngRad) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - 
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLngRad);
            const bearing = Math.atan2(y, x) * 180 / Math.PI;
            setRotation(bearing);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                // Restart animation after a brief pause
                setTimeout(() => {
                    startTimeRef.current = performance.now();
                    animationRef.current = requestAnimationFrame(animate);
                }, 1000);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [flight]);

    return (
        <Marker 
            position={position} 
            icon={createAirplaneIcon(rotation)}
            zIndexOffset={1000}
        />
    );
}

// Helper component to fit map bounds
function MapBounds({ flights }: { flights: Flight[] }) {
    const map = useMap();

    useEffect(() => {
        if (flights.length === 0) return;

        const bounds = flights.flatMap(f => [
            [f.originAirport.latitude, f.originAirport.longitude],
            [f.destinationAirport.latitude, f.destinationAirport.longitude]
        ]);

        if (bounds.length > 0) {
            map.fitBounds(bounds as any, { padding: [50, 50] });
        }
    }, [flights, map]);

    return null;
}

/**
 * FlightMap2D renders an interactive 2D map with flight routes
 * 
 * @param flights - Array of flights to display
 * @param visualizationMode - Visualization mode (routes, heatmap, timelapse)
 * @param colorMode - Color coding mode (default, airline, class, distance)
 * @param timelapseYear - Year to display in timelapse mode
 * @param filterYear - Filter flights by year
 * @param filterAirline - Filter flights by airline
 * @returns Interactive 2D map component
 */
export default function FlightMap2D({
    flights,
    visualizationMode = 'routes',
    colorMode = 'default',
    timelapseYear,
    filterYear,
    filterAirline,
}: FlightMap2DProps) {

    // Filter flights based on visualization mode and filters
    const filteredFlights = useMemo(() => {
        let filtered = [...flights];

        // Filter by year
        if (filterYear) {
            filtered = filtered.filter(f => new Date(f.date).getFullYear() === filterYear);
        }

        // Filter by airline
        if (filterAirline) {
            filtered = filtered.filter(f => f.airline === filterAirline);
        }

        // Timelapse mode: only show flights up to the selected year
        if (visualizationMode === 'timelapse' && timelapseYear) {
            filtered = filtered.filter(f => new Date(f.date).getFullYear() <= timelapseYear);
        }

        return filtered;
    }, [flights, visualizationMode, timelapseYear, filterYear, filterAirline]);

    // Get color for flight based on color mode
    const getFlightColor = (flight: Flight): string => {
        if (colorMode === 'by-airline') {
            // Hash airline name to generate consistent color
            const hash = flight.airline.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const hue = hash % 360;
            return `hsl(${hue}, 70%, 60%)`;
        } else if (colorMode === 'by-year') {
            // Color by year
            const year = new Date(flight.date).getFullYear();
            const currentYear = new Date().getFullYear();
            const yearDiff = currentYear - year;
            if (yearDiff === 0) return '#00ff88'; // Current year - bright green
            if (yearDiff <= 1) return '#00d4ff'; // Last year - cyan
            if (yearDiff <= 3) return '#0088ff'; // 2-3 years - blue
            return '#8866ff'; // Older - purple
        }
        return '#00ffff'; // default cyan
    };

    // Generate unique airports with visit counts for heatmap
    const airports = useMemo(() => {
        const airportMap = new Map<string, {
            iata: string;
            name: string;
            city: string;
            lat: number;
            lng: number;
            count: number;
        }>();

        filteredFlights.forEach(flight => {
            // Origin airport
            const originKey = flight.originAirport.iata;
            if (airportMap.has(originKey)) {
                airportMap.get(originKey)!.count++;
            } else {
                airportMap.set(originKey, {
                    iata: flight.originAirport.iata,
                    name: flight.originAirport.name,
                    city: flight.originAirport.city,
                    lat: flight.originAirport.latitude,
                    lng: flight.originAirport.longitude,
                    count: 1,
                });
            }

            // Destination airport
            const destKey = flight.destinationAirport.iata;
            if (airportMap.has(destKey)) {
                airportMap.get(destKey)!.count++;
            } else {
                airportMap.set(destKey, {
                    iata: flight.destinationAirport.iata,
                    name: flight.destinationAirport.name,
                    city: flight.destinationAirport.city,
                    lat: flight.destinationAirport.latitude,
                    lng: flight.destinationAirport.longitude,
                    count: 1,
                });
            }
        });

        return Array.from(airportMap.values());
    }, [filteredFlights]);

    // Get marker size based on visit count (for heatmap mode)
    const getMarkerRadius = (count: number): number => {
        if (visualizationMode === 'heatmap') {
            return 5 + Math.min(count * 2, 20);
        }
        return 6;
    };

    // Get marker color based on visit count (for heatmap mode)
    const getMarkerColor = (count: number): string => {
        if (visualizationMode === 'heatmap') {
            if (count === 1) return '#00ff88';
            if (count < 5) return '#00d4ff';
            if (count < 10) return '#0088ff';
            return '#ff6b6b';
        }
        return '#00ffff';
    };

    // Select a few flights to animate (to avoid performance issues)
    const flightsToAnimate = useMemo(() => {
        if (visualizationMode === 'routes' && filteredFlights.length > 0) {
            // Animate up to 5 flights, prioritizing recent ones
            const sortedFlights = [...filteredFlights].sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            return sortedFlights.slice(0, Math.min(5, sortedFlights.length));
        }
        return [];
    }, [filteredFlights, visualizationMode]);

    return (
        <div className="w-full h-full relative">
            <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ width: '100%', height: '100%' }}
                className="rounded-xl"
                zoomControl={true}
            >
                {/* Dark theme map tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Flight routes as polylines */}
                {visualizationMode !== 'heatmap' && filteredFlights.map((flight, index) => {
                    const positions: [number, number][] = [
                        [flight.originAirport.latitude, flight.originAirport.longitude],
                        [flight.destinationAirport.latitude, flight.destinationAirport.longitude]
                    ];

                    return (
                        <Polyline
                            key={`${flight.id}-${index}`}
                            positions={positions}
                            pathOptions={{
                                color: getFlightColor(flight),
                                weight: 2,
                                opacity: 0.6,
                                dashArray: '5, 10',
                            }}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <div className="font-bold text-neon-blue mb-1">
                                        {flight.originAirport.iata} → {flight.destinationAirport.iata}
                                    </div>
                                    <div className="text-gray-700">{flight.airline}</div>
                                    <div className="text-gray-600 text-xs">
                                        {new Date(flight.date).toLocaleDateString()}
                                    </div>
                                    {flight.distance && (
                                        <div className="text-gray-600 text-xs">
                                            {Math.round(flight.distance)} km
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Polyline>
                    );
                })}

                {/* Animated airplanes */}
                {flightsToAnimate.map((flight, index) => (
                    <AnimatedAirplane
                        key={`airplane-${flight.id}-${index}`}
                        flight={flight}
                    />
                ))}

                {/* Airport markers */}
                {airports.map((airport) => (
                    <CircleMarker
                        key={airport.iata}
                        center={[airport.lat, airport.lng]}
                        radius={getMarkerRadius(airport.count)}
                        pathOptions={{
                            fillColor: getMarkerColor(airport.count),
                            fillOpacity: 0.8,
                            color: '#ffffff',
                            weight: 2,
                        }}
                    >
                        <Popup>
                            <div className="text-sm">
                                <div className="font-bold text-neon-blue">{airport.iata}</div>
                                <div className="text-gray-700">{airport.city}</div>
                                <div className="text-gray-600 text-xs">{airport.name}</div>
                                {visualizationMode === 'heatmap' && (
                                    <div className="text-gray-600 text-xs mt-1">
                                        {airport.count} {airport.count === 1 ? 'visit' : 'visits'}
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

                {/* Auto-fit bounds to show all flights */}
                <MapBounds flights={filteredFlights} />
            </MapContainer>

            {/* Legend for heatmap mode */}
            {visualizationMode === 'heatmap' && (
                <div className="absolute bottom-4 right-4 bg-dark-surface/90 backdrop-blur-md rounded-lg p-3 border border-white/10 text-xs z-[1000]">
                    <div className="text-white font-semibold mb-2">Visit Frequency</div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00ff88' }}></div>
                            <span className="text-gray-300">1 visit</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00d4ff' }}></div>
                            <span className="text-gray-300">2-4 visits</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0088ff' }}></div>
                            <span className="text-gray-300">5-9 visits</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff6b6b' }}></div>
                            <span className="text-gray-300">10+ visits</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

