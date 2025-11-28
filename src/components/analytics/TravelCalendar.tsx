/**
 * TravelCalendar Component - Phase 2: Analytics Dashboard
 * 
 * Displays a heatmap calendar showing flight frequency by month.
 */

import { useMemo } from 'react';
import type { Flight } from '../../types';

interface TravelCalendarProps {
    flights: Flight[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TravelCalendar({ flights }: TravelCalendarProps) {
    const data = useMemo(() => {
        // Group flights by year and month
        const yearMonthMap = new Map<string, Map<number, number>>();
        
        flights.forEach(flight => {
            const date = new Date(flight.date);
            const year = date.getFullYear().toString();
            const month = date.getMonth();
            
            if (!yearMonthMap.has(year)) {
                yearMonthMap.set(year, new Map());
            }
            const monthMap = yearMonthMap.get(year)!;
            monthMap.set(month, (monthMap.get(month) || 0) + 1);
        });

        // Convert to sorted array
        const years = Array.from(yearMonthMap.keys()).sort((a, b) => Number(b) - Number(a));
        
        // Find max for color scaling
        let maxFlights = 0;
        yearMonthMap.forEach(monthMap => {
            monthMap.forEach(count => {
                if (count > maxFlights) maxFlights = count;
            });
        });

        return { yearMonthMap, years, maxFlights };
    }, [flights]);

    // Get intensity color based on count
    const getIntensity = (count: number) => {
        if (count === 0) return 'bg-white/5';
        const intensity = count / data.maxFlights;
        if (intensity > 0.75) return 'bg-neon-cyan';
        if (intensity > 0.5) return 'bg-neon-cyan/70';
        if (intensity > 0.25) return 'bg-neon-cyan/40';
        return 'bg-neon-cyan/20';
    };

    // Get busiest month overall
    const busiestMonth = useMemo(() => {
        const monthCounts = new Array(12).fill(0);
        flights.forEach(flight => {
            const month = new Date(flight.date).getMonth();
            monthCounts[month]++;
        });
        const maxIndex = monthCounts.indexOf(Math.max(...monthCounts));
        return { month: MONTHS[maxIndex], count: monthCounts[maxIndex] };
    }, [flights]);

    // Get busiest day of week
    const busiestDay = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayCounts = new Array(7).fill(0);
        flights.forEach(flight => {
            const day = new Date(flight.date).getDay();
            dayCounts[day]++;
        });
        const maxIndex = dayCounts.indexOf(Math.max(...dayCounts));
        return { day: days[maxIndex], count: dayCounts[maxIndex] };
    }, [flights]);

    if (data.years.length === 0) {
        return (
            <div className="glass rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>📅</span> Travel Calendar
                </h2>
                <div className="text-center py-8 text-gray-500">
                    No calendar data available
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📅</span> Travel Calendar
            </h2>

            {/* Calendar Heatmap */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="w-16"></th>
                            {MONTHS.map(month => (
                                <th key={month} className="px-1 py-2 text-xs text-gray-500 font-normal">
                                    {month}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.years.map(year => {
                            const monthMap = data.yearMonthMap.get(year)!;
                            return (
                                <tr key={year}>
                                    <td className="text-sm text-gray-400 font-medium pr-3">{year}</td>
                                    {MONTHS.map((_, monthIndex) => {
                                        const count = monthMap.get(monthIndex) || 0;
                                        return (
                                            <td key={monthIndex} className="p-1">
                                                <div
                                                    className={`w-full aspect-square rounded-md ${getIntensity(count)} transition-colors cursor-default group relative`}
                                                    title={`${MONTHS[monthIndex]} ${year}: ${count} flights`}
                                                >
                                                    {count > 0 && (
                                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-dark-bg opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Less</span>
                    <div className="flex gap-1">
                        <div className="w-4 h-4 rounded bg-white/5" />
                        <div className="w-4 h-4 rounded bg-neon-cyan/20" />
                        <div className="w-4 h-4 rounded bg-neon-cyan/40" />
                        <div className="w-4 h-4 rounded bg-neon-cyan/70" />
                        <div className="w-4 h-4 rounded bg-neon-cyan" />
                    </div>
                    <span className="text-xs text-gray-500">More</span>
                </div>

                {/* Stats */}
                <div className="flex gap-6">
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Busiest Month</div>
                        <div className="text-white font-medium">
                            {busiestMonth.month} ({busiestMonth.count} flights)
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Busiest Day</div>
                        <div className="text-white font-medium">
                            {busiestDay.day} ({busiestDay.count} flights)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

