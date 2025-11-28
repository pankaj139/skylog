/**
 * TravelStats Component - Phase 2: Analytics Dashboard
 * 
 * Displays summary statistics for travel data.
 * Shows flights, distance, time, countries, etc.
 */

import { useMemo } from 'react';
import type { Flight } from '../../types';
import { formatDistance, formatDuration } from '../../utils/formatters';
import { getTotalEmissions, formatEmissions } from '../../utils/carbonCalculator';

interface TravelStatsProps {
    flights: Flight[];
}

export default function TravelStats({ flights }: TravelStatsProps) {
    const stats = useMemo(() => {
        const totalDistance = flights.reduce((sum, f) => sum + (f.distance || 0), 0);
        const totalDuration = flights.reduce((sum, f) => sum + (f.duration || 0), 0);
        
        const countries = new Set([
            ...flights.map(f => f.originAirport.country),
            ...flights.map(f => f.destinationAirport.country),
        ]);
        
        const airports = new Set([
            ...flights.map(f => f.originAirport.iata),
            ...flights.map(f => f.destinationAirport.iata),
        ]);
        
        const airlines = new Set(flights.map(f => f.airline));
        const aircraft = new Set(flights.filter(f => f.aircraftType).map(f => f.aircraftType!));
        
        const emissions = getTotalEmissions(flights);
        
        // Calculate averages
        const avgDistance = flights.length > 0 ? totalDistance / flights.length : 0;
        const avgDuration = flights.length > 0 ? totalDuration / flights.length : 0;
        
        // Domestic vs International
        const domestic = flights.filter(f => 
            f.originAirport.country === f.destinationAirport.country
        ).length;
        const international = flights.length - domestic;
        
        return {
            totalFlights: flights.length,
            totalDistance,
            totalDuration,
            countries: countries.size,
            airports: airports.size,
            airlines: airlines.size,
            aircraft: aircraft.size,
            emissions,
            avgDistance,
            avgDuration,
            domestic,
            international,
        };
    }, [flights]);

    const statItems = [
        { icon: '✈️', value: stats.totalFlights, label: 'Total Flights' },
        { icon: '📏', value: formatDistance(stats.totalDistance), label: 'Distance Flown' },
        { icon: '⏱️', value: formatDuration(stats.totalDuration), label: 'Time in Air' },
        { icon: '🌍', value: stats.countries, label: 'Countries' },
        { icon: '🛫', value: stats.airports, label: 'Airports' },
        { icon: '🏢', value: stats.airlines, label: 'Airlines' },
        { icon: '🛩️', value: stats.aircraft, label: 'Aircraft Types' },
        { icon: '🌱', value: formatEmissions(stats.emissions), label: 'CO₂ Emissions' },
    ];

    return (
        <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6">Overview</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {statItems.map((item, index) => (
                    <div
                        key={index}
                        className="text-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-neon-blue/30 transition-all"
                    >
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="text-xl font-bold text-white mb-1">{item.value}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-blue/20 flex items-center justify-center text-lg">📊</div>
                    <div>
                        <div className="text-sm text-gray-400">Avg Flight</div>
                        <div className="text-white font-medium">{formatDistance(stats.avgDistance)}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center text-lg">⏳</div>
                    <div>
                        <div className="text-sm text-gray-400">Avg Duration</div>
                        <div className="text-white font-medium">{formatDuration(stats.avgDuration)}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-lg">🏠</div>
                    <div>
                        <div className="text-sm text-gray-400">Domestic</div>
                        <div className="text-white font-medium">{stats.domestic} flights</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg">🌏</div>
                    <div>
                        <div className="text-sm text-gray-400">International</div>
                        <div className="text-white font-medium">{stats.international} flights</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

