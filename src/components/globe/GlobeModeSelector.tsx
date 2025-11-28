/**
 * GlobeModeSelector Component - Phase 3
 * 
 * Provides mode toggle buttons and settings for different globe visualization modes.
 * Modes: all routes, heatmap, time-lapse, filtered view
 */

import { useState } from 'react';

export type GlobeVisualizationMode = 'routes' | 'heatmap' | 'timelapse' | 'filtered';
export type GlobeColorMode = 'default' | 'by-year' | 'by-airline';

interface GlobeModeSelectorProps {
    mode: GlobeVisualizationMode;
    onModeChange: (mode: GlobeVisualizationMode) => void;
    colorMode: GlobeColorMode;
    onColorModeChange: (mode: GlobeColorMode) => void;
    // Time-lapse controls
    isTimelapsePlaying?: boolean;
    onTimelapseToggle?: () => void;
    timelapseYear?: number;
    onTimelapseYearChange?: (year: number) => void;
    minYear?: number;
    maxYear?: number;
    // Filter controls
    filterYear?: number;
    onFilterYearChange?: (year: number | undefined) => void;
    filterAirline?: string;
    onFilterAirlineChange?: (airline: string | undefined) => void;
    airlines?: string[];
    compact?: boolean;
}

const modeOptions: { value: GlobeVisualizationMode; label: string; icon: string; description: string }[] = [
    { value: 'routes', label: 'All Routes', icon: '🌐', description: 'Show all flight paths' },
    { value: 'heatmap', label: 'Heatmap', icon: '🔥', description: 'Visit frequency by location' },
    { value: 'timelapse', label: 'Time-Lapse', icon: '⏱️', description: 'Animate flights over time' },
    { value: 'filtered', label: 'Filtered', icon: '🔍', description: 'Filter by year or airline' },
];

const colorOptions: { value: GlobeColorMode; label: string }[] = [
    { value: 'default', label: 'Default (Cyan)' },
    { value: 'by-year', label: 'By Year' },
    { value: 'by-airline', label: 'By Airline' },
];

export default function GlobeModeSelector({
    mode,
    onModeChange,
    colorMode,
    onColorModeChange,
    isTimelapsePlaying,
    onTimelapseToggle,
    timelapseYear,
    onTimelapseYearChange,
    minYear,
    maxYear,
    filterYear,
    onFilterYearChange,
    filterAirline,
    onFilterAirlineChange,
    airlines = [],
    compact = false,
}: GlobeModeSelectorProps) {
    const [isExpanded, setIsExpanded] = useState(!compact);

    const currentMode = modeOptions.find(m => m.value === mode);

    return (
        <div className="glass rounded-xl border border-white/10 overflow-hidden">
            {/* Header / Collapsed View */}
            <div 
                className={`p-4 flex items-center justify-between ${compact ? 'cursor-pointer hover:bg-white/5' : ''}`}
                onClick={() => compact && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{currentMode?.icon}</span>
                    <div>
                        <span className="text-white font-medium">{currentMode?.label}</span>
                        {!isExpanded && (
                            <span className="text-gray-400 text-sm ml-2">• {currentMode?.description}</span>
                        )}
                    </div>
                </div>
                {compact && (
                    <button className="text-gray-400 hover:text-white transition-colors">
                        {isExpanded ? '▼' : '▶'}
                    </button>
                )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 pt-0 space-y-4">
                    {/* Mode Selection */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {modeOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => onModeChange(option.value)}
                                className={`p-3 rounded-lg border transition-all text-center ${
                                    mode === option.value
                                        ? 'border-neon-blue bg-neon-blue/10 text-white'
                                        : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                }`}
                            >
                                <span className="text-xl block mb-1">{option.icon}</span>
                                <span className="text-xs">{option.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Mode-specific controls */}
                    {mode === 'routes' && (
                        <div className="space-y-3">
                            <label className="text-sm text-gray-400">Arc Colors</label>
                            <div className="flex flex-wrap gap-2">
                                {colorOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => onColorModeChange(option.value)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                                            colorMode === option.value
                                                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50'
                                                : 'bg-dark-surface text-gray-400 border border-white/10 hover:text-white'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {mode === 'timelapse' && minYear && maxYear && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">
                                    Year: <span className="text-white font-medium">{timelapseYear}</span>
                                </span>
                                <button
                                    onClick={onTimelapseToggle}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                        isTimelapsePlaying
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                            : 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50'
                                    }`}
                                >
                                    {isTimelapsePlaying ? '⏸️ Pause' : '▶️ Play'}
                                </button>
                            </div>
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min={minYear}
                                    max={maxYear}
                                    value={timelapseYear}
                                    onChange={(e) => onTimelapseYearChange?.(parseInt(e.target.value))}
                                    className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-neon-blue"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{minYear}</span>
                                    <span>{maxYear}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === 'filtered' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Filter by Year</label>
                                <select
                                    value={filterYear || ''}
                                    onChange={(e) => onFilterYearChange?.(e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue"
                                >
                                    <option value="">All Years</option>
                                    {minYear && maxYear && Array.from(
                                        { length: maxYear - minYear + 1 },
                                        (_, i) => maxYear - i
                                    ).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Filter by Airline</label>
                                <select
                                    value={filterAirline || ''}
                                    onChange={(e) => onFilterAirlineChange?.(e.target.value || undefined)}
                                    className="w-full px-3 py-2 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue"
                                >
                                    <option value="">All Airlines</option>
                                    {airlines.map(airline => (
                                        <option key={airline} value={airline}>{airline}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {mode === 'heatmap' && (
                        <div className="p-3 bg-dark-surface rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Visit Frequency</span>
                            </div>
                            <div className="h-3 rounded-full overflow-hidden" style={{
                                background: 'linear-gradient(to right, rgba(0,255,255,0.5), rgba(0,255,0,0.7), rgba(255,255,0,0.8), rgba(255,0,0,0.9))'
                            }} />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Few visits</span>
                                <span>Many visits</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

