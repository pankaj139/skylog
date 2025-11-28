/**
 * AnimatedJourneyGlobe Component - Phase 2: Enhanced Globe Animations
 * 
 * An animated 3D globe visualization showing flight paths with:
 * - Single or multi-segment flight path animation
 * - Moving plane icon along the geodesic path
 * - Camera following mode
 * - Cinema mode with auto-rotation
 * - Speed controls (0.5x, 1x, 2x)
 * - Theme selection (night, day, satellite)
 * - Play/Pause and Replay controls
 * 
 * Usage:
 *   // Single flight
 *   <AnimatedJourneyGlobe flight={flight} />
 *   
 *   // Multiple flights (trip)
 *   <AnimatedJourneyGlobe flights={tripFlights} />
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Globe from 'react-globe.gl';
import type { Flight } from '../../types';
import {
    interpolateGeodesicPoint,
    calculateOptimalCameraPosition,
} from '../../utils/globeAnimations';
import GlobeControls from './GlobeControls';

// Globe texture URLs for different themes
const GLOBE_TEXTURES = {
    night: '//unpkg.com/three-globe/example/img/earth-night.jpg',
    day: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    satellite: '//unpkg.com/three-globe/example/img/earth-topology.png',
};

interface AnimatedJourneyGlobeProps {
    // Single flight (backward compatible)
    flight?: Flight;
    // Multiple flights for multi-segment trips
    flights?: Flight[];
    // Show controls
    showControls?: boolean;
    // Auto-play on mount
    autoPlay?: boolean;
    // Initial theme
    initialTheme?: 'night' | 'day' | 'satellite';
}

/**
 * AnimatedJourneyGlobe renders an interactive 3D globe with animated flight paths
 * 
 * @param flight - Single flight to animate (for backward compatibility)
 * @param flights - Array of flights for multi-segment animation
 * @param showControls - Whether to show animation controls (default: true)
 * @param autoPlay - Whether to start animation automatically (default: true)
 * @param initialTheme - Initial globe texture theme (default: 'night')
 */
export default function AnimatedJourneyGlobe({
    flight,
    flights: propFlights,
    showControls = true,
    autoPlay = true,
    initialTheme = 'day',
}: AnimatedJourneyGlobeProps) {
    const globeEl = useRef<any>(null);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedTimeRef = useRef<number>(0);

    // Normalize to array of flights
    const flights = useMemo(() => {
        if (propFlights && propFlights.length > 0) {
            return [...propFlights].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
        }
        if (flight) {
            return [flight];
        }
        return [];
    }, [flight, propFlights]);

    // Animation state
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [speed, setSpeed] = useState(1);
    const [progress, setProgress] = useState(0);
    const [currentFlightIndex, setCurrentFlightIndex] = useState(0);
    const [flightProgress, setFlightProgress] = useState(0);
    const [planePosition, setPlanePosition] = useState<{ lat: number; lng: number; altitude?: number } | null>(null);

    // Display options
    const [isCinemaMode, setIsCinemaMode] = useState(false);
    const [theme, setTheme] = useState<'night' | 'day' | 'satellite'>(initialTheme);

    // Calculate total animation duration (4 seconds per flight segment)
    const SEGMENT_DURATION = 4000; // 4 seconds per segment
    const totalDuration = flights.length * SEGMENT_DURATION;

    // Generate arc data for all flights with progress
    const arcsData = useMemo(() => {
        if (flights.length === 0) return [];

        return flights.map((f, index) => {
            // Calculate arc visibility based on animation progress
            let arcProgress = 0;

            if (index < currentFlightIndex) {
                arcProgress = 1; // Fully drawn for past segments
            } else if (index === currentFlightIndex) {
                arcProgress = flightProgress; // Currently animating
            }
            // Future segments stay at 0

            return {
                startLat: f.originAirport.latitude,
                startLng: f.originAirport.longitude,
                endLat: f.destinationAirport.latitude,
                endLng: f.destinationAirport.longitude,
                color: index === currentFlightIndex
                    ? ['rgba(0, 255, 255, 0.9)', 'rgba(0, 150, 255, 0.9)']
                    : ['rgba(0, 255, 255, 0.4)', 'rgba(0, 150, 255, 0.4)'],
                progress: arcProgress,
                index,
            };
        });
    }, [flights, currentFlightIndex, flightProgress]);

    // Airport labels
    const airportLabels = useMemo(() => {
        if (flights.length === 0) return [];

        const airports: Array<{
            lat: number;
            lng: number;
            text: string;
            city: string;
            isOrigin: boolean;
            isDestination: boolean;
            isActive: boolean;
        }> = [];

        const addedAirports = new Set<string>();

        flights.forEach((f, index) => {
            // Origin
            if (!addedAirports.has(f.originAirport.iata)) {
                addedAirports.add(f.originAirport.iata);
                airports.push({
                    lat: f.originAirport.latitude,
                    lng: f.originAirport.longitude,
                    text: f.originAirport.iata,
                    city: f.originAirport.city,
                    isOrigin: index === 0,
                    isDestination: false,
                    isActive: index <= currentFlightIndex,
                });
            }
            // Destination
            if (!addedAirports.has(f.destinationAirport.iata)) {
                addedAirports.add(f.destinationAirport.iata);
                airports.push({
                    lat: f.destinationAirport.latitude,
                    lng: f.destinationAirport.longitude,
                    text: f.destinationAirport.iata,
                    city: f.destinationAirport.city,
                    isOrigin: false,
                    isDestination: index === flights.length - 1,
                    isActive: index < currentFlightIndex || (index === currentFlightIndex && flightProgress > 0.9),
                });
            }
        });

        return airports;
    }, [flights, currentFlightIndex, flightProgress]);

    // Plane marker
    const planeMarkerData = useMemo(() => {
        if (!planePosition || !isPlaying) return [];
        return [{
            lat: planePosition.lat,
            lng: planePosition.lng,
            altitude: planePosition.altitude || 0,
            isPlane: true,
        }];
    }, [planePosition, isPlaying]);

    // Combined HTML elements
    const htmlElements = useMemo(() => {
        return [...airportLabels, ...planeMarkerData];
    }, [airportLabels, planeMarkerData]);

    // Calculate bearing for plane rotation
    const calculateBearing = useCallback((lat1: number, lng1: number, lat2: number, lng2: number) => {
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;

        const y = Math.sin(dLng) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

        return Math.atan2(y, x) * 180 / Math.PI;
    }, []);

    // Animation logic
    useEffect(() => {
        if (!globeEl.current || flights.length === 0) return;

        // Set initial camera position
        const firstFlight = flights[0];
        const cameraPos = calculateOptimalCameraPosition(
            firstFlight.originAirport.latitude,
            firstFlight.originAirport.longitude,
            firstFlight.destinationAirport.latitude,
            firstFlight.destinationAirport.longitude
        );

        globeEl.current.pointOfView(
            { lat: cameraPos.lat, lng: cameraPos.lng, altitude: cameraPos.altitude },
            0
        );

        if (!autoPlay) return;

        // Start animation after delay
        const startDelay = setTimeout(() => {
            startTimeRef.current = performance.now();

            const animate = (currentTime: number) => {
                if (!isPlaying) {
                    pausedTimeRef.current = currentTime - startTimeRef.current;
                    return;
                }

                const elapsed = (currentTime - startTimeRef.current) * speed;
                const overallProgress = Math.min(elapsed / totalDuration, 1);

                setProgress(overallProgress);

                // Calculate which segment we're on
                const segmentIndex = Math.min(
                    Math.floor(overallProgress * flights.length),
                    flights.length - 1
                );
                const segmentProgress = (overallProgress * flights.length) - segmentIndex;
                // Use linear for smoother plane movement (no easing on the interpolation itself)
                const easedSegmentProgress = Math.min(segmentProgress, 1);

                setCurrentFlightIndex(segmentIndex);
                setFlightProgress(easedSegmentProgress);

                // Update plane position
                const currentFlight = flights[segmentIndex];
                if (currentFlight && easedSegmentProgress > 0 && easedSegmentProgress < 1) {
                    const position = interpolateGeodesicPoint(
                        currentFlight.originAirport.latitude,
                        currentFlight.originAirport.longitude,
                        currentFlight.destinationAirport.latitude,
                        currentFlight.destinationAirport.longitude,
                        easedSegmentProgress
                    );

                    // Calculate altitude to follow the arc curve (parabolic)
                    // Peaks at midpoint (progress = 0.5)
                    const altitudeProgress = 1 - Math.pow(2 * easedSegmentProgress - 1, 2);
                    // Use base altitude to match arcAltitude setting
                    position.altitude = 0.1 * altitudeProgress;
                    setPlanePosition(position);

                    // Camera follows plane (or cinema mode)
                    // Disabled to allow user interaction during animation
                    /* 
                    if (isCinemaMode) {
                        // Cinema mode: wider view with auto-rotation
                        globeEl.current?.pointOfView(
                            {
                                lat: position.lat,
                                lng: position.lng + (currentTime / 100) % 360, // Slow rotation
                                altitude: 2.5,
                            },
                            500
                        );
                    } else {
                        // Normal mode: camera follows plane
                        const flightCameraPos = calculateOptimalCameraPosition(
                            currentFlight.originAirport.latitude,
                            currentFlight.originAirport.longitude,
                            currentFlight.destinationAirport.latitude,
                            currentFlight.destinationAirport.longitude
                        );
                        globeEl.current?.pointOfView(
                            {
                                lat: position.lat,
                                lng: position.lng,
                                altitude: flightCameraPos.altitude,
                            },
                            100
                        );
                    }
                    */
                } else if (easedSegmentProgress >= 1) {
                    setPlanePosition(null);
                }

                if (overallProgress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    setIsPlaying(false);
                    setPlanePosition(null);
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        }, 500);

        return () => {
            clearTimeout(startDelay);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [flights, isPlaying, speed, isCinemaMode, autoPlay, totalDuration]);

    // Handle play/pause
    const handlePlayPause = useCallback(() => {
        if (!isPlaying) {
            // Resume from paused position
            startTimeRef.current = performance.now() - pausedTimeRef.current;
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    // Handle replay
    const handleReplay = useCallback(() => {
        setProgress(0);
        setCurrentFlightIndex(0);
        setFlightProgress(0);
        setPlanePosition(null);
        startTimeRef.current = performance.now();
        pausedTimeRef.current = 0;
        setIsPlaying(true);
    }, []);

    // Handle progress change (scrubbing)
    const handleProgressChange = useCallback((newProgress: number) => {
        const segmentIndex = Math.min(
            Math.floor(newProgress * flights.length),
            flights.length - 1
        );
        const segmentProgress = (newProgress * flights.length) - segmentIndex;

        setProgress(newProgress);
        setCurrentFlightIndex(segmentIndex);
        setFlightProgress(segmentProgress);

        // Update time reference
        pausedTimeRef.current = newProgress * totalDuration / speed;
        startTimeRef.current = performance.now() - pausedTimeRef.current;
    }, [flights.length, totalDuration, speed]);

    if (flights.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400">No flights to display</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <Globe
                ref={globeEl}
                globeImageUrl={GLOBE_TEXTURES[theme]}
                backgroundColor="rgba(0,0,0,0)"
                atmosphereColor={theme === 'night' ? '#00ffff' : '#4da6ff'}
                atmosphereAltitude={0.15}

                // Arcs
                arcsData={arcsData}
                arcColor="color"
                arcStroke={2}
                arcAltitude={0.1}
                arcAltitudeAutoScale={0.3}
                arcDashLength={(d: any) => d.progress}
                arcDashGap={2}
                arcDashInitialGap={(d: any) => 1 - d.progress}
                arcDashAnimateTime={0}
                // HTML Elements (airports + plane)
                htmlElementsData={htmlElements}
                htmlAltitude={(d: any) => d.isPlane && d.altitude !== undefined ? d.altitude : 0.03}
                htmlElement={(d: any) => {
                    const el = document.createElement('div');

                    if (d.isPlane) {
                        // Airplane marker with rotation
                        const currentFlight = flights[currentFlightIndex];
                        let rotation = 0;
                        if (currentFlight && planePosition) {
                            // Calculate bearing by looking slightly ahead on the path
                            const lookAheadProgress = Math.min(flightProgress + 0.01, 1);
                            const nextPos = interpolateGeodesicPoint(
                                currentFlight.originAirport.latitude,
                                currentFlight.originAirport.longitude,
                                currentFlight.destinationAirport.latitude,
                                currentFlight.destinationAirport.longitude,
                                lookAheadProgress
                            );
                            rotation = calculateBearing(
                                planePosition.lat,
                                planePosition.lng,
                                nextPos.lat,
                                nextPos.lng
                            );
                        }

                        el.innerHTML = `
                            <div style="
                                transform: translate(-50%, -50%) rotate(${rotation - 45}deg);
                                font-size: 28px;
                                filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
                                animation: pulse 1s ease-in-out infinite;
                            ">✈️</div>
                        `;
                        el.style.cssText = 'pointer-events: none;';
                    } else {
                        // Airport marker
                        const color = d.isOrigin ? '#00ffff' : d.isDestination ? '#ff6b6b' : '#0096ff';
                        const opacity = d.isActive ? 1 : 0.5;
                        const icon = d.isOrigin ? '🛫' : d.isDestination ? '🛬' : '📍';

                        el.innerHTML = `
                            <div style="
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                transform: translate(-50%, -50%);
                                pointer-events: none;
                                opacity: ${opacity};
                            ">
                                <div style="
                                    font-size: 18px;
                                    margin-bottom: 4px;
                                    filter: drop-shadow(0 0 8px ${color});
                                ">${icon}</div>
                                <div style="
                                    background: rgba(10, 14, 39, 0.95);
                                    padding: 4px 8px;
                                    border-radius: 6px;
                                    border: 2px solid ${color};
                                    box-shadow: 0 0 15px ${color}40;
                                ">
                                    <div style="
                                        color: ${color};
                                        font-weight: bold;
                                        font-size: 12px;
                                        text-align: center;
                                        text-shadow: 0 0 8px ${color};
                                    ">${d.text}</div>
                                    <div style="
                                        color: rgba(255, 255, 255, 0.7);
                                        font-size: 9px;
                                        text-align: center;
                                        margin-top: 2px;
                                    ">${d.city}</div>
                                </div>
                            </div>
                        `;
                    }
                    return el;
                }}

                // Controls
                enablePointerInteraction={true}
                animateIn={false}
            />

            {/* Controls Overlay */}
            {showControls && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
                    <GlobeControls
                        isPlaying={isPlaying}
                        onPlayPause={handlePlayPause}
                        speed={speed}
                        onSpeedChange={setSpeed}
                        progress={progress}
                        onProgressChange={handleProgressChange}
                        onReplay={handleReplay}
                        isCinemaMode={isCinemaMode}
                        onCinemaModeToggle={() => setIsCinemaMode(!isCinemaMode)}
                        theme={theme}
                        onThemeChange={setTheme}
                    />
                </div>
            )}

            {/* Flight Counter for multi-segment trips */}
            {flights.length > 1 && (
                <div className="absolute top-4 right-4 glass rounded-lg px-4 py-2 border border-white/10">
                    <span className="text-white font-medium">
                        Flight {currentFlightIndex + 1} of {flights.length}
                    </span>
                </div>
            )}
        </div>
    );
}
