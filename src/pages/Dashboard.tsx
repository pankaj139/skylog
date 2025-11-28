import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Map, Globe } from 'lucide-react';
import Header from '../components/layout/Header';
import StatCard from '../components/dashboard/StatCard';
import EmptyState from '../components/common/EmptyState';
import GlobeVisualization from '../components/globe/GlobeVisualization';
import FlightMap2D from '../components/globe/FlightMap2D';
import GlobeModeSelector, { type GlobeVisualizationMode, type GlobeColorMode } from '../components/globe/GlobeModeSelector';
import AirlineLogo from '../components/common/AirlineLogo';
import FlightStatusBadge from '../components/flights/FlightStatusBadge';
import LiveFlightMap from '../components/flights/LiveFlightMap';
import { useUIStore } from '../store/uiStore';
import { useFlightsStore } from '../store/flightsStore';
import { useAuthStore } from '../store/authStore';
import { getUserFlights } from '../services/flightService';
import { getFlightStatus, getLiveFlightData } from '../services/flightTrackingService';
import { preloadAirlineLogos } from '../utils/airlineLogoCache';
import { formatDistance, formatDuration, formatDate } from '../utils/formatters';
import { getYearRange } from '../utils/globeHeatmapData';
import AchievementList from '../components/achievements/AchievementList';
import { useAchievementStore } from '../store/useAchievementStore';

export default function Dashboard() {
    const navigate = useNavigate();
    const { openAddFlightModal } = useUIStore();
    const { flights, setFlights } = useFlightsStore();
    const { user } = useAuthStore();
    const { initialize, checkAchievements } = useAchievementStore();

    // Map view type (2D or 3D)
    const [mapView, setMapView] = useState<'2d' | '3d'>('3d');

    // Globe visualization state
    const [visualizationMode, setVisualizationMode] = useState<GlobeVisualizationMode>('routes');
    const [colorMode, setColorMode] = useState<GlobeColorMode>('default');
    const [isTimelapsePlaying, setIsTimelapsePlaying] = useState(false);
    const [timelapseYear, setTimelapseYear] = useState<number | undefined>();
    const [filterYear, setFilterYear] = useState<number | undefined>();
    const [filterAirline, setFilterAirline] = useState<string | undefined>();

    // Flight tracking state
    const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);

    // Load flights from Firestore
    useEffect(() => {
        if (user) {
            getUserFlights(user.id)
                .then((loadedFlights) => {
                    setFlights(loadedFlights);
                    // Preload all airline logos for better UX
                    const airlineNames = [...new Set(loadedFlights.map(f => f.airline))];
                    preloadAirlineLogos(airlineNames);

                    // Initialize achievements
                    initialize(user.id).then(() => {
                        checkAchievements(loadedFlights);
                    });
                })
                .catch(console.error);
        }
    }, [user, setFlights, initialize, checkAchievements]);

    // Calculate year range and airlines for globe controls
    const { minYear, maxYear } = useMemo(() => getYearRange(flights), [flights]);
    const airlines = useMemo(() =>
        [...new Set(flights.map(f => f.airline))].sort(),
        [flights]
    );

    // Initialize timelapse year when mode changes
    useEffect(() => {
        if (visualizationMode === 'timelapse' && !timelapseYear && minYear) {
            setTimelapseYear(minYear);
        }
    }, [visualizationMode, timelapseYear, minYear]);

    // Timelapse auto-play
    useEffect(() => {
        if (!isTimelapsePlaying || visualizationMode !== 'timelapse' || !timelapseYear) return;

        const interval = setInterval(() => {
            setTimelapseYear(prev => {
                if (prev && prev < maxYear) {
                    return prev + 1;
                } else {
                    setIsTimelapsePlaying(false);
                    return prev;
                }
            });
        }, 1500);

        return () => clearInterval(interval);
    }, [isTimelapsePlaying, visualizationMode, timelapseYear, maxYear]);

    const handleTimelapseToggle = useCallback(() => {
        if (isTimelapsePlaying) {
            setIsTimelapsePlaying(false);
        } else {
            if (timelapseYear === maxYear) {
                setTimelapseYear(minYear);
            }
            setIsTimelapsePlaying(true);
        }
    }, [isTimelapsePlaying, timelapseYear, maxYear, minYear]);

    // Get upcoming flights (scheduled or active)
    const upcomingFlights = useMemo(() => {
        return flights
            .filter(f => {
                // Include flights from today and future
                // Also include active flights even if date was yesterday (long haul)
                const status = getFlightStatus(f);
                return status === 'active' || status === 'scheduled' || status === 'delayed';
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
    }, [flights]);

    // Get recent flights (sorted by date, most recent first)
    const recentFlights = useMemo(() => {
        return flights
            .filter(f => {
                const status = getFlightStatus(f);
                return status === 'landed' || status === 'cancelled';
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5); // Show only 5 most recent
    }, [flights]);


    // Calculate statistics from flights
    const stats = useMemo(() => {
        const totalDistance = flights.reduce((sum, f) => sum + (f.distance || 0), 0);
        return {
            flights: flights.length,
            airports: new Set([
                ...flights.map(f => f.originAirport.iata),
                ...flights.map(f => f.destinationAirport.iata)
            ]).size,
            airlines: new Set(flights.map(f => f.airline)).size,
            countries: new Set([
                ...flights.map(f => f.originAirport.country),
                ...flights.map(f => f.destinationAirport.country)
            ]).size,
            totalDistance,
        };
    }, [flights]);

    // Format total distance for display (e.g., 12,345 km or 1.2M km)
    const formattedDistance = useMemo(() => {
        if (stats.totalDistance >= 1000000) {
            return `${(stats.totalDistance / 1000000).toFixed(1)}M`;
        }
        return stats.totalDistance.toLocaleString();
    }, [stats.totalDistance]);

    const hasFlights = flights.length > 0;

    return (
        <div className="min-h-screen bg-dark-bg pb-24">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <div className="mb-8 sm:mb-12 animate-fade-in">
                    <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                        Welcome Back! <span className="text-3xl sm:text-5xl">👋</span>
                    </h2>
                    <p className="text-gray-400 text-base sm:text-lg">
                        Track your journey across the globe
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-8 sm:mb-12">
                    <StatCard icon="✈️" value={stats.flights} label="Flights" delay={0} />
                    <StatCard icon="🌐" value={stats.airports} label="Airports" delay={100} />
                    <StatCard icon="🏢" value={stats.airlines} label="Airlines" delay={200} />
                    <StatCard icon="🌍" value={stats.countries} label="Countries" delay={300} />
                    <StatCard icon="📏" value={formattedDistance} label="km Travelled" delay={400} />
                </div>

                {/* Achievements Section */}
                <div className="mb-12 animate-fade-in" style={{ animationDelay: '500ms' }}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-white">Your Achievements</h3>
                        <button
                            onClick={() => navigate('/achievements')}
                            className="text-neon-blue hover:text-neon-cyan transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            View All <span>→</span>
                        </button>
                    </div>
                    <AchievementList limit={5} hideFilters />
                </div>

                {/* Globe Visualization */}
                <div className="glass rounded-2xl p-8 mb-12 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Your World Map</h3>
                        
                        {/* 2D/3D Toggle */}
                        {hasFlights && (
                            <div className="flex items-center gap-2 bg-dark-surface/50 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => setMapView('3d')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                                        mapView === '3d'
                                            ? 'bg-neon-blue text-white'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Globe size={18} />
                                    <span className="text-sm font-medium">3D Globe</span>
                                </button>
                                <button
                                    onClick={() => setMapView('2d')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                                        mapView === '2d'
                                            ? 'bg-neon-blue text-white'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Map size={18} />
                                    <span className="text-sm font-medium">2D Map</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {hasFlights ? (
                        <>
                            {/* Globe Mode Selector */}
                            <div className="mb-6">
                                <GlobeModeSelector
                                    mode={visualizationMode}
                                    onModeChange={setVisualizationMode}
                                    colorMode={colorMode}
                                    onColorModeChange={setColorMode}
                                    isTimelapsePlaying={isTimelapsePlaying}
                                    onTimelapseToggle={handleTimelapseToggle}
                                    timelapseYear={timelapseYear}
                                    onTimelapseYearChange={setTimelapseYear}
                                    minYear={minYear}
                                    maxYear={maxYear}
                                    filterYear={filterYear}
                                    onFilterYearChange={setFilterYear}
                                    filterAirline={filterAirline}
                                    onFilterAirlineChange={setFilterAirline}
                                    airlines={airlines}
                                />
                            </div>

                            <div className="bg-gradient-radial from-dark-surface to-dark-bg rounded-xl overflow-hidden h-[500px] lg:h-[500px] md:h-[400px] sm:h-[300px]">
                                {mapView === '3d' ? (
                                    <GlobeVisualization
                                        flights={flights}
                                        visualizationMode={visualizationMode}
                                        colorMode={colorMode}
                                        timelapseYear={timelapseYear}
                                        filterYear={filterYear}
                                        filterAirline={filterAirline}
                                    />
                                ) : (
                                    <FlightMap2D
                                        flights={flights}
                                        visualizationMode={visualizationMode}
                                        colorMode={colorMode}
                                        timelapseYear={timelapseYear}
                                        filterYear={filterYear}
                                        filterAirline={filterAirline}
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-[500px] lg:h-[500px] md:h-[400px] sm:h-[300px] flex items-center justify-center bg-gradient-radial from-dark-surface/50 to-dark-bg rounded-xl">
                            <EmptyState
                                icon={<span className="text-6xl">✈️</span>}
                                title="No Flights Yet"
                                description="Start tracking your travels by adding your first flight!"
                                action={{
                                    label: 'Add Your First Flight',
                                    onClick: openAddFlightModal,
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Upcoming Flights */}
                {hasFlights && upcomingFlights.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Plane className="text-neon-blue" />
                            Upcoming Flights
                        </h3>
                        <div className="space-y-4">
                            {upcomingFlights.map((flight) => {
                                const status = getFlightStatus(flight);
                                const liveData = status === 'active' ? getLiveFlightData(flight) : null;
                                const isExpanded = expandedFlightId === flight.id;

                                return (
                                    <div key={flight.id} className="glass rounded-xl overflow-hidden border border-white/10 hover:border-neon-blue/40 transition-all duration-300">
                                        <div
                                            className="p-5 cursor-pointer"
                                            onClick={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl">
                                                        🛫
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <div className="text-xl font-semibold text-white">
                                                                {flight.originAirport.iata} → {flight.destinationAirport.iata}
                                                            </div>
                                                            <FlightStatusBadge status={status} />
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            {flight.originAirport.city} → {flight.destinationAirport.city}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {formatDate(flight.date)} • {formatDuration(flight.duration || 0)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <AirlineLogo airlineName={flight.airline} size="lg" />
                                                    <div className="flex flex-col lg:items-end gap-1 lg:text-right">
                                                        <div className="text-white font-semibold">{flight.airline}</div>
                                                        <div className="text-sm text-gray-400">{flight.flightNumber}</div>
                                                        {status === 'active' && (
                                                            <div className="flex items-center gap-1 text-xs text-neon-blue animate-pulse">
                                                                <Map size={12} />
                                                                Live Tracking Available
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Live Map */}
                                        {isExpanded && status === 'active' && liveData && (
                                            <div className="border-t border-white/10 p-4 bg-black/20 animate-fade-in">
                                                <LiveFlightMap flight={flight} liveData={liveData} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent Trips */}
                {hasFlights && recentFlights.length > 0 && (
                    <div className="mb-12">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Recent Trips</h3>
                            <button
                                onClick={() => navigate('/history')}
                                className="text-neon-blue hover:text-neon-cyan transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                View All <span>→</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {recentFlights.map((flight) => (
                                <div
                                    key={flight.id}
                                    onClick={() => navigate(`/journey/${flight.id}`)}
                                    className="glass rounded-xl p-5 border border-white/10 hover:border-neon-blue/40 transition-all duration-300 hover:scale-[1.01] hover:shadow-neon/50 cursor-pointer"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl flex-shrink-0">🛫</div>
                                            <div>
                                                <div className="text-xl font-semibold text-white mb-1">
                                                    {flight.originAirport.iata} → {flight.destinationAirport.iata}
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    {flight.originAirport.city} → {flight.destinationAirport.city}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {formatDistance(flight.distance || 0)} • {formatDuration(flight.duration || 0)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <AirlineLogo airlineName={flight.airline} size="lg" />
                                            <div className="flex flex-col lg:items-end gap-1 lg:text-right">
                                                <div className="text-white font-semibold">{flight.airline}</div>
                                                {flight.flightNumber && (
                                                    <div className="text-sm text-gray-400">{flight.flightNumber}</div>
                                                )}
                                                <div className="text-sm text-gray-400">{formatDate(flight.date)}</div>
                                                {flight.seatClass && (
                                                    <div className="text-xs text-neon-blue font-medium uppercase tracking-wider">
                                                        {flight.seatClass}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            <button
                onClick={openAddFlightModal}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-full shadow-neon-strong flex items-center justify-center text-dark-bg text-3xl font-bold hover:scale-125 hover:w-16 hover:h-16 transition-all duration-300 animate-pulse-neon z-50"
                aria-label="Add flight"
            >
                +
            </button>
        </div>
    );
}
