/**
 * AirlineChart Component - Phase 2: Analytics Dashboard
 * 
 * Displays airline distribution as a CSS-based pie/donut chart.
 */

import { useMemo } from 'react';
import type { Flight } from '../../types';
import { formatDistance } from '../../utils/formatters';

interface AirlineChartProps {
    flights: Flight[];
}

// Color palette for airlines
const COLORS = [
    '#00ffff', // cyan
    '#0096ff', // blue
    '#ff6b6b', // red
    '#4ecdc4', // teal
    '#f7dc6f', // yellow
    '#bb8fce', // purple
    '#82e0aa', // green
    '#f8b500', // orange
];

export default function AirlineChart({ flights }: AirlineChartProps) {
    const data = useMemo(() => {
        const airlineMap = new Map<string, { count: number; distance: number }>();
        
        flights.forEach(flight => {
            const existing = airlineMap.get(flight.airline) || { count: 0, distance: 0 };
            airlineMap.set(flight.airline, {
                count: existing.count + 1,
                distance: existing.distance + (flight.distance || 0),
            });
        });

        const total = flights.length;
        const entries = Array.from(airlineMap.entries())
            .map(([name, data]) => ({
                name,
                count: data.count,
                distance: data.distance,
                percentage: Math.round((data.count / total) * 100),
            }))
            .sort((a, b) => b.count - a.count);

        return entries;
    }, [flights]);

    // Generate conic gradient for donut chart
    const conicGradient = useMemo(() => {
        let accumulated = 0;
        const segments = data.map((item, index) => {
            const start = accumulated;
            accumulated += item.percentage;
            const end = accumulated;
            const color = COLORS[index % COLORS.length];
            return `${color} ${start}% ${end}%`;
        });
        return `conic-gradient(${segments.join(', ')})`;
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="glass rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>🏢</span> Airlines
                </h2>
                <div className="text-center py-8 text-gray-500">
                    No airline data available
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🏢</span> Airlines
            </h2>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Donut Chart */}
                <div className="flex-shrink-0 flex items-center justify-center">
                    <div className="relative">
                        <div
                            className="w-40 h-40 rounded-full"
                            style={{ background: conicGradient }}
                        />
                        {/* Inner circle for donut effect */}
                        <div className="absolute inset-4 bg-dark-surface rounded-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{data.length}</div>
                                <div className="text-xs text-gray-400">Airlines</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2 max-h-60 overflow-y-auto">
                    {data.map((item, index) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-white font-medium text-sm truncate max-w-[120px]">
                                    {item.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-400">{item.count} flights</span>
                                <span className="text-white font-medium w-12 text-right">
                                    {item.percentage}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Airline Highlight */}
            {data.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-400">Most Flown Airline</div>
                            <div className="text-lg font-bold text-white">{data[0].name}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-white font-medium">{data[0].count} flights</div>
                            <div className="text-sm text-gray-400">{formatDistance(data[0].distance)}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

