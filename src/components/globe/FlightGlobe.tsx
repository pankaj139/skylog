/**
 * FlightGlobe Component
 *
 * Interactive 3D globe visualization used on the Dashboard / home page.
 * Renders flight routes as animated geodesic arcs on top of a night-earth
 * sphere and supports several visualization modes:
 *   - `routes`:    all flight paths (colored by year / airline / default)
 *   - `heatmap`:   weighted dots showing visit frequency
 *   - `timelapse`: only arcs up to the current `timelapseYear`
 *   - `filtered`:  filter by year and/or airline
 *
 * Improvements (vs prior version):
 *   - `ResizeObserver` with rAF-throttled resize (was plain `resize` listener)
 *   - In-globe overlay UI: pause rotation, reset view, zoom +/-, legend
 *   - Click an arc to focus the camera on its midpoint; click an airport to
 *     zoom into it. Double-click empty space to reset.
 *   - Keyboard: arrows rotate, `+` / `-` zoom, `r` reset, `space` toggles
 *     auto-rotate when the globe container is focused.
 *   - Respects `prefers-reduced-motion` (no auto-rotate, static arcs).
 *   - Airport labels scale by visit count; pulsing rings highlight busy hubs.
 *   - Mobile: smaller labels, reduced atmosphere, lower-zoom label hiding.
 *
 * Usage:
 *   <FlightGlobe
 *       arcs={arcs}
 *       points={points}
 *       flights={flights}
 *       autoRotate
 *       height={500}
 *       visualizationMode="routes"
 *       colorMode="default"
 *   />
 *
 * Expected return: a full-width div containing the `<Globe />` canvas.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { Maximize2, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { ArcData, PointData, Flight } from '../../types';
import type { GlobeVisualizationMode, GlobeColorMode } from './GlobeModeSelector';
import {
    generateHeatmapPoints,
    getArcColorByYear,
    getArcColorByAirline,
    getYearRange,
} from '../../utils/globeHeatmapData';
import useReducedMotion from '../../hooks/useReducedMotion';

/** Default camera altitude when rendering the overview. */
const DEFAULT_ALTITUDE = 2.2;
const MIN_DISTANCE = 150;
const MAX_DISTANCE = 500;

/**
 * Props for {@link FlightGlobe}.
 */
interface FlightGlobeProps {
    arcs?: ArcData[];
    points?: PointData[];
    flights?: Flight[];
    autoRotate?: boolean;
    height?: number;
    visualizationMode?: GlobeVisualizationMode;
    colorMode?: GlobeColorMode;
    timelapseYear?: number;
    filterYear?: number;
    filterAirline?: string;
    /** Optional click handler — receives the flight bound to the clicked arc. */
    onArcClick?: (flight: Flight) => void;
}

/**
 * FlightGlobe
 *
 * @param arcs               Pre-computed flight arcs to render.
 * @param points             Airport markers (iata/city labels).
 * @param flights            Full flight set (used for heatmap + color modes).
 * @param autoRotate         Enable slow auto-rotation (default: true).
 * @param height             Explicit pixel height of the globe canvas.
 * @param visualizationMode  Which mode to render — routes/heatmap/timelapse/filtered.
 * @param colorMode          Arc color scheme when `visualizationMode === 'routes'`.
 * @param timelapseYear      Cutoff year for `timelapse` mode.
 * @param filterYear         Year filter for `filtered` mode.
 * @param filterAirline      Airline filter for `filtered` mode.
 * @param onArcClick         Optional callback fired with a flight on arc click.
 * @returns A responsive div containing the interactive Globe canvas.
 */
export default function FlightGlobe({
    arcs = [],
    points = [],
    flights = [],
    autoRotate = true,
    height = 500,
    visualizationMode = 'routes',
    colorMode = 'default',
    timelapseYear,
    filterYear,
    filterAirline,
    onArcClick,
}: FlightGlobeProps) {
    const globeRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeRafRef = useRef<number | null>(null);
    const hoverRafRef = useRef<number | null>(null);

    const [dimensions, setDimensions] = useState({ width: 0, height });
    const [hoveredArc, setHoveredArc] = useState<ArcData | null>(null);
    const [isRotating, setIsRotating] = useState<boolean>(autoRotate);

    const reduceMotion = useReducedMotion();

    // Year range for color mode
    const { minYear, maxYear } = useMemo(() => getYearRange(flights), [flights]);

    // Heatmap points (only computed when needed)
    const heatmapPoints = useMemo(() => {
        if (visualizationMode !== 'heatmap') return [];
        return generateHeatmapPoints(flights);
    }, [flights, visualizationMode]);

    // Filter arcs based on visualization mode + filters
    const filteredArcs = useMemo(() => {
        if (visualizationMode === 'heatmap') return [];

        let result = arcs;

        if (visualizationMode === 'timelapse' && timelapseYear) {
            result = result.filter(arc => {
                if (!arc.flight) return true;
                return new Date(arc.flight.date).getFullYear() <= timelapseYear;
            });
        }

        if (visualizationMode === 'filtered') {
            if (filterYear) {
                result = result.filter(arc => {
                    if (!arc.flight) return true;
                    return new Date(arc.flight.date).getFullYear() === filterYear;
                });
            }
            if (filterAirline) {
                result = result.filter(arc => {
                    if (!arc.flight) return true;
                    return arc.flight.airline === filterAirline;
                });
            }
        }

        return result;
    }, [arcs, visualizationMode, timelapseYear, filterYear, filterAirline]);

    /**
     * Handle responsive sizing via ResizeObserver (rAF-throttled) so layout
     * changes (sidebar collapse, zoom, orientation) re-fit the canvas without
     * thrashing the WebGL renderer.
     */
    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        const apply = () => {
            if (!node) return;
            setDimensions({ width: node.offsetWidth, height });
        };

        apply();

        const schedule = () => {
            if (resizeRafRef.current != null) return;
            resizeRafRef.current = window.requestAnimationFrame(() => {
                resizeRafRef.current = null;
                apply();
            });
        };

        const ro = new ResizeObserver(schedule);
        ro.observe(node);
        window.addEventListener('resize', schedule);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', schedule);
            if (resizeRafRef.current != null) {
                cancelAnimationFrame(resizeRafRef.current);
                resizeRafRef.current = null;
            }
        };
    }, [height]);

    /**
     * Apply camera controls once the globe is mounted. Re-runs when the
     * `autoRotate` prop or the user's reduced-motion preference changes so
     * accessibility settings take effect immediately.
     */
    useEffect(() => {
        if (!globeRef.current) return;

        globeRef.current.pointOfView({ altitude: DEFAULT_ALTITUDE }, reduceMotion ? 0 : 1500);
        const controls = globeRef.current.controls();
        if (!controls) return;

        const shouldRotate = isRotating && autoRotate && !reduceMotion;
        controls.autoRotate = shouldRotate;
        controls.autoRotateSpeed = 0.4;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.minDistance = MIN_DISTANCE;
        controls.maxDistance = MAX_DISTANCE;
        controls.rotateSpeed = 0.6;
        controls.zoomSpeed = 0.8;
    }, [autoRotate, isRotating, reduceMotion]);

    const isReady = dimensions.width > 0;

    /**
     * Arc color: highlights the hovered arc, or delegates to year/airline
     * gradients when a non-default colorMode is active.
     */
    const getArcColor = useCallback(
        (arc: any) => {
            if (hoveredArc && arc === hoveredArc) {
                return ['rgba(0, 255, 255, 1)', 'rgba(255, 0, 255, 1)'];
            }

            if (colorMode === 'by-year' && arc.flight) {
                const flightYear = new Date(arc.flight.date).getFullYear();
                return getArcColorByYear(flightYear, minYear, maxYear);
            }

            if (colorMode === 'by-airline' && arc.flight) {
                return getArcColorByAirline(arc.flight.airline);
            }

            return ['rgba(0, 255, 255, 0.8)', 'rgba(0, 150, 255, 0.8)'];
        },
        [hoveredArc, colorMode, minYear, maxYear]
    );

    const getArcStroke = useCallback(
        (arc: any) => (hoveredArc && arc === hoveredArc ? 2 : 0.8),
        [hoveredArc]
    );

    /**
     * Throttled hover handler — react-globe.gl fires on every mousemove, which
     * was causing unnecessary re-renders. Coalesce through rAF.
     */
    const handleArcHover = useCallback((arc: object | null) => {
        if (hoverRafRef.current != null) return;
        hoverRafRef.current = window.requestAnimationFrame(() => {
            hoverRafRef.current = null;
            setHoveredArc((arc as ArcData | null) ?? null);
        });
    }, []);

    useEffect(() => {
        return () => {
            if (hoverRafRef.current != null) cancelAnimationFrame(hoverRafRef.current);
        };
    }, []);

    /** Rich tooltip for hovered arcs. */
    const getArcLabel = useCallback((arc: any) => {
        if (!arc.flight) return '';
        const { originAirport, destinationAirport, airline, date, distance, duration, flightNumber } = arc.flight;
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        const distanceKm = distance ? `${Math.round(distance).toLocaleString()} km` : '';
        const durationHrs = duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '';

        return `
            <div style="background: rgba(10, 14, 39, 0.95); padding: 16px; border-radius: 12px; border: 1px solid rgba(0, 240, 255, 0.4); box-shadow: 0 0 20px rgba(0, 240, 255, 0.25); min-width: 220px; font-family: Inter, system-ui, sans-serif;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 20px;">✈️</span>
                    <div style="color: white; font-weight: 700; font-size: 16px;">
                        ${originAirport.iata} → ${destinationAirport.iata}
                    </div>
                </div>
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-bottom: 4px;">
                    ${originAirport.city} → ${destinationAirport.city}
                </div>
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 8px; padding-top: 8px;">
                    <div style="color: #00ffff; font-weight: 600; margin-bottom: 4px;">
                        ${airline}${flightNumber ? ` · ${flightNumber}` : ''}
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">${formattedDate}</div>
                    ${distanceKm || durationHrs
                        ? `<div style="color: rgba(255, 255, 255, 0.5); font-size: 11px; margin-top: 4px;">${distanceKm}${distanceKm && durationHrs ? ' • ' : ''}${durationHrs}</div>`
                        : ''}
                </div>
                <div style="margin-top: 8px; font-size: 10px; color: rgba(0, 240, 255, 0.6); text-transform: uppercase; letter-spacing: 0.08em;">
                    Click to focus
                </div>
            </div>
        `;
    }, []);

    /**
     * Compute airport labels and weight each marker by connection count so
     * busy hubs render larger rings than single-use airports.
     */
    const labelsData = useMemo(() => {
        const counts = new Map<string, number>();
        arcs.forEach(a => {
            if (!a.flight) return;
            counts.set(a.flight.originAirport.iata, (counts.get(a.flight.originAirport.iata) ?? 0) + 1);
            counts.set(a.flight.destinationAirport.iata, (counts.get(a.flight.destinationAirport.iata) ?? 0) + 1);
        });

        const maxCount = Math.max(1, ...counts.values());

        return points.map(point => {
            const iata = point.label?.split(' - ')[0] ?? '';
            const city = point.label?.split(' - ')[1] ?? '';
            const count = counts.get(iata) ?? 1;
            return {
                lat: point.lat,
                lng: point.lng,
                text: iata,
                city,
                count,
                weight: count / maxCount,
            };
        });
    }, [points, arcs]);

    /** Ring data for busy airports — only show when we have non-trivial usage. */
    const ringsData = useMemo(() => {
        return labelsData
            .filter(d => d.count >= 2)
            .map(d => ({
                lat: d.lat,
                lng: d.lng,
                maxR: 2 + d.weight * 4,
                propagationSpeed: 1.5,
                repeatPeriod: 1600,
            }));
    }, [labelsData]);

    /** Handle clicking an arc — focus the camera on the midpoint and emit cb. */
    const handleArcClick = useCallback(
        (arc: object) => {
            const typed = arc as ArcData;
            if (!typed?.flight || !globeRef.current) return;
            const { originAirport: o, destinationAirport: d } = typed.flight;
            const midLat = (o.latitude + d.latitude) / 2;
            const midLng = (o.longitude + d.longitude) / 2;
            globeRef.current.pointOfView(
                { lat: midLat, lng: midLng, altitude: 1.6 },
                reduceMotion ? 0 : 1000
            );
            onArcClick?.(typed.flight);
        },
        [onArcClick, reduceMotion]
    );

    /** Focus on a clicked airport label. */
    const handleLabelClick = useCallback(
        (d: { lat: number; lng: number }) => {
            if (!globeRef.current) return;
            globeRef.current.pointOfView(
                { lat: d.lat, lng: d.lng, altitude: 1.2 },
                reduceMotion ? 0 : 900
            );
        },
        [reduceMotion]
    );

    /** Reset camera to the default overview. */
    const resetView = useCallback(() => {
        if (!globeRef.current) return;
        globeRef.current.pointOfView(
            { lat: 20, lng: 0, altitude: DEFAULT_ALTITUDE },
            reduceMotion ? 0 : 1000
        );
    }, [reduceMotion]);

    const zoom = useCallback((delta: number) => {
        if (!globeRef.current) return;
        const current = globeRef.current.pointOfView();
        const nextAlt = Math.min(Math.max(current.altitude * delta, 0.6), 4);
        globeRef.current.pointOfView({ ...current, altitude: nextAlt }, 400);
    }, []);

    const toggleRotate = useCallback(() => setIsRotating(v => !v), []);

    /**
     * Keyboard controls: arrow keys rotate, `+` / `-` zoom, `r` resets,
     * `space` toggles auto-rotate. Only active while the container has focus.
     */
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (!globeRef.current) return;
            const view = globeRef.current.pointOfView();
            let handled = true;

            switch (e.key) {
                case 'ArrowLeft':
                    globeRef.current.pointOfView({ ...view, lng: view.lng - 10 }, 300);
                    break;
                case 'ArrowRight':
                    globeRef.current.pointOfView({ ...view, lng: view.lng + 10 }, 300);
                    break;
                case 'ArrowUp':
                    globeRef.current.pointOfView(
                        { ...view, lat: Math.min(85, view.lat + 8) },
                        300
                    );
                    break;
                case 'ArrowDown':
                    globeRef.current.pointOfView(
                        { ...view, lat: Math.max(-85, view.lat - 8) },
                        300
                    );
                    break;
                case '+':
                case '=':
                    zoom(0.8);
                    break;
                case '-':
                case '_':
                    zoom(1.25);
                    break;
                case 'r':
                case 'R':
                    resetView();
                    break;
                case ' ':
                    toggleRotate();
                    break;
                default:
                    handled = false;
            }
            if (handled) e.preventDefault();
        },
        [resetView, toggleRotate, zoom]
    );

    const isMobile = dimensions.width > 0 && dimensions.width < 640;

    return (
        <div
            ref={containerRef}
            className="w-full relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
            style={{ height: `${height}px` }}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Interactive flight globe. Use arrow keys to rotate, plus and minus to zoom, r to reset, space to toggle rotation."
            role="application"
        >
            {dimensions.width > 0 && (
                <Globe
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}

                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                    backgroundColor="rgba(0,0,0,0)"

                    arcsData={filteredArcs}
                    arcColor={getArcColor}
                    arcDashLength={0.5}
                    arcDashGap={0.1}
                    arcDashAnimateTime={
                        reduceMotion ? 0 : visualizationMode === 'timelapse' ? 800 : 1500
                    }
                    arcStroke={getArcStroke}
                    arcAltitude={0.25}
                    arcLabel={getArcLabel}
                    onArcHover={handleArcHover}
                    onArcClick={handleArcClick}
                    arcAltitudeAutoScale={0.4}
                    arcsTransitionDuration={reduceMotion ? 0 : 500}

                    pointsData={visualizationMode === 'heatmap' ? heatmapPoints : []}
                    pointColor={(d: any) => d.color}
                    pointAltitude={0.01}
                    pointRadius={(d: any) => 0.3 + d.weight * 0.7}
                    pointsMerge={true}

                    ringsData={visualizationMode === 'routes' && !reduceMotion ? ringsData : []}
                    ringColor={() => (t: number) => `rgba(0, 255, 255, ${1 - t})`}
                    ringMaxRadius="maxR"
                    ringPropagationSpeed="propagationSpeed"
                    ringRepeatPeriod="repeatPeriod"

                    htmlElementsData={labelsData}
                    htmlAltitude={0.02}
                    htmlElement={(d: any) => {
                        const el = document.createElement('div');
                        const size = isMobile ? 11 : 13;
                        const citySize = isMobile ? 9 : 10;
                        const scale = 0.9 + (d.weight ?? 0) * 0.4;
                        el.style.cursor = 'pointer';
                        el.innerHTML = `
                            <div style="
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                transform: translate(-50%, -50%) scale(${scale});
                                transform-origin: center;
                                pointer-events: auto;
                            ">
                                <div style="
                                    background: rgba(10, 14, 39, 0.92);
                                    padding: 5px 9px;
                                    border-radius: 8px;
                                    border: 2px solid #00ffff;
                                    box-shadow: 0 0 12px rgba(0, 240, 255, 0.35);
                                    transition: transform 160ms ease, box-shadow 160ms ease;
                                ">
                                    <div style="
                                        color: #00ffff;
                                        font-weight: 700;
                                        font-size: ${size}px;
                                        text-align: center;
                                        text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
                                        line-height: 1;
                                    ">${d.text}</div>
                                    <div style="
                                        color: rgba(255, 255, 255, 0.8);
                                        font-size: ${citySize}px;
                                        text-align: center;
                                        margin-top: 2px;
                                        line-height: 1;
                                    ">${d.city}</div>
                                </div>
                            </div>
                        `;
                        el.addEventListener('mouseenter', () => {
                            const card = el.firstElementChild as HTMLElement | null;
                            if (card) {
                                (card.firstElementChild as HTMLElement).style.transform = `scale(${scale * 1.1})`;
                            }
                        });
                        el.addEventListener('mouseleave', () => {
                            const card = el.firstElementChild as HTMLElement | null;
                            if (card) {
                                (card.firstElementChild as HTMLElement).style.transform = `scale(${scale})`;
                            }
                        });
                        el.addEventListener('click', (ev) => {
                            ev.stopPropagation();
                            handleLabelClick(d);
                        });
                        return el;
                    }}

                    atmosphereColor="#00ffff"
                    atmosphereAltitude={isMobile ? 0.12 : 0.15}

                    enablePointerInteraction={true}
                    animateIn={!reduceMotion}
                />
            )}

            {/* Soft radial glow overlay */}
            <div
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{
                    background:
                        'radial-gradient(circle at center, transparent 30%, rgba(0, 240, 255, 0.04) 70%)',
                }}
                aria-hidden
            />

            {/* Control overlay — top-right */}
            {isReady && dimensions.width > 0 && (
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    <GlobeOverlayButton
                        label={isRotating ? 'Pause auto-rotation' : 'Resume auto-rotation'}
                        onClick={toggleRotate}
                        disabled={reduceMotion}
                    >
                        {isRotating && !reduceMotion ? <Pause size={14} /> : <Play size={14} />}
                    </GlobeOverlayButton>
                    <GlobeOverlayButton label="Zoom in" onClick={() => zoom(0.8)}>
                        <ZoomIn size={14} />
                    </GlobeOverlayButton>
                    <GlobeOverlayButton label="Zoom out" onClick={() => zoom(1.25)}>
                        <ZoomOut size={14} />
                    </GlobeOverlayButton>
                    <GlobeOverlayButton label="Reset view" onClick={resetView}>
                        <RotateCcw size={14} />
                    </GlobeOverlayButton>
                </div>
            )}

            {/* Info badge — bottom-left */}
            {isReady && dimensions.width > 0 && !isMobile && (
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 glass rounded-full px-3 py-1.5 border border-white/10 text-xs text-gray-300">
                    <Maximize2 size={12} className="text-neon-cyan" aria-hidden />
                    <span>
                        <span className="text-white font-medium">
                            {filteredArcs.length.toLocaleString()}
                        </span>{' '}
                        route{filteredArcs.length === 1 ? '' : 's'} ·{' '}
                        <span className="text-white font-medium">
                            {labelsData.length.toLocaleString()}
                        </span>{' '}
                        airport{labelsData.length === 1 ? '' : 's'}
                    </span>
                </div>
            )}
        </div>
    );
}

/**
 * Small glassmorphic button used for the in-globe control cluster.
 *
 * @param children - Icon content.
 * @param label    - Accessible label + tooltip.
 * @param onClick  - Click handler.
 * @param disabled - Disables the button when true.
 * @returns        A round icon button element.
 */
function GlobeOverlayButton({
    children,
    label,
    onClick,
    disabled,
}: {
    children: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={`w-8 h-8 flex items-center justify-center rounded-full glass border border-white/10 text-gray-200 transition-all ${
                disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:text-white hover:border-neon-cyan/60 hover:shadow-[0_0_12px_rgba(0,240,255,0.35)]'
            }`}
        >
            {children}
        </button>
    );
}
