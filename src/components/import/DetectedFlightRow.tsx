/**
 * DetectedFlightRow Component - Phase 3
 * 
 * Displays a single detected flight from Gmail with editing capabilities.
 * Shows confidence indicator and validation errors.
 */

import { useState } from 'react';
import type { DetectedFlight } from '../../hooks/useGmailImport';
import AirportSearch from '../flights/AirportSearch';
import AirlineSearch from '../flights/AirlineSearch';
import Input from '../common/Input';
import type { Airport } from '../../types';

interface DetectedFlightRowProps {
    flight: DetectedFlight;
    onToggleSelect: (id: string) => void;
    onUpdate: (id: string, updates: Partial<DetectedFlight>) => void;
}

export default function DetectedFlightRow({
    flight,
    onToggleSelect,
    onUpdate,
}: DetectedFlightRowProps) {
    const [isEditing, setIsEditing] = useState(false);

    const confidenceColors = {
        high: 'bg-green-500/20 text-green-400 border-green-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        low: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const confidenceLabels = {
        high: 'High Confidence',
        medium: 'Medium Confidence',
        low: 'Low Confidence',
    };

    const handleAirportChange = (field: 'originAirport' | 'destinationAirport', airport: Airport | null) => {
        if (airport) {
            onUpdate(flight.id, {
                [field]: airport,
                [field === 'originAirport' ? 'origin' : 'destination']: airport.iata,
            });
        }
    };

    const isValid = flight.originAirport && flight.destinationAirport && flight.airline && flight.date;

    return (
        <div className={`border rounded-lg transition-all ${
            flight.selected 
                ? 'border-neon-blue/50 bg-neon-blue/5' 
                : 'border-white/10 bg-dark-surface'
        }`}>
            {/* Header Row */}
            <div className="p-4 flex items-center gap-4">
                {/* Checkbox */}
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={flight.selected}
                        onChange={() => onToggleSelect(flight.id)}
                        className="w-5 h-5 rounded border-white/20 bg-dark-surface text-neon-blue focus:ring-neon-blue/50 cursor-pointer"
                    />
                </label>

                {/* Flight Route */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-white font-medium">
                        <span className={flight.originAirport ? '' : 'text-red-400'}>
                            {flight.origin || '???'}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className={flight.destinationAirport ? '' : 'text-red-400'}>
                            {flight.destination || '???'}
                        </span>
                        {flight.flightNumber && (
                            <span className="text-gray-400 text-sm ml-2">
                                ({flight.flightNumber})
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                        {flight.rawSubject}
                    </div>
                </div>

                {/* Airline */}
                <div className="hidden sm:block text-sm text-gray-300 w-32 truncate">
                    {flight.airline || <span className="text-red-400">Unknown</span>}
                </div>

                {/* Date */}
                <div className="hidden md:block text-sm text-gray-300 w-28">
                    {flight.date || <span className="text-red-400">No date</span>}
                </div>

                {/* Confidence Badge */}
                <div className={`px-2 py-1 rounded text-xs border ${confidenceColors[flight.confidence]}`}>
                    {confidenceLabels[flight.confidence]}
                </div>

                {/* Edit Button */}
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`p-2 rounded-lg transition-colors ${
                        isEditing 
                            ? 'bg-neon-blue/20 text-neon-blue' 
                            : 'hover:bg-white/5 text-gray-400 hover:text-white'
                    }`}
                    title={isEditing ? 'Close editor' : 'Edit details'}
                >
                    {isEditing ? '✕' : '✏️'}
                </button>
            </div>

            {/* Validation Errors */}
            {flight.errors.length > 0 && !isEditing && (
                <div className="px-4 pb-3">
                    <div className="text-xs text-yellow-400 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{flight.errors.join(' • ')}</span>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {isEditing && (
                <div className="p-4 border-t border-white/10 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AirportSearch
                            label="Origin Airport"
                            value={flight.originAirport || null}
                            onChange={(airport) => handleAirportChange('originAirport', airport)}
                            placeholder="Search origin..."
                        />
                        <AirportSearch
                            label="Destination Airport"
                            value={flight.destinationAirport || null}
                            onChange={(airport) => handleAirportChange('destinationAirport', airport)}
                            placeholder="Search destination..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <AirlineSearch
                            label="Airline"
                            value={flight.airline || ''}
                            onChange={(airline) => onUpdate(flight.id, { airline })}
                            placeholder="Search airline..."
                        />
                        <Input
                            label="Flight Number"
                            value={flight.flightNumber || ''}
                            onChange={(e) => onUpdate(flight.id, { flightNumber: e.target.value })}
                            placeholder="e.g. BA123"
                        />
                        <Input
                            type="date"
                            label="Date"
                            value={flight.date || ''}
                            onChange={(e) => onUpdate(flight.id, { date: e.target.value })}
                        />
                    </div>

                    {/* Email Preview */}
                    <div className="p-3 bg-dark-bg rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Original Email</p>
                        <p className="text-sm text-gray-400">{flight.rawSnippet}</p>
                    </div>

                    {/* Validation Status */}
                    {isValid ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <span>✓</span>
                            <span>All required fields are filled</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-yellow-400 text-sm">
                            <span>⚠️</span>
                            <span>Please fill in all required fields to import</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

