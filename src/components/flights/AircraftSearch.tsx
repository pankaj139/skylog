/**
 * AircraftSearch Component - Phase 2 Enhancement
 * 
 * A searchable dropdown for selecting aircraft types with auto-suggestions.
 * Shows popular aircraft when focused, and filters results as the user types.
 * 
 * Usage:
 *   <AircraftSearch
 *       label="Aircraft Type"
 *       value={formData.aircraftType}
 *       onChange={(value) => setFormData({ ...formData, aircraftType: value })}
 *   />
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { searchAircraft, getPopularAircraft, getAircraftByName, type Aircraft } from '../../data/aircraft';

interface AircraftSearchProps {
    label: string;
    value: string;
    onChange: (aircraft: string) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
}

/**
 * Returns the appropriate icon for aircraft category
 */
function getCategoryIcon(category: Aircraft['category']): string {
    switch (category) {
        case 'wide': return '🛫';
        case 'narrow': return '✈️';
        case 'regional': return '🛩️';
        case 'cargo': return '📦';
        default: return '✈️';
    }
}

/**
 * Returns a human-readable category label
 */
function getCategoryLabel(category: Aircraft['category']): string {
    switch (category) {
        case 'wide': return 'Wide Body';
        case 'narrow': return 'Narrow Body';
        case 'regional': return 'Regional';
        case 'cargo': return 'Cargo';
        default: return '';
    }
}

export default function AircraftSearch({
    label,
    value,
    onChange,
    placeholder = 'Search aircraft (e.g., 787, A320)',
    error,
    required = false,
}: AircraftSearchProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Get selected aircraft data based on current value
    const selectedAircraft = useMemo(() => {
        if (!value) return null;
        return getAircraftByName(value);
    }, [value]);

    // Derive the display value - use internal when focused, external when not
    const displayValue = isFocused ? internalValue : value;

    // Compute search results
    const results = useMemo(() => {
        if (isFocused) {
            if (displayValue.length >= 1) {
                return searchAircraft(displayValue);
            }
            // Show popular aircraft when focused but no search term
            return getPopularAircraft();
        }
        return [];
    }, [displayValue, isFocused]);

    const isOpen = results.length > 0 && isFocused;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
                setInternalValue(value); // Reset to actual value
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    const handleSelect = (aircraft: Aircraft) => {
        setInternalValue(aircraft.name);
        onChange(aircraft.name);
        setIsFocused(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInternalValue(e.target.value);
        onChange(e.target.value);
    };

    const handleBlur = () => {
        // Small delay to allow click on dropdown item
        setTimeout(() => {
            if (!wrapperRef.current?.contains(document.activeElement)) {
                setIsFocused(false);
            }
        }, 150);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>

            <div className="relative">
                {/* Show aircraft icon if selected */}
                {selectedAircraft && !isFocused && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">
                        {getCategoryIcon(selectedAircraft.category)}
                    </div>
                )}

                <input
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setIsFocused(true);
                        setInternalValue(value); // Sync when focusing
                    }}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={`w-full ${selectedAircraft && !isFocused ? 'pl-12' : 'px-5'} pr-5 py-4 bg-dark-surface border ${
                        error ? 'border-red-500' : 'border-white/10'
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue transition-colors`}
                />
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 glass rounded-lg border border-white/10 max-h-64 overflow-y-auto">
                    {displayValue.length < 1 && (
                        <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
                            Popular Aircraft
                        </div>
                    )}
                    {results.map((aircraft) => (
                        <button
                            key={aircraft.code}
                            type="button"
                            onClick={() => handleSelect(aircraft)}
                            className="w-full px-4 py-3 text-left hover:bg-neon-blue/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-3"
                        >
                            <div className="w-10 h-8 flex items-center justify-center bg-white/5 rounded text-xl">
                                {getCategoryIcon(aircraft.category)}
                            </div>
                            <div className="flex-1">
                                <div className="text-white font-medium">{aircraft.name}</div>
                                <div className="text-gray-400 text-xs">
                                    {aircraft.manufacturer} • {getCategoryLabel(aircraft.category)}
                                </div>
                            </div>
                            <div className="text-neon-blue/70 text-xs font-mono">
                                {aircraft.code}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

