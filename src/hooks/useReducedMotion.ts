/**
 * useReducedMotion
 *
 * Reactive hook that tracks the user's `prefers-reduced-motion` media query.
 * Globe-heavy screens use this to disable auto-rotate, arc dash animation,
 * and the plane animation for users who opt out of motion.
 *
 * Usage:
 *   const reduceMotion = useReducedMotion();
 *   if (!reduceMotion) { startRAF(); }
 *
 * @returns `true` when the OS/browser requests reduced motion; updates live.
 */

import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
    const getInitial = (): boolean => {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    const [reduce, setReduce] = useState<boolean>(getInitial);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);

        // Modern browsers
        if (mql.addEventListener) {
            mql.addEventListener('change', onChange);
            return () => mql.removeEventListener('change', onChange);
        }

        // Safari < 14 fallback
        mql.addListener(onChange);
        return () => mql.removeListener(onChange);
    }, []);

    return reduce;
}

export default useReducedMotion;
