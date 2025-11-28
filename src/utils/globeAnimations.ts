import type { CameraPosition } from '../types';

/**
 * Easing functions for smooth animations
 */
export const easing = {
    // Ease in-out cubic
    easeInOutCubic: (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    // Ease out quad
    easeOutQuad: (t: number): number => {
        return t * (2 - t);
    },

    // Ease in-out quad
    easeInOutQuad: (t: number): number => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    // Ease out expo
    easeOutExpo: (t: number): number => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },
};

/**
 * Interpolate between two values
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * Interpolate between two camera positions
 */
export function lerpCameraPosition(
    start: CameraPosition,
    end: CameraPosition,
    t: number,
    easingFn: (t: number) => number = easing.easeInOutCubic
): CameraPosition {
    const easedT = easingFn(t);
    return {
        lat: lerp(start.lat, end.lat, easedT),
        lng: lerp(start.lng, end.lng, easedT),
        altitude: lerp(start.altitude, end.altitude, easedT),
    };
}

/**
 * Calculate intermediate point along a geodesic path
 * Uses spherical linear interpolation (slerp)
 */
export function interpolateGeodesicPoint(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    t: number
): { lat: number; lng: number; altitude?: number } {
    // Convert to radians
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lng1Rad = (lng1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lng2Rad = (lng2 * Math.PI) / 180;

    // Calculate angular distance
    const d =
        2 *
        Math.asin(
            Math.sqrt(
                Math.pow(Math.sin((lat1Rad - lat2Rad) / 2), 2) +
                Math.cos(lat1Rad) *
                Math.cos(lat2Rad) *
                Math.pow(Math.sin((lng1Rad - lng2Rad) / 2), 2)
            )
        );

    if (d === 0) {
        return { lat: lat1, lng: lng1 };
    }

    const a = Math.sin((1 - t) * d) / Math.sin(d);
    const b = Math.sin(t * d) / Math.sin(d);

    const x =
        a * Math.cos(lat1Rad) * Math.cos(lng1Rad) +
        b * Math.cos(lat2Rad) * Math.cos(lng2Rad);
    const y =
        a * Math.cos(lat1Rad) * Math.sin(lng1Rad) +
        b * Math.cos(lat2Rad) * Math.sin(lng2Rad);
    const z = a * Math.sin(lat1Rad) + b * Math.sin(lat2Rad);

    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lng = Math.atan2(y, x);

    return {
        lat: (lat * 180) / Math.PI,
        lng: (lng * 180) / Math.PI,
    };
}

/**
 * Calculate the optimal camera position to view a flight path
 */
export function calculateOptimalCameraPosition(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): CameraPosition {
    // Calculate midpoint
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    // Calculate distance for altitude
    const distance = Math.sqrt(
        Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)
    );

    // Altitude based on distance (scaled for good viewing)
    const altitude = Math.max(1.5, Math.min(3, distance / 30 + 1.2));

    return {
        lat: midLat,
        lng: midLng,
        altitude,
    };
}

/**
 * Generate points along a geodesic path for smooth arc rendering
 */
export function generateArcPoints(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    numPoints: number = 50
): Array<{ lat: number; lng: number }> {
    const points: Array<{ lat: number; lng: number }> = [];

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        points.push(interpolateGeodesicPoint(lat1, lng1, lat2, lng2, t));
    }

    return points;
}

/**
 * Animate a value over time using requestAnimationFrame
 */
export function animateValue(
    from: number,
    to: number,
    duration: number,
    onUpdate: (value: number) => void,
    onComplete?: () => void,
    easingFn: (t: number) => number = easing.easeInOutCubic
): () => void {
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFn(progress);
        const currentValue = lerp(from, to, easedProgress);

        onUpdate(currentValue);

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            onComplete?.();
        }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Return cancel function
    return () => cancelAnimationFrame(animationFrameId);
}

