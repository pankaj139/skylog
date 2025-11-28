/**
 * CarbonFootprint Component - Phase 2: Analytics Dashboard
 * 
 * Displays carbon footprint data with emissions breakdown and offset suggestions.
 */

import { useMemo } from 'react';
import type { Flight } from '../../types';
import {
    getTotalEmissions,
    getEmissionsBreakdown,
    getCarbonOffsetSuggestions,
    compareToAverage,
    formatEmissions,
} from '../../utils/carbonCalculator';

interface CarbonFootprintProps {
    flights: Flight[];
}

export default function CarbonFootprint({ flights }: CarbonFootprintProps) {
    const data = useMemo(() => {
        const total = getTotalEmissions(flights);
        const breakdown = getEmissionsBreakdown(flights);
        const suggestions = getCarbonOffsetSuggestions(total);
        const comparison = compareToAverage(total, flights.length);
        
        return { total, breakdown, suggestions, comparison };
    }, [flights]);

    // Get max value for scaling bar chart
    const maxMonthlyEmission = Math.max(
        ...data.breakdown.byMonth.map(m => m.emissions),
        1
    );

    return (
        <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🌱</span> Carbon Footprint
            </h2>

            {/* Total Emissions */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                <div>
                    <div className="text-3xl font-bold text-white">
                        {formatEmissions(data.total)}
                    </div>
                    <div className="text-sm text-gray-400">Total CO₂ Emissions</div>
                </div>
                <div className="text-right">
                    <div className={`text-lg font-semibold ${
                        data.comparison.betterThanAverage ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                        {data.comparison.percentOfAverage}%
                    </div>
                    <div className="text-xs text-gray-500">of avg. traveler/year</div>
                </div>
            </div>

            {/* Monthly Breakdown Bar Chart */}
            <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Monthly Emissions</h3>
                <div className="space-y-2">
                    {data.breakdown.byMonth.slice(-6).map((month, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-16 text-xs text-gray-500">{month.month.split(' ')[0]}</div>
                            <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                                    style={{ 
                                        width: `${(month.emissions / maxMonthlyEmission) * 100}%` 
                                    }}
                                />
                            </div>
                            <div className="w-20 text-right text-sm text-white">
                                {Math.round(month.emissions)} kg
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Emissions by Seat Class */}
            <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">By Seat Class</h3>
                <div className="flex flex-wrap gap-2">
                    {data.breakdown.bySeatClass.map((item, index) => (
                        <div
                            key={index}
                            className="px-3 py-2 bg-white/5 rounded-lg border border-white/10"
                        >
                            <div className="text-sm text-white font-medium">{item.seatClass}</div>
                            <div className="text-xs text-gray-400">{Math.round(item.emissions)} kg</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Offset Suggestions */}
            <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Offset Your Impact</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl mb-1">🌳</div>
                        <div className="text-lg font-bold text-white">{data.suggestions.treesNeeded}</div>
                        <div className="text-xs text-gray-400">trees for 1 year</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl mb-1">💰</div>
                        <div className="text-lg font-bold text-white">
                            ${data.suggestions.offsetCostRange.low}-${data.suggestions.offsetCostRange.high}
                        </div>
                        <div className="text-xs text-gray-400">to offset</div>
                    </div>
                </div>

                {/* Equivalents */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>≈ {data.suggestions.equivalents.carKm.toLocaleString()} km by car</span>
                    <span>≈ {data.suggestions.equivalents.beefMeals} beef meals</span>
                </div>
            </div>
        </div>
    );
}

