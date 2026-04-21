/**
 * orientOnSphere
 *
 * Math helpers for placing a 3D model on the surface of a sphere (the
 * globe) and pointing it along a great-circle bearing — the setup the
 * Trip-page plane animation needs every frame.
 *
 * Coordinate convention used here matches `three-globe`:
 *   - Globe center is at the world origin.
 *   - "Up" at any point on the globe is the outward surface normal.
 *   - Longitude 0° / latitude 0° projects to +Z (three-globe default).
 *
 * The plane model is expected to have been pre-rotated so **nose = +X**
 * and **top = +Y** in its local space (see `planeModel.ts`).
 */

import { MathUtils, Matrix4, Quaternion, Vector3 } from 'three';

/**
 * Convert a geodetic (lat, lng, altitude-above-surface) coordinate into
 * a world-space XYZ position on a globe of the given radius.
 *
 * The formula mirrors three-globe's internal `polar2Cartesian` exactly so
 * positions line up with its arcs, points, and HTML markers:
 *   phi   = (90 - lat) * π / 180
 *   theta = (90 - lng) * π / 180
 *   (x, y, z) = (r·sinφ·cosθ, r·cosφ, r·sinφ·sinθ)
 *
 * In this frame, (lat=0, lng=0) lies on **+Z**, (lat=0, lng=90°) on +X,
 * and the north pole on +Y.
 *
 * @param lat        Latitude in degrees, range [-90, 90].
 * @param lng        Longitude in degrees, range [-180, 180].
 * @param altitude   Altitude as a fraction of globe radius (0 = surface,
 *                   0.1 = 10% above surface). Matches three-globe's
 *                   arc/point altitude units so values transfer directly.
 * @param radius     Globe radius in world units. Defaults to 100, which
 *                   is the `GLOBE_RADIUS` constant three-globe exposes.
 * @returns          `Vector3` in world space. Caller owns the instance.
 */
export function latLngToVector3(
    lat: number,
    lng: number,
    altitude: number = 0,
    radius: number = 100
): Vector3 {
    const r = radius * (1 + altitude);
    const phi = MathUtils.degToRad(90 - lat);
    const theta = MathUtils.degToRad(90 - lng);
    const sinPhi = Math.sin(phi);
    return new Vector3(
        r * sinPhi * Math.cos(theta),
        r * Math.cos(phi),
        r * sinPhi * Math.sin(theta)
    );
}

/**
 * Initial-bearing (forward azimuth) of the great-circle route from A to B,
 * in degrees clockwise from true north. Standard spherical formula.
 *
 * @param fromLat  Start latitude in degrees.
 * @param fromLng  Start longitude in degrees.
 * @param toLat    End latitude in degrees.
 * @param toLng    End longitude in degrees.
 * @returns        Bearing in degrees, normalised to [0, 360).
 */
export function bearingDegrees(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
): number {
    const φ1 = MathUtils.degToRad(fromLat);
    const φ2 = MathUtils.degToRad(toLat);
    const Δλ = MathUtils.degToRad(toLng - fromLng);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
        Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    return (MathUtils.radToDeg(θ) + 360) % 360;
}

// Scratch vectors/matrix reused across frames to avoid per-call allocations
// in the hot update path.
const _up = new Vector3();
const _north = new Vector3();
const _east = new Vector3();
const _forward = new Vector3();
const _right = new Vector3();
const _basis = new Matrix4();
const _tmp = new Vector3();

/**
 * Compute a quaternion that, when applied to an object whose local axes are
 * **nose = +X** and **top = +Y**, orients it tangent to the sphere surface
 * at (lat, lng) and pointing along the given great-circle bearing.
 *
 * Strategy: build an orthonormal tangent frame (east, north, up) at the
 * point directly from basis vectors — no Euler ordering gotchas. This
 * matches three-globe's coordinate frame exactly because we compute `up`
 * from the same `polar2Cartesian` formula used by {@link latLngToVector3}.
 *
 * @param lat       Current latitude in degrees.
 * @param lng       Current longitude in degrees.
 * @param bearing   Heading in degrees (0 = north, 90 = east), clockwise.
 * @param target    Optional pre-allocated quaternion to write into,
 *                  avoiding per-frame allocations in hot loops.
 * @returns         The target quaternion (or a newly allocated one).
 */
export function orientationQuaternion(
    lat: number,
    lng: number,
    bearing: number,
    target?: Quaternion
): Quaternion {
    const q = target ?? new Quaternion();

    // 1. Up = outward surface normal = unit position vector.
    const phi = MathUtils.degToRad(90 - lat);
    const theta = MathUtils.degToRad(90 - lng);
    const sinPhi = Math.sin(phi);
    _up.set(
        sinPhi * Math.cos(theta),
        Math.cos(phi),
        sinPhi * Math.sin(theta)
    ).normalize();

    // 2. North = d(position)/d(lat), projected onto the tangent plane.
    //    Differentiating polar2Cartesian w.r.t. lat (noting phi = 90-lat,
    //    so dphi/dlat = -1) yields:
    //        dx/dlat =  cosφ · cosθ
    //        dy/dlat = -sinφ · (-1) = sinφ   (note the sign flips cancel)
    //        dz/dlat =  cosφ · sinθ
    //    Close enough to re-derive by hand; we just build it and
    //    orthonormalize against `up` to kill any numerical drift.
    _north.set(
        -Math.cos(phi) * Math.cos(theta),
        Math.sin(phi),
        -Math.cos(phi) * Math.sin(theta)
    );
    // Project out any component along `up` (shouldn't be any, but belt-and-
    // braces for poles where the derivative degenerates) and normalize.
    _tmp.copy(_up).multiplyScalar(_north.dot(_up));
    _north.sub(_tmp).normalize();

    // 3. East = north × up. Verified against ∂P/∂lng at (0,0), where east
    //    must point in +X: north=(0,1,0), up=(0,0,1) → north×up=(1,0,0). ✓
    _east.copy(_north).cross(_up).normalize();

    // 4. Forward along bearing: rotate `north` by `bearing` around `up`.
    //    forward = cos(B)·north + sin(B)·east
    const B = MathUtils.degToRad(bearing);
    _forward
        .copy(_north)
        .multiplyScalar(Math.cos(B))
        .addScaledVector(_east, Math.sin(B))
        .normalize();

    // 5. Right-hand completion for the model's local-Z axis. The plane's
    //    local axes are nose=+X, top=+Y, so local +Z = +X × +Y = forward × up
    //    in world space.
    _right.copy(_forward).cross(_up).normalize();

    // 6. Build the rotation whose columns are (forward, up, right).
    //    `makeBasis(x, y, z)` maps local +X→x, +Y→y, +Z→z.
    _basis.makeBasis(_forward, _up, _right);
    q.setFromRotationMatrix(_basis);

    return q;
}

/**
 * Interpolate along a great-circle path between two lat/lng points using
 * spherical linear interpolation. Matches the curve three-globe draws for
 * its arcs, so a plane positioned with this helper stays glued to its arc.
 *
 * @param fromLat  Start latitude in degrees.
 * @param fromLng  Start longitude in degrees.
 * @param toLat    End latitude in degrees.
 * @param toLng    End longitude in degrees.
 * @param t        Progress in [0, 1]; values outside are clamped.
 * @returns        Object `{ lat, lng }` in degrees at progress `t`.
 */
export function interpolateGreatCircle(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    t: number
): { lat: number; lng: number } {
    const clamped = Math.max(0, Math.min(1, t));

    const φ1 = MathUtils.degToRad(fromLat);
    const λ1 = MathUtils.degToRad(fromLng);
    const φ2 = MathUtils.degToRad(toLat);
    const λ2 = MathUtils.degToRad(toLng);

    const sinΔφ2 = Math.sin((φ2 - φ1) / 2);
    const sinΔλ2 = Math.sin((λ2 - λ1) / 2);
    const a =
        sinΔφ2 * sinΔφ2 +
        Math.cos(φ1) * Math.cos(φ2) * sinΔλ2 * sinΔλ2;
    const δ = 2 * Math.asin(Math.min(1, Math.sqrt(a)));

    // Degenerate case: same point → no interpolation needed.
    if (δ === 0) {
        return { lat: fromLat, lng: fromLng };
    }

    const A = Math.sin((1 - clamped) * δ) / Math.sin(δ);
    const B = Math.sin(clamped * δ) / Math.sin(δ);

    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);

    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);

    return {
        lat: MathUtils.radToDeg(φ),
        lng: MathUtils.radToDeg(λ),
    };
}
