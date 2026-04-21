/**
 * AnimatedJourneyGlobe Component
 *
 * Animated 3D globe used on the Trip detail page (and single-flight journey
 * pages). Plays a flight — or a sequence of flights in a trip — along a
 * geodesic arc while a plane marker traces the route.
 *
 * Capabilities:
 *   - Single flight or multi-segment trip animation
 *   - Animated geodesic path with a plane marker that rotates on its bearing
 *   - Play / pause / replay / scrub controls
 *   - Speed control (0.5x, 1x, 2x)
 *   - Three textures: night, day, satellite
 *   - Optional camera-follow that re-frames on each segment
 *   - Respects `prefers-reduced-motion` (renders final state, no animation)
 *   - Mobile-friendly compact controls
 *
 * Usage:
 *   // Single flight
 *   <AnimatedJourneyGlobe flight={flight} />
 *
 *   // Multi-segment trip
 *   <AnimatedJourneyGlobe flights={tripFlights} showControls />
 *
 * @returns A container div that renders a <Globe /> canvas plus a controls
 *          overlay. Parent decides width/height via CSS.
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Globe from 'react-globe.gl';
import type { Object3D } from 'three';
import type { Flight } from '../../types';
import {
    interpolateGeodesicPoint,
    calculateOptimalCameraPosition,
} from '../../utils/globeAnimations';
import GlobeControls from './GlobeControls';
import useReducedMotion from '../../hooks/useReducedMotion';
import { loadPlaneModel } from '../../utils/planeModel';
import {
    latLngToVector3,
    orientationQuaternion,
} from '../../utils/orientOnSphere';

/** Globe texture URLs per theme. */
const GLOBE_TEXTURES = {
    night: '//unpkg.com/three-globe/example/img/earth-night.jpg',
    day: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    satellite: '//unpkg.com/three-globe/example/img/earth-topology.png',
};

const SEGMENT_DURATION_MS = 4000;

/**
 * Props for {@link AnimatedJourneyGlobe}.
 */
interface AnimatedJourneyGlobeProps {
    /** Single flight (kept for backward compatibility). */
    flight?: Flight;
    /** Multiple flights (trip segments); rendered in chronological order. */
    flights?: Flight[];
    /** Show the on-screen controls overlay (default true). */
    showControls?: boolean;
    /** Auto-play on mount (default true). */
    autoPlay?: boolean;
    /** Initial globe texture (default 'day'). */
    initialTheme?: 'night' | 'day' | 'satellite';
}

/**
 * AnimatedJourneyGlobe
 *
 * @param flight       Single flight to animate.
 * @param flights      Multiple flights for a trip.
 * @param showControls Show play/pause + theme + speed overlay (default true).
 * @param autoPlay     Start playing on mount (default true).
 * @param initialTheme Starting globe texture theme.
 * @returns A div wrapping the animated Globe + controls.
 */
export default function AnimatedJourneyGlobe({
    flight,
    flights: propFlights,
    showControls = true,
    autoPlay = true,
    initialTheme = 'day',
}: AnimatedJourneyGlobeProps) {
    const globeEl = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const lastTickRef = useRef<number>(0);
    const elapsedRef = useRef<number>(0);

    const reduceMotion = useReducedMotion();

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Normalize to sorted array of flights
    const flights = useMemo(() => {
        if (propFlights && propFlights.length > 0) {
            return [...propFlights].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
        }
        if (flight) return [flight];
        return [];
    }, [flight, propFlights]);

    // Animation state
    const [isPlaying, setIsPlaying] = useState(autoPlay && !reduceMotion);
    const [speed, setSpeed] = useState(1);
    const [progress, setProgress] = useState(reduceMotion ? 1 : 0);
    const [currentFlightIndex, setCurrentFlightIndex] = useState(
        reduceMotion ? Math.max(0, flights.length - 1) : 0
    );
    const [flightProgress, setFlightProgress] = useState(reduceMotion ? 1 : 0);
    const [planePosition, setPlanePosition] = useState<
        { lat: number; lng: number; altitude?: number } | null
    >(null);

    const [isCinemaMode, setIsCinemaMode] = useState(false);
    const [cameraFollow, setCameraFollow] = useState(false);
    const [use3DPlane, setUse3DPlane] = useState(true);
    const [planeModelReady, setPlaneModelReady] = useState(false);
    const planeBaseRef = useRef<Object3D | null>(null);
    const [theme, setTheme] = useState<'night' | 'day' | 'satellite'>(initialTheme);

    const totalDuration = flights.length * SEGMENT_DURATION_MS;
    const isMobile = dimensions.width > 0 && dimensions.width < 640;

    /**
     * Track container dimensions using ResizeObserver so the canvas refits
     * when layout changes (sidebar, orientation, zoom).
     */
    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        const updateDimensions = () => {
            if (!containerRef.current) return;
            const { width, height } = containerRef.current.getBoundingClientRect();
            setDimensions({ width, height });
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(node);
        window.addEventListener('resize', updateDimensions);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    /**
     * Lazy-load the glTF plane model when the user turns on 3D mode for the
     * first time. The module-level cache in `planeModel.ts` ensures we only
     * fetch the ~2.7 MB GLB once per session, even across remounts.
     */
    useEffect(() => {
        if (!use3DPlane || planeBaseRef.current) return;
        let cancelled = false;
        loadPlaneModel()
            .then(base => {
                if (cancelled) return;
                planeBaseRef.current = base;
                setPlaneModelReady(true);
            })
            .catch(err => {
                // Fallback silently to 2D; the toggle lets the user retry.
                console.warn('[AnimatedJourneyGlobe] plane model failed to load', err);
            });
        return () => {
            cancelled = true;
        };
    }, [use3DPlane]);

    /**
     * Arc data — each segment's dash length grows with its progress so the
     * currently animating arc is drawn progressively.
     */
    const arcsData = useMemo(() => {
        if (flights.length === 0) return [];

        return flights.map((f, index) => {
            let arcProgress = 0;
            if (index < currentFlightIndex) arcProgress = 1;
            else if (index === currentFlightIndex) arcProgress = flightProgress;

            return {
                startLat: f.originAirport.latitude,
                startLng: f.originAirport.longitude,
                endLat: f.destinationAirport.latitude,
                endLng: f.destinationAirport.longitude,
                color:
                    index === currentFlightIndex
                        ? ['rgba(0, 255, 255, 0.9)', 'rgba(0, 150, 255, 0.9)']
                        : ['rgba(0, 255, 255, 0.4)', 'rgba(0, 150, 255, 0.4)'],
                progress: arcProgress,
                index,
            };
        });
    }, [flights, currentFlightIndex, flightProgress]);

    /**
     * Unique airport markers. Only keeps the first occurrence, but its
     * `isActive` flag is recomputed each render from the current segment so
     * airports light up in order.
     */
    const airportLabels = useMemo(() => {
        if (flights.length === 0) return [];

        type AirportLabel = {
            lat: number;
            lng: number;
            text: string;
            city: string;
            isOrigin: boolean;
            isDestination: boolean;
            isActive: boolean;
            segmentIndex: number;
        };

        const map = new Map<string, AirportLabel>();

        flights.forEach((f, index) => {
            if (!map.has(f.originAirport.iata)) {
                map.set(f.originAirport.iata, {
                    lat: f.originAirport.latitude,
                    lng: f.originAirport.longitude,
                    text: f.originAirport.iata,
                    city: f.originAirport.city,
                    isOrigin: index === 0,
                    isDestination: false,
                    isActive: index <= currentFlightIndex,
                    segmentIndex: index,
                });
            }
            if (!map.has(f.destinationAirport.iata)) {
                map.set(f.destinationAirport.iata, {
                    lat: f.destinationAirport.latitude,
                    lng: f.destinationAirport.longitude,
                    text: f.destinationAirport.iata,
                    city: f.destinationAirport.city,
                    isOrigin: false,
                    isDestination: index === flights.length - 1,
                    isActive:
                        index < currentFlightIndex ||
                        (index === currentFlightIndex && flightProgress > 0.9),
                    segmentIndex: index,
                });
            }
        });

        return Array.from(map.values());
    }, [flights, currentFlightIndex, flightProgress]);

    const planeMarkerData = useMemo(() => {
        if (!planePosition || !isPlaying) return [];
        // In 3D mode the plane is rendered as a three.js object via the
        // custom layer, so suppress the HTML marker to avoid double-planes.
        if (use3DPlane && planeModelReady) return [];
        return [
            {
                lat: planePosition.lat,
                lng: planePosition.lng,
                altitude: planePosition.altitude || 0,
                isPlane: true,
            },
        ];
    }, [planePosition, isPlaying, use3DPlane, planeModelReady]);

    const htmlElements = useMemo(
        () => [...airportLabels, ...planeMarkerData],
        [airportLabels, planeMarkerData]
    );

    /** Bearing (in degrees) from point A to point B — used to orient the plane. */
    const calculateBearing = useCallback(
        (lat1: number, lng1: number, lat2: number, lng2: number) => {
            const dLng = ((lng2 - lng1) * Math.PI) / 180;
            const lat1Rad = (lat1 * Math.PI) / 180;
            const lat2Rad = (lat2 * Math.PI) / 180;

            const y = Math.sin(dLng) * Math.cos(lat2Rad);
            const x =
                Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

            return (Math.atan2(y, x) * 180) / Math.PI;
        },
        []
    );

    /**
     * Single-entry data array for the custom three.js layer — populated only
     * when the 3D plane is active, the model is loaded, and we have a live
     * flight position to show. Each entry carries the bearing so the update
     * callback can orient the mesh without recomputing it.
     */
    const customPlaneData = useMemo(() => {
        if (!use3DPlane || !planeModelReady || !planePosition) return [];
        const currentFlight = flights[currentFlightIndex];
        if (!currentFlight) return [];
        const lookAheadProgress = Math.min(flightProgress + 0.01, 1);
        const nextPos = interpolateGeodesicPoint(
            currentFlight.originAirport.latitude,
            currentFlight.originAirport.longitude,
            currentFlight.destinationAirport.latitude,
            currentFlight.destinationAirport.longitude,
            lookAheadProgress
        );
        const bearing = calculateBearing(
            planePosition.lat,
            planePosition.lng,
            nextPos.lat,
            nextPos.lng
        );
        return [
            {
                lat: planePosition.lat,
                lng: planePosition.lng,
                altitude: planePosition.altitude ?? 0,
                bearing,
            },
        ];
    }, [
        use3DPlane,
        planeModelReady,
        planePosition,
        flights,
        currentFlightIndex,
        flightProgress,
        calculateBearing,
    ]);

    /**
     * Factory that returns a fresh clone of the cached plane model. Called by
     * react-globe.gl whenever a new entry appears in `customLayerData` — for
     * us, that's effectively once per render where the plane is visible.
     *
     * @returns A cloned `THREE.Object3D` ready to be added to the scene, or
     *          an empty group if the base model hasn't finished loading yet.
     */
    const customThreeObject = useCallback((): Object3D => {
        // customPlaneData is empty until planeBaseRef is populated, so this
        // ref is guaranteed non-null by the time react-globe.gl calls us.
        // The `!` is safe; if the guard in customPlaneData ever regresses we
        // prefer a loud error over a silent invisible object.
        return planeBaseRef.current!.clone(true);
    }, []);

    /**
     * Per-frame updater: positions the plane on the globe surface at the
     * current lat/lng/altitude and orients it along the great-circle bearing.
     * `GLOBE_RADIUS` = 100 matches three-globe's default; altitudes are
     * given as a fraction of radius (matching its arc/point units).
     *
     * @param obj Cloned plane `Object3D` returned by {@link customThreeObject}.
     * @param d   Entry from `customPlaneData` (lat, lng, altitude, bearing).
     */
    const customThreeObjectUpdate = useCallback(
        (obj: Object3D, objData: object) => {
            const d = objData as {
                lat: number;
                lng: number;
                altitude: number;
                bearing: number;
            };
            const pos = latLngToVector3(d.lat, d.lng, d.altitude, 100);
            obj.position.copy(pos);
            orientationQuaternion(d.lat, d.lng, d.bearing, obj.quaternion);
        },
        []
    );

    /**
     * Set up the initial camera whenever the flight list changes. We use a
     * dedicated effect so changes to `isPlaying` / `speed` don't reset the
     * camera or the elapsed time.
     */
    useEffect(() => {
        if (!globeEl.current || flights.length === 0) return;
        const firstFlight = flights[0];
        const cameraPos = calculateOptimalCameraPosition(
            firstFlight.originAirport.latitude,
            firstFlight.originAirport.longitude,
            firstFlight.destinationAirport.latitude,
            firstFlight.destinationAirport.longitude
        );
        globeEl.current.pointOfView(
            { lat: cameraPos.lat, lng: cameraPos.lng, altitude: cameraPos.altitude },
            reduceMotion ? 0 : 500
        );
    }, [flights, reduceMotion]);

    /**
     * Main animation loop. Kicked off once and kept alive until unmount.
     * Play/pause is handled by checking `isPlaying` inside the tick, so we no
     * longer re-run this effect (and lose timing) when the user pauses.
     */
    useEffect(() => {
        if (flights.length === 0 || reduceMotion) return;

        lastTickRef.current = performance.now();

        const tick = (now: number) => {
            const dt = now - lastTickRef.current;
            lastTickRef.current = now;

            if (isPlaying && elapsedRef.current < totalDuration) {
                elapsedRef.current = Math.min(
                    elapsedRef.current + dt * speed,
                    totalDuration
                );
                const overall = elapsedRef.current / totalDuration;
                setProgress(overall);

                const segmentIndex = Math.min(
                    Math.floor(overall * flights.length),
                    flights.length - 1
                );
                const segmentProgress = overall * flights.length - segmentIndex;

                setCurrentFlightIndex(segmentIndex);
                setFlightProgress(Math.min(segmentProgress, 1));

                const currentFlight = flights[segmentIndex];
                if (currentFlight && segmentProgress > 0 && segmentProgress < 1) {
                    const position = interpolateGeodesicPoint(
                        currentFlight.originAirport.latitude,
                        currentFlight.originAirport.longitude,
                        currentFlight.destinationAirport.latitude,
                        currentFlight.destinationAirport.longitude,
                        segmentProgress
                    );
                    // Parabolic altitude: 0 at endpoints, peaks at midpoint.
                    const altitudeFactor = 1 - Math.pow(2 * segmentProgress - 1, 2);
                    position.altitude = 0.1 * altitudeFactor;
                    setPlanePosition(position);

                    // Camera follow: smoothly recenter on the plane. Cinema
                    // mode pulls the camera back for a wider cinematic view.
                    if (cameraFollow && globeEl.current) {
                        const framing = calculateOptimalCameraPosition(
                            currentFlight.originAirport.latitude,
                            currentFlight.originAirport.longitude,
                            currentFlight.destinationAirport.latitude,
                            currentFlight.destinationAirport.longitude
                        );
                        // Tighter "chase" altitude when 3D plane is active so
                        // the model reads as a proper hero subject instead of
                        // a distant dot.
                        const chaseAltitude = use3DPlane
                            ? 0.6
                            : framing.altitude;
                        globeEl.current.pointOfView(
                            {
                                lat: position.lat,
                                lng: position.lng,
                                altitude: isCinemaMode ? 2.2 : chaseAltitude,
                            },
                            200
                        );
                    } else if (isCinemaMode && globeEl.current) {
                        const view = globeEl.current.pointOfView();
                        globeEl.current.pointOfView(
                            { ...view, lng: view.lng + dt * 0.005 },
                            0
                        );
                    }
                } else if (segmentProgress >= 1) {
                    setPlanePosition(null);
                }

                if (elapsedRef.current >= totalDuration) {
                    setIsPlaying(false);
                }
            }

            animationRef.current = requestAnimationFrame(tick);
        };

        animationRef.current = requestAnimationFrame(tick);
        return () => {
            if (animationRef.current != null) cancelAnimationFrame(animationRef.current);
        };
    }, [flights, totalDuration, isPlaying, speed, cameraFollow, isCinemaMode, reduceMotion, use3DPlane]);

    const handlePlayPause = useCallback(() => {
        if (elapsedRef.current >= totalDuration) {
            elapsedRef.current = 0;
            setProgress(0);
            setCurrentFlightIndex(0);
            setFlightProgress(0);
        }
        setIsPlaying(prev => !prev);
    }, [totalDuration]);

    const handleReplay = useCallback(() => {
        elapsedRef.current = 0;
        setProgress(0);
        setCurrentFlightIndex(0);
        setFlightProgress(0);
        setPlanePosition(null);
        setIsPlaying(true);
    }, []);

    const handleProgressChange = useCallback(
        (newProgress: number) => {
            const clamped = Math.max(0, Math.min(1, newProgress));
            elapsedRef.current = clamped * totalDuration;
            setProgress(clamped);
            const segmentIndex = Math.min(
                Math.floor(clamped * flights.length),
                flights.length - 1
            );
            const segmentProgress = clamped * flights.length - segmentIndex;
            setCurrentFlightIndex(segmentIndex);
            setFlightProgress(Math.min(segmentProgress, 1));
        },
        [flights.length, totalDuration]
    );

    if (flights.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400">No flights to display</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full">
            {dimensions.width > 0 && dimensions.height > 0 && (
                <Globe
                    ref={globeEl}
                    width={dimensions.width}
                    height={dimensions.height}
                    globeImageUrl={GLOBE_TEXTURES[theme]}
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                    backgroundColor="rgba(0,0,0,0)"
                    atmosphereColor={theme === 'night' ? '#00ffff' : '#4da6ff'}
                    atmosphereAltitude={isMobile ? 0.12 : 0.15}

                    arcsData={arcsData}
                    arcColor="color"
                    arcStroke={isMobile ? 0.4 : 0.5}
                    arcAltitude={0.1}
                    arcAltitudeAutoScale={0.3}
                    arcDashLength={(d: any) => d.progress}
                    arcDashGap={2}
                    arcDashInitialGap={(d: any) => 1 - d.progress}
                    arcDashAnimateTime={0}

                    customLayerData={customPlaneData}
                    customThreeObject={customThreeObject}
                    customThreeObjectUpdate={customThreeObjectUpdate}

                    htmlElementsData={htmlElements}
                    htmlAltitude={(d: any) =>
                        d.isPlane && d.altitude !== undefined ? d.altitude : 0.03
                    }
                    htmlElement={(d: any) => {
                        const el = document.createElement('div');

                        if (d.isPlane) {
                            const currentFlight = flights[currentFlightIndex];
                            let rotation = 0;
                            if (currentFlight && planePosition) {
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

                            // SVG plane rotates on its bearing; emoji fallback was too fuzzy at high DPI.
                            el.innerHTML = `
                                <div style="
                                    transform: translate(-50%, -50%) rotate(${rotation}deg);
                                    filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.9));
                                    pointer-events: none;
                                ">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.5 19L21.5 12L2.5 5L2.5 10L15 12L2.5 14L2.5 19Z"
                                              fill="#00ffff" stroke="#0a0e27" stroke-width="0.8" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            `;
                            return el;
                        }

                        const color = d.isOrigin
                            ? '#00ffff'
                            : d.isDestination
                                ? '#ff6b6b'
                                : '#0096ff';
                        const opacity = d.isActive ? 1 : 0.5;
                        const icon = d.isOrigin ? '🛫' : d.isDestination ? '🛬' : '📍';
                        const textSize = isMobile ? 11 : 12;
                        const citySize = isMobile ? 8 : 9;

                        el.innerHTML = `
                            <div style="
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                transform: translate(-50%, -50%);
                                pointer-events: none;
                                opacity: ${opacity};
                                transition: opacity 400ms ease;
                            ">
                                <div style="
                                    font-size: ${isMobile ? 16 : 18}px;
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
                                        font-size: ${textSize}px;
                                        text-align: center;
                                        text-shadow: 0 0 8px ${color};
                                        line-height: 1;
                                    ">${d.text}</div>
                                    <div style="
                                        color: rgba(255, 255, 255, 0.75);
                                        font-size: ${citySize}px;
                                        text-align: center;
                                        margin-top: 2px;
                                        line-height: 1;
                                    ">${d.city}</div>
                                </div>
                            </div>
                        `;
                        return el;
                    }}

                    enablePointerInteraction={true}
                    animateIn={!reduceMotion}
                />
            )}

            {/* Controls overlay */}
            {showControls && (
                <div
                    className={`absolute ${
                        isMobile ? 'bottom-2 left-2 right-2' : 'bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-4'
                    } z-20`}
                >
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
                        showCinemaMode={!isMobile}
                        compact={isMobile}
                        cameraFollow={cameraFollow}
                        onCameraFollowToggle={() => setCameraFollow(v => !v)}
                        use3DPlane={use3DPlane}
                        on3DPlaneToggle={() => setUse3DPlane(v => !v)}
                    />
                </div>
            )}

            {/* Flight counter for multi-segment trips */}
            {flights.length > 1 && (
                <div className="absolute top-4 right-4 glass rounded-lg px-3 py-1.5 border border-white/10 text-sm">
                    <span className="text-white font-medium">
                        Flight {currentFlightIndex + 1} of {flights.length}
                    </span>
                    {flights[currentFlightIndex] && (
                        <span className="ml-2 text-gray-400 hidden sm:inline">
                            {flights[currentFlightIndex].originAirport.iata} →{' '}
                            {flights[currentFlightIndex].destinationAirport.iata}
                        </span>
                    )}
                </div>
            )}

            {/* Reduced-motion hint */}
            {reduceMotion && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-3 py-1 border border-white/10 text-xs text-gray-300">
                    Animation disabled (reduced motion)
                </div>
            )}
        </div>
    );
}
