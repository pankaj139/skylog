import React, { useMemo } from 'react';
import type { Flight } from '../../types';
import { generateYearInReview } from '../../utils/yearInReview';
import StatCard from '../dashboard/StatCard';

interface YearInReviewProps {
    flights: Flight[];
    year: number;
}

const YearInReview: React.FC<YearInReviewProps> = ({ flights, year }) => {
    const data = useMemo(() => generateYearInReview(flights, year), [flights, year]);

    if (flights.length === 0) {
        return null;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Year in Review: {year}</h2>
                    <p className="text-gray-400">Your travel highlights for {year}</p>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon="✈️"
                    label="Total Flights"
                    value={data.totalFlights}
                    delay={0}
                />
                <StatCard
                    icon="📏"
                    label="Distance"
                    value={`${Math.round(data.totalDistance).toLocaleString()} km`}
                    delay={100}
                />
                <StatCard
                    icon="⏱️"
                    label="Time in Air"
                    value={`${Math.floor(data.totalDuration / 60)}h ${data.totalDuration % 60}m`}
                    delay={200}
                />
                <StatCard
                    icon="🌍"
                    label="Countries"
                    value={data.countriesVisited.length}
                    delay={300}
                />
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Longest Flight */}
                {data.longestFlight && (
                    <div className="glass p-6 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors">
                        <div className="text-4xl mb-4">🏆</div>
                        <h3 className="text-lg font-bold text-white mb-2">Longest Flight</h3>
                        <div className="text-cyan-400 font-mono text-xl mb-1">
                            {Math.round(data.longestFlight.distance || 0).toLocaleString()} km
                        </div>
                        <div className="text-gray-400 text-sm">
                            {data.longestFlight.originAirport.city} → {data.longestFlight.destinationAirport.city}
                        </div>
                    </div>
                )}

                {/* Top Airline */}
                {data.mostFlownAirline && (
                    <div className="glass p-6 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors">
                        <div className="text-4xl mb-4">🛫</div>
                        <h3 className="text-lg font-bold text-white mb-2">Top Airline</h3>
                        <div className="text-cyan-400 font-mono text-xl mb-1">
                            {data.mostFlownAirline.airline}
                        </div>
                        <div className="text-gray-400 text-sm">
                            {data.mostFlownAirline.count} flights
                        </div>
                    </div>
                )}

                {/* Top City */}
                {data.mostVisitedCity && (
                    <div className="glass p-6 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors">
                        <div className="text-4xl mb-4">❤️</div>
                        <h3 className="text-lg font-bold text-white mb-2">Favorite City</h3>
                        <div className="text-cyan-400 font-mono text-xl mb-1">
                            {data.mostVisitedCity.city}
                        </div>
                        <div className="text-gray-400 text-sm">
                            Visited {data.mostVisitedCity.count} times
                        </div>
                    </div>
                )}
            </div>

            {/* New Countries */}
            {data.newCountries.length > 0 && (
                <div className="glass p-8 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-2xl">🆕</span> New Horizons Unlocked
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {data.newCountries.map(country => (
                            <span
                                key={country}
                                className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-sm font-medium"
                            >
                                {country}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default YearInReview;
