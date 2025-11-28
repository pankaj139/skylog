/**
 * Year in Review Page - Phase 3
 * 
 * Displays an annual travel summary with animated statistics,
 * highlights, and a mini globe showing the year's routes.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import GlobeVisualization from '../components/globe/GlobeVisualization';
import { useFlightsStore } from '../store/flightsStore';
import { useAuthStore } from '../store/authStore';
import { getUserFlights } from '../services/flightService';
import { generateYearInReview, getAvailableYears } from '../utils/yearInReview';
import { formatDistance, formatDuration } from '../utils/formatters';
import type { YearInReviewData } from '../types';

export default function YearInReview() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { flights, setFlights } = useFlightsStore();

    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [reviewData, setReviewData] = useState<YearInReviewData | null>(null);
    const [animationStep, setAnimationStep] = useState(0);

    // Load flights
    useEffect(() => {
        if (user && flights.length === 0) {
            setLoading(true);
            getUserFlights(user.id)
                .then(setFlights)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user, flights.length, setFlights]);

    // Get available years
    const availableYears = useMemo(() => getAvailableYears(flights), [flights]);

    // Set initial year to most recent with data
    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    // Generate review data when year changes
    useEffect(() => {
        if (flights.length > 0) {
            const data = generateYearInReview(flights, selectedYear);
            setReviewData(data);
            // Reset and start animation
            setAnimationStep(0);
            const timer = setTimeout(() => setAnimationStep(1), 300);
            return () => clearTimeout(timer);
        }
    }, [flights, selectedYear]);

    // Progressive animation
    useEffect(() => {
        if (animationStep > 0 && animationStep < 10) {
            const timer = setTimeout(() => setAnimationStep(s => s + 1), 200);
            return () => clearTimeout(timer);
        }
    }, [animationStep]);

    // Filter flights for the selected year
    const yearFlights = useMemo(() =>
        flights.filter(f => new Date(f.date).getFullYear() === selectedYear),
        [flights, selectedYear]
    );

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

    if (availableYears.length === 0) {
        return (
            <div className="min-h-screen bg-dark-bg">
                <Header />
                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="text-center py-20">
                        <span className="text-6xl mb-4 block">📅</span>
                        <h2 className="text-2xl font-bold text-white mb-4">No Travel Data Yet</h2>
                        <p className="text-gray-400 mb-6">
                            Add some flights to see your Year in Review!
                        </p>
                        <Button variant="primary" onClick={() => navigate('/history')}>
                            Go to History
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg pb-24">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Header with Year Selector */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            Year in Review <span className="text-5xl">📊</span>
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Your travel journey in {selectedYear}
                        </p>
                    </div>

                    {/* Year Selector */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const idx = availableYears.indexOf(selectedYear);
                                if (idx < availableYears.length - 1) {
                                    setSelectedYear(availableYears[idx + 1]);
                                }
                            }}
                            disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
                            className="p-2 rounded-lg bg-dark-surface border border-white/10 text-white disabled:opacity-30 hover:border-neon-blue/50 transition-all"
                        >
                            ←
                        </button>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-6 py-3 bg-dark-surface border border-white/10 rounded-lg text-white text-xl font-bold focus:outline-none focus:border-neon-blue"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => {
                                const idx = availableYears.indexOf(selectedYear);
                                if (idx > 0) {
                                    setSelectedYear(availableYears[idx - 1]);
                                }
                            }}
                            disabled={availableYears.indexOf(selectedYear) === 0}
                            className="p-2 rounded-lg bg-dark-surface border border-white/10 text-white disabled:opacity-30 hover:border-neon-blue/50 transition-all"
                        >
                            →
                        </button>
                    </div>
                </div>

                {reviewData && reviewData.totalFlights > 0 ? (
                    <>
                        {/* Main Stats Hero */}
                        <div className="glass rounded-2xl p-8 border border-white/10 mb-8 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-neon-cyan/5 pointer-events-none" />

                            <div className="relative z-10 text-center mb-8">
                                <h2 className={`text-6xl md:text-8xl font-bold gradient-text transition-all duration-500 ${animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                    }`}>
                                    {reviewData.totalFlights}
                                </h2>
                                <p className={`text-xl text-gray-300 transition-all duration-500 delay-100 ${animationStep >= 1 ? 'opacity-100' : 'opacity-0'
                                    }`}>
                                    flights in {selectedYear}
                                </p>
                            </div>

                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <StatBox
                                    icon="📏"
                                    value={formatDistance(reviewData.totalDistance)}
                                    label="Distance"
                                    visible={animationStep >= 2}
                                />
                                <StatBox
                                    icon="⏱️"
                                    value={formatDuration(reviewData.totalDuration)}
                                    label="Time in Air"
                                    visible={animationStep >= 3}
                                />
                                <StatBox
                                    icon="🌍"
                                    value={reviewData.countriesVisited.length.toString()}
                                    label="Countries"
                                    visible={animationStep >= 4}
                                />
                                <StatBox
                                    icon="🏙️"
                                    value={reviewData.citiesVisited.length.toString()}
                                    label="Cities"
                                    visible={animationStep >= 5}
                                />
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {/* New Countries */}
                            {reviewData.newCountries.length > 0 && (
                                <HighlightCard
                                    title="New Countries Explored"
                                    icon="🆕"
                                    visible={animationStep >= 6}
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {reviewData.newCountries.map(country => (
                                            <span
                                                key={country}
                                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm"
                                            >
                                                {country}
                                            </span>
                                        ))}
                                    </div>
                                </HighlightCard>
                            )}

                            {/* Longest Flight */}
                            {reviewData.longestFlight && (
                                <HighlightCard
                                    title="Longest Flight"
                                    icon="🏆"
                                    visible={animationStep >= 6}
                                >
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white mb-1">
                                            {reviewData.longestFlight.originAirport.iata} → {reviewData.longestFlight.destinationAirport.iata}
                                        </p>
                                        <p className="text-gray-400">
                                            {formatDistance(reviewData.longestFlight.distance || 0)}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {reviewData.longestFlight.originAirport.city} → {reviewData.longestFlight.destinationAirport.city}
                                        </p>
                                    </div>
                                </HighlightCard>
                            )}

                            {/* Most Visited City */}
                            {reviewData.mostVisitedCity && (
                                <HighlightCard
                                    title="Most Visited City"
                                    icon="❤️"
                                    visible={animationStep >= 7}
                                >
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white mb-1">
                                            {reviewData.mostVisitedCity.city}
                                        </p>
                                        <p className="text-neon-blue">
                                            {reviewData.mostVisitedCity.count} visits
                                        </p>
                                    </div>
                                </HighlightCard>
                            )}

                            {/* Go-To Airline */}
                            {reviewData.mostFlownAirline && (
                                <HighlightCard
                                    title="Go-To Airline"
                                    icon="🛫"
                                    visible={animationStep >= 7}
                                >
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white mb-1">
                                            {reviewData.mostFlownAirline.airline}
                                        </p>
                                        <p className="text-neon-cyan">
                                            {reviewData.mostFlownAirline.count} flights
                                        </p>
                                    </div>
                                </HighlightCard>
                            )}

                            {/* First Flight */}
                            {reviewData.firstFlightOfYear && (
                                <HighlightCard
                                    title="First Flight of the Year"
                                    icon="🎉"
                                    visible={animationStep >= 8}
                                >
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white mb-1">
                                            {reviewData.firstFlightOfYear.originAirport.iata} → {reviewData.firstFlightOfYear.destinationAirport.iata}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {new Date(reviewData.firstFlightOfYear.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </HighlightCard>
                            )}

                            {/* Last Flight */}
                            {reviewData.lastFlightOfYear && (
                                <HighlightCard
                                    title="Last Flight of the Year"
                                    icon="🌙"
                                    visible={animationStep >= 8}
                                >
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white mb-1">
                                            {reviewData.lastFlightOfYear.originAirport.iata} → {reviewData.lastFlightOfYear.destinationAirport.iata}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {new Date(reviewData.lastFlightOfYear.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </HighlightCard>
                            )}
                        </div>

                        {/* Year's Routes Globe */}
                        <div className={`glass rounded-2xl p-6 border border-white/10 transition-all duration-500 ${animationStep >= 9 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}>
                            <h3 className="text-xl font-bold text-white mb-4">
                                Your {selectedYear} Journey Map
                            </h3>
                            <div className="h-[400px] rounded-xl overflow-hidden">
                                <GlobeVisualization
                                    flights={yearFlights}
                                    visualizationMode="routes"
                                    colorMode="default"
                                />
                            </div>
                        </div>

                        {/* Countries List */}
                        {reviewData.countriesVisited.length > 0 && (
                            <div className={`mt-8 glass rounded-2xl p-6 border border-white/10 transition-all duration-500 ${animationStep >= 9 ? 'opacity-100' : 'opacity-0'
                                }`}>
                                <h3 className="text-xl font-bold text-white mb-4">
                                    Countries Visited in {selectedYear}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {reviewData.countriesVisited.map(country => (
                                        <span
                                            key={country}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium ${reviewData.newCountries.includes(country)
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-dark-surface text-gray-300 border border-white/10'
                                                }`}
                                        >
                                            {country}
                                            {reviewData.newCountries.includes(country) && ' 🆕'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 glass rounded-2xl border border-white/10">
                        <span className="text-6xl mb-4 block">📅</span>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            No flights in {selectedYear}
                        </h2>
                        <p className="text-gray-400">
                            Select a different year to see your travel summary.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

// Stat Box Component
function StatBox({ icon, value, label, visible }: {
    icon: string;
    value: string;
    label: string;
    visible: boolean;
}) {
    return (
        <div className={`text-center transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
            <span className="text-3xl mb-2 block">{icon}</span>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-gray-400 text-sm">{label}</p>
        </div>
    );
}

// Highlight Card Component
function HighlightCard({ title, icon, visible, children }: {
    title: string;
    icon: string;
    visible: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={`glass rounded-xl p-5 border border-white/10 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{icon}</span>
                <h4 className="text-sm font-medium text-gray-400">{title}</h4>
            </div>
            {children}
        </div>
    );
}

