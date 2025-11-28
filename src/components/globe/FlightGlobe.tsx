/**
 * FlightGlobe Component - Phase 3 Enhanced
 * 
 * 3D globe visualization with multiple display modes:
 * - Routes: All flight paths with various color schemes
 * - Heatmap: Visit frequency visualization
 * - Time-lapse: Chronological animation
 * - Filtered: Year/airline filtered view
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';
import type { ArcData, PointData, Flight } from '../../types';
import type { GlobeVisualizationMode, GlobeColorMode } from './GlobeModeSelector';
import { 
    generateHeatmapPoints,
    getArcColorByYear,
    getArcColorByAirline,
    getYearRange,
} from '../../utils/globeHeatmapData';

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
}

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
}: FlightGlobeProps) {
    const globeRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height });
    const [hoveredArc, setHoveredArc] = useState<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate year range for color mode
    const { minYear, maxYear } = useMemo(() => getYearRange(flights), [flights]);

    // Generate heatmap data
    const heatmapPoints = useMemo(() => {
        if (visualizationMode !== 'heatmap') return [];
        return generateHeatmapPoints(flights);
    }, [flights, visualizationMode]);

    // Filter arcs based on mode and filters
    const filteredArcs = useMemo(() => {
        if (visualizationMode === 'heatmap') return [];
        
        let result = [...arcs];

        // Apply time-lapse filter
        if (visualizationMode === 'timelapse' && timelapseYear) {
            result = result.filter(arc => {
                if (arc.flight) {
                    const flightYear = new Date(arc.flight.date).getFullYear();
                    return flightYear <= timelapseYear;
                }
                return true;
            });
        }

        // Apply filters
        if (visualizationMode === 'filtered') {
            if (filterYear) {
                result = result.filter(arc => {
                    if (arc.flight) {
                        return new Date(arc.flight.date).getFullYear() === filterYear;
                    }
                    return true;
                });
            }
            if (filterAirline) {
                result = result.filter(arc => {
                    if (arc.flight) {
                        return arc.flight.airline === filterAirline;
                    }
                    return true;
                });
            }
        }

        return result;
    }, [arcs, visualizationMode, timelapseYear, filterYear, filterAirline]);

    useEffect(() => {
        // Set initial size
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: height
            });
        }

        // Handle resize
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: height
                });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [height]);

    useEffect(() => {
        if (globeRef.current) {
            // Set initial view with smooth animation
            globeRef.current.pointOfView({ altitude: 2.2 }, 1500);

            // Enable auto-rotation with smooth controls
            if (autoRotate) {
                const controls = globeRef.current.controls();
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.4;
                controls.enableZoom = true;
                controls.enablePan = false;
                controls.minDistance = 150;
                controls.maxDistance = 500;
            }
        }
    }, [autoRotate]);

    const getArcColor = useCallback((arc: any) => {
        // Hover effect
        if (hoveredArc && arc === hoveredArc) {
            return ['rgba(0, 255, 255, 1)', 'rgba(255, 0, 255, 1)'];
        }

        // Color by mode
        if (colorMode === 'by-year' && arc.flight) {
            const flightYear = new Date(arc.flight.date).getFullYear();
            return getArcColorByYear(flightYear, minYear, maxYear);
        }

        if (colorMode === 'by-airline' && arc.flight) {
            return getArcColorByAirline(arc.flight.airline);
        }

        // Default cyan color
        return ['rgba(0, 255, 255, 0.8)', 'rgba(0, 150, 255, 0.8)'];
    }, [hoveredArc, colorMode, minYear, maxYear]);

    const getArcStroke = useCallback((arc: any) => {
        return hoveredArc && arc === hoveredArc ? 2 : 0.8;
    }, [hoveredArc]);

    const getArcLabel = useCallback((arc: any) => {
        if (arc.flight) {
            const { originAirport, destinationAirport, airline, date, distance, duration } = arc.flight;
            const formattedDate = new Date(date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
            const distanceKm = distance ? `${Math.round(distance).toLocaleString()} km` : '';
            const durationHrs = duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '';
            
            return `
                <div style="background: rgba(10, 14, 39, 0.95); padding: 16px; border-radius: 12px; border: 1px solid rgba(0, 240, 255, 0.4); box-shadow: 0 0 20px rgba(0, 240, 255, 0.2); min-width: 200px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 20px;">✈️</span>
                        <div style="color: white; font-weight: bold; font-size: 16px;">
                            ${originAirport.iata} → ${destinationAirport.iata}
                        </div>
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-bottom: 4px;">
                        ${originAirport.city} → ${destinationAirport.city}
                    </div>
                    <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 8px 0; padding-top: 8px;">
                        <div style="color: #00ffff; font-weight: 600; margin-bottom: 4px;">${airline}</div>
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">${formattedDate}</div>
                        ${distanceKm || durationHrs ? `
                            <div style="color: rgba(255, 255, 255, 0.5); font-size: 11px; margin-top: 4px;">
                                ${distanceKm}${distanceKm && durationHrs ? ' • ' : ''}${durationHrs}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        return '';
    }, []);

    // HTML labels for airports (always visible)
    const labelsData = useMemo(() => {
        return points.map(point => ({
            lat: point.lat,
            lng: point.lng,
            text: point.label?.split(' - ')[0] || '', // IATA code
            city: point.label?.split(' - ')[1] || '', // City name
            color: '#00ffff',
            size: 1.5,
        }));
    }, [points]);

    return (
        <div ref={containerRef} className="w-full relative" style={{ height: `${height}px` }}>
            {dimensions.width > 0 && (
                <Globe
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}

                    // Globe appearance - matching JourneyDetail style
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                    backgroundColor="rgba(0,0,0,0)"

                    // Arcs (flight paths) - enhanced styling
                    arcsData={filteredArcs}
                    arcColor={getArcColor}
                    arcDashLength={0.5}
                    arcDashGap={0.1}
                    arcDashAnimateTime={visualizationMode === 'timelapse' ? 800 : 1500}
                    arcStroke={getArcStroke}
                    arcAltitude={0.25}
                    arcLabel={getArcLabel}
                    onArcHover={setHoveredArc}
                    arcAltitudeAutoScale={0.4}

                    // Heatmap points (only in heatmap mode)
                    pointsData={visualizationMode === 'heatmap' ? heatmapPoints : []}
                    pointColor={(d: any) => d.color}
                    pointAltitude={0.01}
                    pointRadius={(d: any) => 0.3 + d.weight * 0.7}
                    pointsMerge={true}

                    // HTML Labels (airports - always visible)
                    htmlElementsData={labelsData}
                    htmlAltitude={0.02}
                    htmlElement={(d: any) => {
                        const el = document.createElement('div');
                        el.innerHTML = `
                            <div style="
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                transform: translate(-50%, -50%);
                                pointer-events: none;
                            ">
                                <div style="
                                    background: rgba(10, 14, 39, 0.95);
                                    padding: 6px 10px;
                                    border-radius: 8px;
                                    border: 2px solid #00ffff;
                                    box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
                                ">
                                    <div style="
                                        color: #00ffff;
                                        font-weight: bold;
                                        font-size: 13px;
                                        text-align: center;
                                        text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
                                    ">${d.text}</div>
                                    <div style="
                                        color: rgba(255, 255, 255, 0.8);
                                        font-size: 10px;
                                        text-align: center;
                                        margin-top: 2px;
                                    ">${d.city}</div>
                                </div>
                            </div>
                        `;
                        return el;
                    }}

                    // Atmosphere - matching JourneyDetail
                    atmosphereColor="#00ffff"
                    atmosphereAltitude={0.15}

                    // Enable interaction
                    enablePointerInteraction={true}
                    animateIn={true}
                />
            )}
            
            {/* Glow overlay effect */}
            <div 
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{
                    background: 'radial-gradient(circle at center, transparent 30%, rgba(0, 240, 255, 0.03) 70%)',
                }}
            />
        </div>
    );
}
