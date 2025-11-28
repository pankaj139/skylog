/**
 * Analytics Page - Phase 2: Analytics Dashboard
 * 
 * Comprehensive travel analytics including:
 * - Carbon footprint tracking
 * - Travel patterns (calendar heatmap)
 * - Airline distribution
 * - Geographic breakdown
 * - Flight statistics
 * 
 * Uses CSS-based charts for lightweight visualization without additional dependencies.
 */

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CarbonFootprint from '../components/analytics/CarbonFootprint';
import TravelCalendar from '../components/analytics/TravelCalendar';
import AirlineChart from '../components/analytics/AirlineChart';
import GeographicStats from '../components/analytics/GeographicStats';
import TravelStats from '../components/analytics/TravelStats';
import YearInReview from '../components/analytics/YearInReview';
import { useFlightsStore } from '../store/flightsStore';
import { useAuthStore } from '../store/authStore';
import { getUserFlights } from '../services/flightService';

export default function Analytics() {
    const { user } = useAuthStore();
    const { flights, setFlights } = useFlightsStore();
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<string>('all');

    // Load flights
    useEffect(() => {
        if (user) {
            setLoading(true);
            getUserFlights(user.id)
                .then(setFlights)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user, setFlights]);

    // Get available years for filter
    const availableYears = useMemo(() => {
        const years = new Set<string>();
        flights.forEach(f => {
            years.add(new Date(f.date).getFullYear().toString());
        });
        return Array.from(years).sort((a, b) => Number(b) - Number(a));
    }, [flights]);

    // Filter flights by selected year
    const filteredFlights = useMemo(() => {
        if (selectedYear === 'all') return flights;
        return flights.filter(f =>
            new Date(f.date).getFullYear().toString() === selectedYear
        );
    }, [flights, selectedYear]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg">
                <Header />
                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner size="lg" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg pb-12">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
                            Travel Analytics <span className="text-4xl">📊</span>
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Insights into your travel patterns and environmental impact
                        </p>
                    </div>

                    {/* Year Filter */}
                    {availableYears.length > 0 && (
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                        >
                            <option value="all">All Time</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    )}
                </div>

                {flights.length === 0 ? (
                    <div className="glass rounded-xl p-12 border border-white/10 text-center">
                        <span className="text-6xl mb-4 block">📊</span>
                        <h2 className="text-2xl font-bold text-white mb-2">No Data Yet</h2>
                        <p className="text-gray-400">
                            Start adding flights to see your travel analytics!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Year in Review (only when specific year selected) */}
                        {selectedYear !== 'all' && (
                            <div className="mb-12">
                                <YearInReview
                                    flights={flights}
                                    year={parseInt(selectedYear)}
                                />
                            </div>
                        )}

                        {/* Travel Stats Summary */}
                        <TravelStats flights={filteredFlights} />

                        {/* Carbon Footprint & Airline Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <CarbonFootprint flights={filteredFlights} />
                            <AirlineChart flights={filteredFlights} />
                        </div>

                        {/* Travel Calendar */}
                        <TravelCalendar flights={filteredFlights} />

                        {/* Geographic Stats */}
                        <GeographicStats flights={filteredFlights} />
                    </div>
                )}
            </main>
        </div>
    );
}

