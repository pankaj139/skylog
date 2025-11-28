import { useState, useEffect, useRef, useMemo } from 'react';
import { searchAirlines, getPopularAirlines, type Airline } from '../../data/airlines';
import { getAirlineData, preloadAirlineLogo } from '../../utils/airlineLogoCache';

interface AirlineSearchProps {
    label: string;
    value: string;
    onChange: (airline: string, airlineData?: Airline) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
}

export default function AirlineSearch({
    label,
    value,
    onChange,
    placeholder = 'Search airline by name or code',
    error,
    required = false,
}: AirlineSearchProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Get selected airline data based on current value (using cached lookup)
    const selectedAirline = useMemo(() => {
        if (!value) return null;
        return getAirlineData(value);
    }, [value]);

    // Preload logo when airline is selected
    useEffect(() => {
        if (value) {
            preloadAirlineLogo(value);
        }
    }, [value]);

    // Derive the display value - use internal when focused, external when not
    const displayValue = isFocused ? internalValue : value;

    // Compute search results
    const results = useMemo(() => {
        if (isFocused) {
            if (displayValue.length >= 1) {
                return searchAirlines(displayValue);
            }
            // Show popular airlines when focused but no search term
            return getPopularAirlines();
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

    const handleSelect = (airline: Airline) => {
        setInternalValue(airline.name);
        onChange(airline.name, airline);
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
                {/* Show airline logo if selected */}
                {selectedAirline && !isFocused && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                        <img
                            src={selectedAirline.logo}
                            alt={selectedAirline.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
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
                    className={`w-full ${selectedAirline && !isFocused ? 'pl-14' : 'px-5'} pr-5 py-4 bg-dark-surface border ${
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
                            Popular Airlines
                        </div>
                    )}
                    {results.map((airline) => (
                        <button
                            key={airline.iata}
                            type="button"
                            onClick={() => handleSelect(airline)}
                            className="w-full px-4 py-3 text-left hover:bg-neon-blue/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-3"
                        >
                            <div className="w-10 h-8 flex items-center justify-center bg-white/5 rounded">
                                <img
                                    src={airline.logo}
                                    alt={airline.name}
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.parentElement!.innerHTML = `<span class="text-neon-blue font-bold text-sm">${airline.iata}</span>`;
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="text-white font-medium">{airline.name}</div>
                                <div className="text-gray-400 text-xs">{airline.iata} • {airline.country}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
