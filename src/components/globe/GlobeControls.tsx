/**
 * GlobeControls Component
 *
 * Glassmorphic control panel rendered inside an animated globe. Exposes:
 *   - Progress bar (click / drag to scrub)
 *   - Replay & Play / Pause buttons
 *   - Speed multiplier (0.5x / 1x / 2x)
 *   - Camera-follow toggle (keeps the plane centered on screen)
 *   - Cinema-mode toggle (wide framing + slow rotation)
 *   - Globe theme selector (Night / Day / Satellite)
 *
 * Compact mode (used on small screens) collapses labels to icons so the
 * cluster fits on narrow devices.
 *
 * Usage:
 *   <GlobeControls
 *     isPlaying={isPlaying}
 *     onPlayPause={() => setIsPlaying(!isPlaying)}
 *     speed={speed}
 *     onSpeedChange={setSpeed}
 *     progress={progress}
 *     onProgressChange={setProgress}
 *     onReplay={replay}
 *     theme="night"
 *     onThemeChange={setTheme}
 *   />
 *
 * @returns A glass-styled controls bar ready for absolute-positioning.
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Props for {@link GlobeControls}.
 */
interface GlobeControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
    progress: number;
    onProgressChange?: (progress: number) => void;
    onReplay: () => void;

    /** Cinema mode (wide framing + slow yaw). */
    isCinemaMode?: boolean;
    onCinemaModeToggle?: () => void;

    /** Camera-follow mode (re-centers on the plane as it moves). */
    cameraFollow?: boolean;
    onCameraFollowToggle?: () => void;

    theme?: 'night' | 'day' | 'satellite';
    onThemeChange?: (theme: 'night' | 'day' | 'satellite') => void;

    showSpeedControl?: boolean;
    showThemeSelector?: boolean;
    showCinemaMode?: boolean;
    compact?: boolean;
}

const SPEED_OPTIONS = [0.5, 1, 2];
const THEME_OPTIONS: { value: 'night' | 'day' | 'satellite'; label: string; icon: string }[] = [
    { value: 'night', label: 'Night', icon: '🌙' },
    { value: 'day', label: 'Day', icon: '☀️' },
    { value: 'satellite', label: 'Satellite', icon: '🛰️' },
];

/**
 * GlobeControls
 *
 * @param isPlaying            Whether the animation is currently playing.
 * @param onPlayPause          Handler for the play / pause button.
 * @param speed                Current animation speed multiplier.
 * @param onSpeedChange        Handler for speed changes.
 * @param progress             Current animation progress (0-1).
 * @param onProgressChange     Handler for scrubbing (click / drag on the bar).
 * @param onReplay             Handler for the replay button.
 * @param isCinemaMode         Whether cinema mode is active.
 * @param onCinemaModeToggle   Handler for the cinema toggle.
 * @param cameraFollow         Whether camera-follow mode is active.
 * @param onCameraFollowToggle Handler for the camera-follow toggle.
 * @param theme                Current globe theme.
 * @param onThemeChange        Handler for theme changes.
 * @param showSpeedControl     Hide speed multiplier when false.
 * @param showThemeSelector    Hide theme dropdown when false.
 * @param showCinemaMode       Hide cinema toggle when false.
 * @param compact              Render the compact / mobile version.
 * @returns                    A glass-styled controls bar.
 */
export default function GlobeControls({
    isPlaying,
    onPlayPause,
    speed,
    onSpeedChange,
    progress,
    onProgressChange,
    onReplay,
    isCinemaMode = false,
    onCinemaModeToggle,
    cameraFollow = false,
    onCameraFollowToggle,
    theme = 'night',
    onThemeChange,
    showSpeedControl = true,
    showThemeSelector = true,
    showCinemaMode = true,
    compact = false,
}: GlobeControlsProps) {
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    /** Convert a pointer X coordinate to a progress value in [0, 1]. */
    const pointerToProgress = (clientX: number): number => {
        if (!progressRef.current) return progress;
        const rect = progressRef.current.getBoundingClientRect();
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!onProgressChange) return;
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        isDraggingRef.current = true;
        onProgressChange(pointerToProgress(e.clientX));
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!onProgressChange || !isDraggingRef.current) return;
        onProgressChange(pointerToProgress(e.clientX));
    };

    const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        (e.currentTarget as HTMLDivElement).releasePointerCapture?.(e.pointerId);
    };

    /** Close theme dropdown when clicking outside. */
    useEffect(() => {
        if (!showThemeMenu) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest?.('[data-theme-menu]')) setShowThemeMenu(false);
        };
        window.addEventListener('mousedown', handler);
        return () => window.removeEventListener('mousedown', handler);
    }, [showThemeMenu]);

    return (
        <div
            className={`glass rounded-xl border border-white/10 backdrop-blur-xl ${compact ? 'p-2' : 'p-4'}`}
            role="group"
            aria-label="Globe animation controls"
        >
            <div className="flex flex-col gap-3 sm:gap-4">
                {/* Progress bar */}
                <div className="w-full">
                    <div
                        ref={progressRef}
                        className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group touch-none"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                        role="slider"
                        aria-label="Animation progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(progress * 100)}
                    >
                        <div
                            className="h-full bg-gradient-to-r from-neon-cyan to-neon-blue transition-[width] duration-100 relative"
                            style={{ width: `${progress * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    {!compact && (
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                            <span>{Math.round(progress * 100)}%</span>
                            <span>{isPlaying ? 'Playing' : 'Paused'}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
                    {/* Main transport controls */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            type="button"
                            onClick={onReplay}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                            aria-label="Replay"
                            title="Replay"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={onPlayPause}
                            className="p-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/30 rounded-full transition-all text-neon-cyan"
                            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
                            aria-pressed={isPlaying}
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Speed selector */}
                    {showSpeedControl && (
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1" role="radiogroup" aria-label="Animation speed">
                            {SPEED_OPTIONS.map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    role="radio"
                                    aria-checked={speed === s}
                                    onClick={() => onSpeedChange(s)}
                                    className={`px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
                                        speed === s
                                            ? 'bg-neon-cyan text-dark-bg'
                                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {s}x
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Secondary controls */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Camera follow */}
                        {onCameraFollowToggle && (
                            <button
                                type="button"
                                onClick={onCameraFollowToggle}
                                className={`px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                                    cameraFollow
                                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                                }`}
                                aria-pressed={cameraFollow}
                                title="Follow the plane with the camera"
                            >
                                <span aria-hidden>🎯</span>
                                {!compact && <span>Follow</span>}
                            </button>
                        )}

                        {/* Cinema mode */}
                        {showCinemaMode && onCinemaModeToggle && (
                            <button
                                type="button"
                                onClick={onCinemaModeToggle}
                                className={`px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                                    isCinemaMode
                                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                                }`}
                                aria-pressed={isCinemaMode}
                                title="Cinematic wide view"
                            >
                                <span aria-hidden>🎬</span>
                                {!compact && <span>Cinema</span>}
                            </button>
                        )}

                        {/* Theme selector */}
                        {showThemeSelector && onThemeChange && (
                            <div className="relative" data-theme-menu>
                                <button
                                    type="button"
                                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                                    className="px-2.5 sm:px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white flex items-center gap-1.5"
                                    aria-haspopup="menu"
                                    aria-expanded={showThemeMenu}
                                    title="Change globe theme"
                                >
                                    <span>{THEME_OPTIONS.find(t => t.value === theme)?.icon}</span>
                                    {!compact && (
                                        <span className="text-sm">
                                            {THEME_OPTIONS.find(t => t.value === theme)?.label}
                                        </span>
                                    )}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showThemeMenu && (
                                    <div
                                        className="absolute bottom-full right-0 mb-2 glass rounded-lg border border-white/10 overflow-hidden z-50 min-w-[140px]"
                                        role="menu"
                                    >
                                        {THEME_OPTIONS.map(t => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                role="menuitemradio"
                                                aria-checked={theme === t.value}
                                                onClick={() => {
                                                    onThemeChange(t.value);
                                                    setShowThemeMenu(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                                                    theme === t.value
                                                        ? 'bg-neon-cyan/20 text-neon-cyan'
                                                        : 'text-gray-300 hover:bg-white/10'
                                                }`}
                                            >
                                                <span>{t.icon}</span>
                                                <span>{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * CompactGlobeControls
 *
 * A minimal control bar (replay + play/pause + tiny progress bar) used when
 * the parent wants only the essentials — e.g. inside a small preview card.
 *
 * Usage:
 *   <CompactGlobeControls
 *     isPlaying={isPlaying}
 *     onPlayPause={toggle}
 *     onReplay={replay}
 *     progress={progress}
 *   />
 *
 * @param isPlaying   Whether the animation is currently playing.
 * @param onPlayPause Handler for play / pause.
 * @param onReplay    Handler for replay.
 * @param progress    Current progress (0-1).
 * @returns           A compact pill-shaped control strip.
 */
export function CompactGlobeControls({
    isPlaying,
    onPlayPause,
    onReplay,
    progress,
}: Pick<GlobeControlsProps, 'isPlaying' | 'onPlayPause' | 'onReplay' | 'progress'>) {
    return (
        <div className="flex items-center gap-2 glass rounded-full px-3 py-2 border border-white/10">
            <button
                type="button"
                onClick={onReplay}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                aria-label="Replay"
                title="Replay"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>

            <button
                type="button"
                onClick={onPlayPause}
                className="p-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 rounded-full transition-all text-neon-cyan"
                aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
                title={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </button>

            <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-neon-cyan transition-[width] duration-100"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>
        </div>
    );
}
