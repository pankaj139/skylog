import { useEffect, useRef } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import type { LiveFlightData, Flight } from '../../types';

interface LiveFlightMapProps {
    flight: Flight;
    liveData: LiveFlightData;
}

export default function LiveFlightMap({ flight, liveData }: LiveFlightMapProps) {
    const globeEl = useRef<GlobeMethods | undefined>(undefined);

    useEffect(() => {
        if (globeEl.current) {
            // Center view on the plane
            globeEl.current.pointOfView({
                lat: liveData.currentLat,
                lng: liveData.currentLng,
                altitude: 1.5 // Zoom level
            }, 1000);
        }
    }, [liveData]);

    const arcsData = [{
        startLat: flight.originAirport.latitude,
        startLng: flight.originAirport.longitude,
        endLat: flight.destinationAirport.latitude,
        endLng: flight.destinationAirport.longitude,
        color: '#00f3ff'
    }];

    const planeData = [{
        lat: liveData.currentLat,
        lng: liveData.currentLng,
        alt: liveData.altitude / 2000000, // Scale altitude for visualization
        label: flight.flightNumber || 'Flight'
    }];

    return (
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-dark-bg border border-white/10">
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                backgroundColor="rgba(0,0,0,0)"
                width={400} // Will be responsive via CSS container
                height={256}
                arcsData={arcsData}
                arcColor="color"
                arcDashLength={0.4}
                arcDashGap={0.2}
                arcDashAnimateTime={1500}
                arcStroke={2}
                objectsData={planeData}
                objectLat="lat"
                objectLng="lng"
                objectAltitude="alt"
                objectLabel="label"
                htmlElementsData={planeData}
                htmlLat="lat"
                htmlLng="lng"
                htmlAltitude="alt"
                htmlElement={() => {
                    const el = document.createElement('div');
                    el.innerHTML = `
                        <div style="color: #00f3ff; transform: rotate(${liveData.heading}deg);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M2 12h20M12 2l10 10-10 10"/>
                            </svg>
                        </div>
                    `;
                    return el;
                }}
            />

            {/* Overlay Info */}
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 flex justify-between text-xs">
                <div>
                    <div className="text-gray-400">Altitude</div>
                    <div className="font-mono text-neon-blue">{liveData.altitude.toLocaleString()} ft</div>
                </div>
                <div>
                    <div className="text-gray-400">Speed</div>
                    <div className="font-mono text-neon-blue">{Math.round(liveData.speed)} kts</div>
                </div>
                <div>
                    <div className="text-gray-400">Arrival</div>
                    <div className="font-mono text-neon-blue">
                        {new Date(liveData.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </div>
    );
}
