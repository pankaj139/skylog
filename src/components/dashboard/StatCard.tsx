/**
 * StatCard Component
 * 
 * Displays a statistic with an animated counter effect.
 * Supports both numeric values (with animation) and string values (displayed as-is).
 * 
 * Usage:
 * <StatCard icon="✈️" value={42} label="Flights" />
 * <StatCard icon="📏" value="12,345" label="km Travelled" />
 */

import { useEffect, useState } from 'react';

interface StatCardProps {
    icon: string;
    value: number | string;
    label: string;
    delay?: number;
}

export default function StatCard({ icon, value, label, delay = 0 }: StatCardProps) {
    const [displayValue, setDisplayValue] = useState<string | number>(typeof value === 'string' ? value : 0);
    const isNumeric = typeof value === 'number';

    useEffect(() => {
        // If value is a string, just display it directly
        if (!isNumeric) {
            const timeout = setTimeout(() => {
                setDisplayValue(value);
            }, delay);
            return () => clearTimeout(timeout);
        }

        // Animate numeric values
        const timeout = setTimeout(() => {
            let start = 0;
            const end = value as number;
            const duration = 1000;
            const increment = end / (duration / 16);

            if (end === 0) {
                setDisplayValue(0);
                return;
            }

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setDisplayValue(end);
                    clearInterval(timer);
                } else {
                    setDisplayValue(Math.floor(start));
                }
            }, 16);

            return () => clearInterval(timer);
        }, delay);

        return () => clearTimeout(timeout);
    }, [value, delay, isNumeric]);

    // Format display value with commas for large numbers
    const formattedValue = typeof displayValue === 'number' 
        ? displayValue.toLocaleString() 
        : displayValue;

    return (
        <div className="glass rounded-xl p-6 border border-neon-blue/20 hover:border-neon-blue/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-neon flex flex-col items-center justify-center text-center min-h-[160px] group">
            <div className="text-5xl mb-3 transition-transform group-hover:scale-110">{icon}</div>
            <div className="text-4xl font-bold gradient-text mb-2 leading-none">{formattedValue}</div>
            <div className="text-sm text-gray-400 uppercase tracking-widest font-medium">{label}</div>
        </div>
    );
}
