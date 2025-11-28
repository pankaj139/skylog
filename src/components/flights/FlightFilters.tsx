/**
 * FlightFilters Component
 * 
 * Provides filtering and sorting options for flight lists.
 * Includes search, year, airline, country, aircraft type filters, and sorting options.
 * 
 * Usage:
 * <FlightFilters
 *   onFilterChange={(filters) => console.log(filters)}
 *   airlines={['Airline 1', 'Airline 2']}
 *   countries={['USA', 'UK']}
 *   aircraftTypes={['Boeing 737', 'Airbus A320']}
 * />
 * 
 * Returns: FilterState object with all filter values
 */

import { useState, useEffect } from 'react';
import Input from '../common/Input';

interface FlightFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    airlines: string[];
    countries: string[];
    aircraftTypes: string[];
}

export interface FilterState {
    search: string;
    year: string;
    airline: string;
    country: string;
    aircraftType: string;
    sortBy: 'date-desc' | 'date-asc' | 'distance-desc' | 'distance-asc' | 'duration-desc' | 'duration-asc';
}

export default function FlightFilters({ onFilterChange, airlines, countries, aircraftTypes }: FlightFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        year: '',
        airline: '',
        country: '',
        aircraftType: '',
        sortBy: 'date-desc',
    });

    const [searchDebounce, setSearchDebounce] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchDebounce }));
        }, 300);

        return () => clearTimeout(timer);
    }, [searchDebounce]);

    // Notify parent of filter changes
    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const handleClearFilters = () => {
        setSearchDebounce('');
        setFilters({
            search: '',
            year: '',
            airline: '',
            country: '',
            aircraftType: '',
            sortBy: 'date-desc',
        });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

    const hasActiveFilters = filters.search || filters.year || filters.airline || filters.country || filters.aircraftType;

    return (
        <div className="glass rounded-xl p-4 sm:p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">Filters & Search</h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearFilters}
                        className="text-xs sm:text-sm text-neon-blue hover:text-neon-cyan transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Search */}
                <div>
                    <Input
                        label="Search"
                        value={searchDebounce}
                        onChange={(e) => setSearchDebounce(e.target.value)}
                        placeholder="Airport, city, airline..."
                    />
                </div>

                {/* Year Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Year
                    </label>
                    <select
                        value={filters.year}
                        onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                    >
                        <option value="">All Years</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Airline Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Airline
                    </label>
                    <select
                        value={filters.airline}
                        onChange={(e) => setFilters(prev => ({ ...prev, airline: e.target.value }))}
                        className="w-full px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                    >
                        <option value="">All Airlines</option>
                        {airlines.map(airline => (
                            <option key={airline} value={airline}>{airline}</option>
                        ))}
                    </select>
                </div>

                {/* Country Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country
                    </label>
                    <select
                        value={filters.country}
                        onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                    >
                        <option value="">All Countries</option>
                        {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                </div>

                {/* Aircraft Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Aircraft Type
                    </label>
                    <select
                        value={filters.aircraftType}
                        onChange={(e) => setFilters(prev => ({ ...prev, aircraftType: e.target.value }))}
                        className="w-full px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                    >
                        <option value="">All Aircraft</option>
                        {aircraftTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Sort By */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sort By
                    </label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
                        className="w-full px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                    >
                        <option value="date-desc">Date (Newest First)</option>
                        <option value="date-asc">Date (Oldest First)</option>
                        <option value="distance-desc">Distance (Longest First)</option>
                        <option value="distance-asc">Distance (Shortest First)</option>
                        <option value="duration-desc">Duration (Longest First)</option>
                        <option value="duration-asc">Duration (Shortest First)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

