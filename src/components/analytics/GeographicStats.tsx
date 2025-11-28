/**
 * GeographicStats Component - Phase 2: Analytics Dashboard
 * 
 * Displays geographic breakdown of travel including continents, countries, and cities.
 */

import { useMemo } from 'react';
import type { Flight } from '../../types';
import { formatDistance } from '../../utils/formatters';

interface GeographicStatsProps {
    flights: Flight[];
}

// Map countries to continents
const COUNTRY_CONTINENTS: Record<string, string> = {
    // North America
    'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
    // Europe
    'United Kingdom': 'Europe', 'France': 'Europe', 'Germany': 'Europe', 'Italy': 'Europe',
    'Spain': 'Europe', 'Netherlands': 'Europe', 'Belgium': 'Europe', 'Switzerland': 'Europe',
    'Austria': 'Europe', 'Ireland': 'Europe', 'Portugal': 'Europe', 'Greece': 'Europe',
    'Poland': 'Europe', 'Sweden': 'Europe', 'Norway': 'Europe', 'Denmark': 'Europe',
    'Finland': 'Europe', 'Czech Republic': 'Europe', 'Hungary': 'Europe', 'Romania': 'Europe',
    'Turkey': 'Europe', 'Russia': 'Europe',
    // Asia
    'Japan': 'Asia', 'China': 'Asia', 'South Korea': 'Asia', 'India': 'Asia',
    'Thailand': 'Asia', 'Singapore': 'Asia', 'Malaysia': 'Asia', 'Indonesia': 'Asia',
    'Vietnam': 'Asia', 'Philippines': 'Asia', 'Taiwan': 'Asia', 'Hong Kong': 'Asia',
    // Middle East
    'United Arab Emirates': 'Asia', 'Saudi Arabia': 'Asia', 'Qatar': 'Asia', 'Israel': 'Asia',
    // Oceania
    'Australia': 'Oceania', 'New Zealand': 'Oceania', 'Fiji': 'Oceania',
    // South America
    'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America',
    'Colombia': 'South America', 'Peru': 'South America',
    // Africa
    'South Africa': 'Africa', 'Egypt': 'Africa', 'Morocco': 'Africa', 'Kenya': 'Africa',
    'Nigeria': 'Africa', 'Ethiopia': 'Africa',
    // Antarctica (rare but possible)
    'Antarctica': 'Antarctica',
};

const ALL_CONTINENTS = ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];

export default function GeographicStats({ flights }: GeographicStatsProps) {
    const data = useMemo<{
        continents: string[];
        continentProgress: number;
        topCountries: { country: string; count: number; }[];
        topCities: { city: string; count: number; }[];
        longestFlight: Flight | null;
        totalCountries: number;
        totalCities: number;
    }>(() => {
        const countries = new Map<string, number>();
        const cities = new Map<string, number>();
        const continents = new Set<string>();
        let longestFlight: Flight | null = null;
        let maxDistance = 0;

        flights.forEach(flight => {
            // Countries
            [flight.originAirport.country, flight.destinationAirport.country].forEach(country => {
                countries.set(country, (countries.get(country) || 0) + 1);
                // Get continent
                const continent = COUNTRY_CONTINENTS[country] || 'Unknown';
                if (continent !== 'Unknown') continents.add(continent);
            });

            // Cities
            [flight.originAirport.city, flight.destinationAirport.city].forEach(city => {
                cities.set(city, (cities.get(city) || 0) + 1);
            });

            // Longest flight
            if ((flight.distance || 0) > maxDistance) {
                maxDistance = flight.distance || 0;
                longestFlight = flight;
            }
        });

        // Sort by count
        const topCountries = Array.from(countries.entries())
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const topCities = Array.from(cities.entries())
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            continents: Array.from(continents),
            continentProgress: (continents.size / 7) * 100,
            topCountries,
            topCities,
            longestFlight,
            totalCountries: countries.size,
            totalCities: cities.size,
        };
    }, [flights]);

    return (
        <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🌍</span> Geographic Breakdown
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Continent Progress */}
                <div className="lg:col-span-1">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">Continents Visited</h3>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl font-bold text-white">{data.continents.length}</div>
                        <div className="text-gray-500">/ 7</div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-neon-cyan to-neon-blue rounded-full transition-all duration-500"
                            style={{ width: `${data.continentProgress}%` }}
                        />
                    </div>

                    {/* Continent list */}
                    <div className="grid grid-cols-2 gap-2">
                        {ALL_CONTINENTS.map(continent => {
                            const visited = data.continents.includes(continent);
                            return (
                                <div
                                    key={continent}
                                    className={`text-xs px-2 py-1 rounded ${visited
                                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                                        : 'bg-white/5 text-gray-500 border border-white/10'
                                        }`}
                                >
                                    {visited ? '✓' : '○'} {continent}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Countries */}
                <div className="lg:col-span-1">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">
                        Top Countries ({data.totalCountries} total)
                    </h3>
                    <div className="space-y-2">
                        {data.topCountries.slice(0, 6).map((item, index) => (
                            <div key={item.country} className="flex items-center gap-3">
                                <div className="w-5 text-xs text-gray-500">{index + 1}.</div>
                                <div className="flex-1">
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-neon-blue rounded-full"
                                            style={{
                                                width: `${(item.count / data.topCountries[0].count) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="text-sm text-white truncate max-w-[100px]">{item.country}</div>
                                <div className="text-xs text-gray-500 w-8 text-right">{item.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Cities */}
                <div className="lg:col-span-1">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">
                        Top Cities ({data.totalCities} total)
                    </h3>
                    <div className="space-y-2">
                        {data.topCities.slice(0, 6).map((item, index) => (
                            <div key={item.city} className="flex items-center gap-3">
                                <div className="w-5 text-xs text-gray-500">{index + 1}.</div>
                                <div className="flex-1">
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-neon-cyan rounded-full"
                                            style={{
                                                width: `${(item.count / data.topCities[0].count) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="text-sm text-white truncate max-w-[100px]">{item.city}</div>
                                <div className="text-xs text-gray-500 w-8 text-right">{item.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Longest Flight */}
            {(() => {
                const flight = data.longestFlight;
                if (!flight) return null;

                return (
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Longest Flight</h3>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">🏆</div>
                                <div>
                                    <div className="text-lg font-bold text-white">
                                        {flight.originAirport.iata} → {flight.destinationAirport.iata}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {flight.originAirport.city} → {flight.destinationAirport.city}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-neon-cyan">
                                    {formatDistance(flight.distance || 0)}
                                </div>
                                <div className="text-sm text-gray-400">{flight.airline}</div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

