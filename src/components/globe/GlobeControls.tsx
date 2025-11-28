/**
 * GlobeControls Component - Phase 2: Enhanced Globe Animations
 * 
 * Control panel for globe animations including:
 * - Play/Pause button
 * - Speed control (0.5x, 1x, 2x)
 * - Replay button
 * - Progress bar
 * - Cinema mode toggle
 * - Globe theme selector
 * 
 * Usage:
 *   <GlobeControls
 *     isPlaying={isPlaying}
 *     onPlayPause={() => setIsPlaying(!isPlaying)}
 *     speed={speed}
 *     onSpeedChange={(s) => setSpeed(s)}
 *     progress={progress}
 *     onReplay={() => setProgress(0)}
 *     isCinemaMode={isCinemaMode}
 *     onCinemaModeToggle={() => setCinemaMode(!isCinemaMode)}
 *     theme={theme}
 *     onThemeChange={(t) => setTheme(t)}
 *   />
 */

import { useState } from 'react';

interface GlobeControlsProps {
    // Animation state
    isPlaying: boolean;
    onPlayPause: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
    progress: number;
    onProgressChange?: (progress: number) => void;
    onReplay: () => void;
    
    // Cinema mode
    isCinemaMode?: boolean;
    onCinemaModeToggle?: () => void;
    
    // Theme
    theme?: 'night' | 'day' | 'satellite';
    onThemeChange?: (theme: 'night' | 'day' | 'satellite') => void;
    
    // Optional display options
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
 * GlobeControls provides animation and display controls for the globe
 * 
 * @param isPlaying - Whether the animation is currently playing
 * @param onPlayPause - Handler for play/pause button
 * @param speed - Current animation speed multiplier
 * @param onSpeedChange - Handler for speed changes
 * @param progress - Current animation progress (0-1)
 * @param onProgressChange - Optional handler for scrubbing the progress bar
 * @param onReplay - Handler for replay button
 * @param isCinemaMode - Whether cinema mode is active
 * @param onCinemaModeToggle - Handler for cinema mode toggle
 * @param theme - Current globe theme
 * @param onThemeChange - Handler for theme changes
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
    theme = 'night',
    onThemeChange,
    showSpeedControl = true,
    showThemeSelector = true,
    showCinemaMode = true,
    compact = false,
}: GlobeControlsProps) {
    const [showThemeMenu, setShowThemeMenu] = useState(false);

    return (
        <div className={`glass rounded-xl border border-white/10 backdrop-blur-xl ${compact ? 'p-2' : 'p-4'}`}>
            <div className="flex flex-col gap-4">
                {/* Progress Bar */}
                <div className="w-full">
                    <div 
                        className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                        onClick={(e) => {
                            if (onProgressChange) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const newProgress = x / rect.width;
                                onProgressChange(Math.max(0, Math.min(1, newProgress)));
                            }
                        }}
                    >
                        <div 
                            className="h-full bg-gradient-to-r from-neon-cyan to-neon-blue transition-all duration-100 relative"
                            style={{ width: `${progress * 100}%` }}
                        >
                            {/* Progress knob */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{Math.round(progress * 100)}%</span>
                        <span>{isPlaying ? 'Playing' : 'Paused'}</span>
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Main Controls */}
                    <div className="flex items-center gap-2">
                        {/* Replay Button */}
                        <button
                            onClick={onReplay}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                            title="Replay"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>

                        {/* Play/Pause Button */}
                        <button
                            onClick={onPlayPause}
                            className="p-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/30 rounded-full transition-all text-neon-cyan"
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Speed Control */}
                    {showSpeedControl && (
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                            {SPEED_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => onSpeedChange(s)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
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

                    {/* Right Controls */}
                    <div className="flex items-center gap-2">
                        {/* Cinema Mode Toggle */}
                        {showCinemaMode && onCinemaModeToggle && (
                            <button
                                onClick={onCinemaModeToggle}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                    isCinemaMode
                                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                                title="Cinema Mode"
                            >
                                <span>🎬</span>
                                {!compact && <span>Cinema</span>}
                            </button>
                        )}

                        {/* Theme Selector */}
                        {showThemeSelector && onThemeChange && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                                    className="px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white flex items-center gap-2"
                                    title="Globe Theme"
                                >
                                    <span>{THEME_OPTIONS.find(t => t.value === theme)?.icon}</span>
                                    {!compact && <span className="text-sm">{THEME_OPTIONS.find(t => t.value === theme)?.label}</span>}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showThemeMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 glass rounded-lg border border-white/10 overflow-hidden z-50">
                                        {THEME_OPTIONS.map((t) => (
                                            <button
                                                key={t.value}
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
 * Compact version of GlobeControls for minimal UI
 */
export function CompactGlobeControls({
    isPlaying,
    onPlayPause,
    onReplay,
    progress,
}: Pick<GlobeControlsProps, 'isPlaying' | 'onPlayPause' | 'onReplay' | 'progress'>) {
    return (
        <div className="flex items-center gap-2 glass rounded-full px-3 py-2 border border-white/10">
            {/* Replay */}
            <button
                onClick={onReplay}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                title="Replay"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>

            {/* Play/Pause */}
            <button
                onClick={onPlayPause}
                className="p-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 rounded-full transition-all text-neon-cyan"
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

            {/* Progress */}
            <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-neon-cyan transition-all duration-100"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>
        </div>
    );
}

