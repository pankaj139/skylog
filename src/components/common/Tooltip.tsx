import type { ReactNode } from 'react';

interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-dark-surface',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-dark-surface',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-dark-surface',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-dark-surface',
    };

    return (
        <div className="relative inline-block group">
            {children}
            <div
                className={`absolute ${positionClasses[position]} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none`}
            >
                <div className="bg-dark-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white whitespace-nowrap shadow-lg">
                    {content}
                </div>
                <div
                    className={`absolute ${arrowClasses[position]} border-4`}
                />
            </div>
        </div>
    );
}

