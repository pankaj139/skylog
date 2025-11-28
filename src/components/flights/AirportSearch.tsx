import { useState, useEffect, useRef, useMemo } from 'react';
import type { Airport } from '../../types';
import { searchAirports } from '../../data/airports';

interface AirportSearchProps {
    label: string;
    value: Airport | null;
    onChange: (airport: Airport | null) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
}

export default function AirportSearch({
    label,
    value,
    onChange,
    placeholder = 'Search by code, city, or airport name',
    error,
    required = false,
}: AirportSearchProps) {
    const [searchTerm, setSearchTerm] = useState(() => 
        value ? `${value.iata} - ${value.city}` : ''
    );
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const prevValueRef = useRef<Airport | null>(value);

    // Sync searchTerm when value prop changes (controlled component behavior)
    if (value !== prevValueRef.current) {
        prevValueRef.current = value;
        const newSearchTerm = value ? `${value.iata} - ${value.city}` : '';
        if (searchTerm !== newSearchTerm && !isFocused) {
            setSearchTerm(newSearchTerm);
        }
    }

    // Compute search results using useMemo instead of useEffect
    const results = useMemo(() => {
        if (searchTerm.length >= 2 && isFocused) {
            return searchAirports(searchTerm);
        }
        return [];
    }, [searchTerm, isFocused]);

    const isOpen = results.length > 0 && isFocused;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (airport: Airport) => {
        onChange(airport);
        setSearchTerm(`${airport.iata} - ${airport.city}`);
        setIsFocused(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (!e.target.value) {
            onChange(null);
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>

            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                placeholder={placeholder}
                className={`w-full px-5 py-4 bg-dark-surface border ${error ? 'border-red-500' : 'border-white/10'
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue transition-colors`}
            />

            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 glass rounded-lg border border-white/10 max-h-64 overflow-y-auto">
                    {results.map((airport) => (
                        <button
                            key={airport.iata}
                            type="button"
                            onClick={() => handleSelect(airport)}
                            className="w-full px-5 py-4 text-left hover:bg-neon-blue/10 transition-colors border-b border-white/5 last:border-b-0"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-neon-blue font-bold text-lg">{airport.iata}</span>
                                <div className="flex-1">
                                    <div className="text-white font-medium">{airport.city}, {airport.country}</div>
                                    <div className="text-gray-400 text-sm truncate">{airport.name}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No results message */}
            {isFocused && searchTerm.length >= 2 && results.length === 0 && (
                <div className="absolute z-50 w-full mt-2 glass rounded-lg border border-white/10 px-4 py-3">
                    <p className="text-gray-400 text-sm">No airports found. Try searching by IATA code, city, or airport name.</p>
                </div>
            )}
        </div>
    );
}
