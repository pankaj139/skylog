import { useState, useEffect } from 'react';
import { Sparkles, Compass, Home, Globe, SlidersHorizontal } from 'lucide-react';
import Header from '../components/layout/Header';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getRecommendations, type RecommendationResponse } from '../services/recommendationService';
import { useAuthStore } from '../store/authStore';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TRAVEL_STYLES = ['Adventure', 'Relaxation', 'Culture', 'Food', 'Nature', 'Urban', 'Beach', 'Mountains'];
const BUDGET_LEVELS = ['Budget', 'Mid-Range', 'Luxury'];

export default function Recommendations() {
    const { user } = useAuthStore();
    const [recommendations, setRecommendations] = useState<RecommendationResponse>({ domestic: [], international: [] });
    const [isLoading, setIsLoading] = useState(true);

    // Runtime filters
    const [showFilters, setShowFilters] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [selectedBudget, setSelectedBudget] = useState<string>('');

    useEffect(() => {
        if (!user) return;

        const fetchRecs = async () => {
            setIsLoading(true);
            try {
                const data = await getRecommendations(user.id, {
                    month: selectedMonth,
                    travelStyle: selectedStyles,
                    budgetLevel: selectedBudget
                });
                setRecommendations(data);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecs();
    }, [user, selectedMonth, selectedStyles, selectedBudget]);

    const hasRecommendations = recommendations.domestic.length > 0 || recommendations.international.length > 0;

    const toggleStyle = (style: string) => {
        setSelectedStyles(prev =>
            prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
        );
    };

    const hasActiveFilters = selectedMonth || selectedStyles.length > 0 || selectedBudget;

    return (
        <div className="min-h-screen bg-dark-bg pb-24">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-neon-blue mb-6 shadow-neon">
                        <Sparkles size={32} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">
                        AI Travel Recommendations
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Personalized destination suggestions based on your travel history and preferences.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-6 py-3 glass rounded-lg border border-white/10 hover:border-neon-blue/50 transition-all text-white mb-4"
                    >
                        <SlidersHorizontal size={20} />
                        <span>Customize Search</span>
                        {hasActiveFilters && (
                            <span className="ml-2 px-2 py-0.5 bg-neon-blue text-white text-xs rounded-full">
                                {(selectedMonth ? 1 : 0) + (selectedStyles.length > 0 ? 1 : 0) + (selectedBudget ? 1 : 0)}
                            </span>
                        )}
                    </button>

                    {showFilters && (
                        <div className="glass rounded-xl p-6 border border-white/10 space-y-6">
                            {/* Travel Month */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-3">
                                    Travel Month <span className="text-gray-500">(for seasonal recommendations)</span>
                                </label>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                    <button
                                        onClick={() => setSelectedMonth('')}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${!selectedMonth ? 'bg-neon-cyan text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        Any
                                    </button>
                                    {MONTHS.map(month => (
                                        <button
                                            key={month}
                                            onClick={() => setSelectedMonth(month)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedMonth === month ? 'bg-neon-cyan text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {month.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Travel Style Override */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-3">
                                    Travel Style <span className="text-gray-500">(for this trip)</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {TRAVEL_STYLES.map(style => (
                                        <button
                                            key={style}
                                            onClick={() => toggleStyle(style)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedStyles.includes(style)
                                                    ? 'bg-neon-blue text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Budget Override */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-3">
                                    Budget <span className="text-gray-500">(for this trip)</span>
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedBudget('')}
                                        className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${!selectedBudget ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        Any
                                    </button>
                                    {BUDGET_LEVELS.map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setSelectedBudget(level)}
                                            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${selectedBudget === level ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : hasRecommendations ? (
                    <div className="space-y-12">
                        {/* Domestic Recommendations */}
                        {recommendations.domestic.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <Home size={28} className="text-neon-cyan" />
                                    <h3 className="text-2xl font-bold text-white">Explore Your Home Country</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {recommendations.domestic.map((rec) => (
                                        <RecommendationCard key={rec.id} recommendation={rec} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* International Recommendations */}
                        {recommendations.international.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <Globe size={28} className="text-neon-blue" />
                                    <h3 className="text-2xl font-bold text-white">Discover the World</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {recommendations.international.map((rec) => (
                                        <RecommendationCard key={rec.id} recommendation={rec} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 glass rounded-2xl border border-white/10">
                        <Compass size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No Recommendations Yet</h3>
                        <p className="text-gray-400">
                            Add more flights to your history to get personalized travel suggestions.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
