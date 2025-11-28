import type { Flight, FlightStatus, LiveFlightData } from '../types';

/**
 * Mock Flight Tracking Service
 * 
 * Simulates real-time flight data since we don't have a live API key.
 * In a real application, this would connect to AviationStack, FlightAware, or similar APIs.
 */


function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

/**
 * Get the current status of a flight based on its scheduled time
 */
export function getFlightStatus(flight: Flight): FlightStatus {
    const now = new Date();
    const departureTime = new Date(flight.date);

    // Estimate arrival time (duration is in minutes)
    const duration = flight.duration || 120; // Default 2 hours if not set
    const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

    if (now < departureTime) {
        // If within 24 hours, it's scheduled, otherwise just scheduled
        return 'scheduled';
    } else if (now >= departureTime && now <= arrivalTime) {
        return 'active';
    } else {
        return 'landed';
    }
}

/**
 * Get live tracking data for an active flight
 * Simulates position along the great circle path
 */
export function getLiveFlightData(flight: Flight): LiveFlightData | null {
    const status = getFlightStatus(flight);

    if (status !== 'active') return null;

    const now = new Date();
    const departureTime = new Date(flight.date);
    const duration = flight.duration || 120;
    const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

    // Calculate progress (0 to 1)
    const totalTime = arrivalTime.getTime() - departureTime.getTime();
    const elapsedTime = now.getTime() - departureTime.getTime();
    const progress = Math.min(Math.max(elapsedTime / totalTime, 0), 1);

    // Interpolate position (Simple linear interpolation for MVP, not true Great Circle but close enough for short distances)
    // For better visualization, we should use an intermediate point calculation
    const startLat = flight.originAirport.latitude;
    const startLng = flight.originAirport.longitude;
    const endLat = flight.destinationAirport.latitude;
    const endLng = flight.destinationAirport.longitude;

    const currentLat = startLat + (endLat - startLat) * progress;
    const currentLng = startLng + (endLng - startLng) * progress;

    // Simulate altitude (climb, cruise, descent)
    let altitude = 0;
    if (progress < 0.1) {
        altitude = 35000 * (progress / 0.1); // Climbing
    } else if (progress > 0.9) {
        altitude = 35000 * ((1 - progress) / 0.1); // Descending
    } else {
        altitude = 35000 + (Math.random() * 1000 - 500); // Cruise with slight variation
    }

    return {
        altitude: Math.round(altitude),
        speed: 450 + Math.random() * 50, // Knots
        heading: calculateBearing(startLat, startLng, endLat, endLng),
        currentLat,
        currentLng,
        estimatedArrival: arrivalTime,
        progress: progress * 100
    };
}

function calculateBearing(startLat: number, startLng: number, endLat: number, endLng: number) {
    const startLatRad = deg2rad(startLat);
    const startLngRad = deg2rad(startLng);
    const endLatRad = deg2rad(endLat);
    const endLngRad = deg2rad(endLng);

    const y = Math.sin(endLngRad - startLngRad) * Math.cos(endLatRad);
    const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
        Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(endLngRad - startLngRad);
    const brng = Math.atan2(y, x);
    return (brng * 180 / Math.PI + 360) % 360;
}
