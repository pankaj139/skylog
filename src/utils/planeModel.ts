/**
 * planeModel
 *
 * Lazy, module-level loader for the glTF airliner model rendered on the
 * Trip page globe. The GLB (~2.7 MB) lives under `public/models/plane.glb`
 * and is fetched at most once per session — subsequent callers receive the
 * cached base `THREE.Object3D`, which should be `.clone(true)`'d per use
 * site so the same template can drive many instances.
 *
 * `GLTFLoader` is pulled via dynamic `import()` from three's JSM examples
 * so it stays out of the initial bundle.
 *
 * Usage:
 *   loadPlaneModel().then(base => {
 *       const myPlane = base.clone(true);
 *       myPlane.position.set(x, y, z);
 *       scene.add(myPlane);
 *   });
 *
 * @returns A promise that resolves to a shared base `Object3D`. Callers
 *          MUST clone before mutating transform/materials to avoid
 *          stomping on other instances.
 */

import { Group, type Object3D } from 'three';

/**
 * Cached singleton promise. Reset to `null` on failure so the next call
 * retries instead of returning a stuck rejection.
 */
let cachedPromise: Promise<Object3D> | null = null;

/**
 * Kick off (or return the in-flight) load of the airliner glTF model.
 *
 * The model is normalized on first load:
 *   - Traversed to enable `castShadow` on every mesh so it can drop a
 *     shadow on the globe when shadow mapping is turned on by the caller.
 *   - Oriented so its **nose points along +X** in local space. This is
 *     the convention {@link ./orientOnSphere} expects when computing the
 *     heading quaternion.
 *   - Scaled to a reasonable size relative to the default three-globe
 *     radius of 100 world units.
 *
 * @returns A promise resolving to the shared base `Object3D`. Clone it
 *          (`base.clone(true)`) before use.
 */
export function loadPlaneModel(): Promise<Object3D> {
    if (cachedPromise) return cachedPromise;

    cachedPromise = import('three/examples/jsm/loaders/GLTFLoader.js')
        .then(({ GLTFLoader }) => {
            const loader = new GLTFLoader();
            return loader.loadAsync('/models/plane.glb');
        })
        .then(gltf => {
            // Wrap the loaded scene in an outer Group so the caller can
            // freely overwrite `outer.quaternion` every frame (as three-globe
            // does via `customThreeObjectUpdate`) while the inner transform
            // keeps baking in the "align local +X to the plane's nose" and
            // scale corrections. Without this wrapper, those corrections
            // would be stomped on the first frame.
            const inner = gltf.scene;

            // Native orientation of the Mapbox airplane glTF, verified by
            // inspecting node translations inside the GLB:
            //   front_gear.x  = -9.06  → nose is along LOCAL -X
            //   rear_gears.x  = +4.60  → tail is along LOCAL +X
            //   propeller_*.y = +3.09  → up   is along LOCAL +Y
            //   propeller_L.z = +10.4  → left wing is along LOCAL +Z
            //
            // orientOnSphere builds a frame where forward = LOCAL +X, so we
            // yaw the inner scene by 180° around Y to map native -X onto
            // world +X (equivalently: flip the model end-for-end). Up stays
            // along +Y. If the asset ever changes, this is the one knob
            // to tweak.
            inner.rotation.set(0, Math.PI, 0);

            // Scale tuned against three-globe's default `GLOBE_RADIUS = 100`.
            // The model's bounding extents reach ±10 local units, so scale=1
            // produces a plane ~20 units across — too big for a globe of
            // radius 100. 0.35 gives a wingspan ≈ 7 world units (≈ 7% of
            // globe radius), which reads clearly on both short-hop and
            // long-haul arcs without dominating the frame.
            inner.scale.setScalar(0.35);

            inner.traverse(obj => {
                obj.castShadow = true;
                obj.receiveShadow = false;
            });

            const outer = new Group();
            outer.add(inner);
            return outer;
        })
        .catch(err => {
            // Reset so a future call can retry (e.g. after network recovers)
            cachedPromise = null;
            throw err;
        });

    return cachedPromise;
}

/**
 * Force-clear the cached model. Primarily for tests; production code should
 * let the module-level cache live for the whole session.
 *
 * @returns void
 */
export function resetPlaneModelCache(): void {
    cachedPromise = null;
}
