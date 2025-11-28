/**
 * ImportPreview Component - Phase 2: CSV Import
 * 
 * Displays a preview of flights to be imported with validation status.
 * Allows user to confirm and execute the import.
 */

import { useState, useMemo } from 'react';
import Button from '../common/Button';
import { validateFlightRow, parseDate } from '../../utils/csvParser';
import { AIRPORTS as airportsData } from '../../data/airports';
import { useAuthStore } from '../../store/authStore';
import { useFlightsStore } from '../../store/flightsStore';
import { createFlight } from '../../services/flightService';
import type { Airport } from '../../types';

interface ImportPreviewProps {
    csvData: { headers: string[]; rows: Record<string, string>[] };
    columnMapping: Record<string, string>;
    onBack: () => void;
    onImportComplete: (count: number) => void;
}

export default function ImportPreview({
    csvData,
    columnMapping,
    onBack,
    onImportComplete,
}: ImportPreviewProps) {
    const { user } = useAuthStore();
    const { addFlight } = useFlightsStore();
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [importErrors, setImportErrors] = useState<string[]>([]);

    // Create airport lookup map
    const airportMap = useMemo(() => {
        const map = new Map<string, Airport>();
        airportsData.forEach(airport => {
            map.set(airport.iata, airport);
        });
        return map;
    }, []);

    // Validate all rows
    const validationResults = useMemo(() => {
        return csvData.rows.map((row, index) => {
            const result = validateFlightRow(row, columnMapping, airportMap);
            return {
                rowIndex: index,
                ...result,
                row,
            };
        });
    }, [csvData.rows, columnMapping, airportMap]);

    const validCount = validationResults.filter(r => r.valid).length;
    const invalidCount = validationResults.filter(r => !r.valid).length;

    /**
     * Executes the import
     */
    const handleImport = async () => {
        if (!user) return;

        setImporting(true);
        setProgress(0);
        setImportErrors([]);

        const validRows = validationResults.filter(r => r.valid && r.data);
        let imported = 0;
        const errors: string[] = [];

        for (let i = 0; i < validRows.length; i++) {
            const { data, rowIndex } = validRows[i];
            if (!data) continue;

            try {
                const originAirport = airportMap.get(data.originIata)!;
                const destinationAirport = airportMap.get(data.destinationIata)!;
                const date = parseDate(data.date);

                const flightId = await createFlight(user.id, {
                    originAirport,
                    destinationAirport,
                    airline: data.airline,
                    flightNumber: data.flightNumber,
                    date,
                    aircraftType: data.aircraftType,
                    seatNumber: data.seatNumber,
                    seatClass: data.seatClass as 'Economy' | 'Premium Economy' | 'Business' | 'First' | undefined,
                    notes: data.notes,
                });

                // Add to local store
                addFlight({
                    id: flightId,
                    userId: user.id,
                    originAirport,
                    destinationAirport,
                    airline: data.airline,
                    flightNumber: data.flightNumber,
                    date,
                    aircraftType: data.aircraftType,
                    seatNumber: data.seatNumber,
                    seatClass: data.seatClass as 'Economy' | 'Premium Economy' | 'Business' | 'First' | undefined,
                    notes: data.notes,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                imported++;
            } catch (err) {
                errors.push(`Row ${rowIndex + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }

            setProgress(Math.round(((i + 1) / validRows.length) * 100));
        }

        setImportErrors(errors);
        setImporting(false);

        if (imported > 0) {
            onImportComplete(imported);
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                    <div className="text-3xl font-bold text-white">{csvData.rows.length}</div>
                    <div className="text-sm text-gray-400">Total Rows</div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/30">
                    <div className="text-3xl font-bold text-green-400">{validCount}</div>
                    <div className="text-sm text-gray-400">Valid</div>
                </div>
                <div className={`rounded-xl p-4 text-center border ${invalidCount > 0
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-white/5 border-white/10'
                    }`}>
                    <div className={`text-3xl font-bold ${invalidCount > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {invalidCount}
                    </div>
                    <div className="text-sm text-gray-400">Invalid</div>
                </div>
            </div>

            {/* Preview Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 sticky top-0">
                            <tr>
                                <th className="px-3 py-2 text-left text-gray-400 font-medium w-12">#</th>
                                <th className="px-3 py-2 text-left text-gray-400 font-medium">Route</th>
                                <th className="px-3 py-2 text-left text-gray-400 font-medium">Airline</th>
                                <th className="px-3 py-2 text-left text-gray-400 font-medium">Date</th>
                                <th className="px-3 py-2 text-left text-gray-400 font-medium w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {validationResults.slice(0, 50).map((result, index) => {
                                const origin = result.row[columnMapping.originIata] || '';
                                const dest = result.row[columnMapping.destinationIata] || '';
                                const airline = result.row[columnMapping.airline] || '';
                                const date = result.row[columnMapping.date] || '';

                                return (
                                    <tr key={index} className={result.valid ? '' : 'bg-red-500/5'}>
                                        <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                                        <td className="px-3 py-2 text-white">
                                            {origin.toUpperCase()} → {dest.toUpperCase()}
                                        </td>
                                        <td className="px-3 py-2 text-gray-300">{airline}</td>
                                        <td className="px-3 py-2 text-gray-300">{date}</td>
                                        <td className="px-3 py-2">
                                            {result.valid ? (
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                                    ✓ Valid
                                                </span>
                                            ) : (
                                                <span
                                                    className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs cursor-help"
                                                    title={result.errors.join(', ')}
                                                >
                                                    ✗ Invalid
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {csvData.rows.length > 50 && (
                    <div className="px-4 py-2 bg-white/5 text-center text-sm text-gray-500">
                        Showing 50 of {csvData.rows.length} rows
                    </div>
                )}
            </div>

            {/* Validation Errors */}
            {invalidCount > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <h4 className="text-red-400 font-medium mb-2">Validation Errors</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                        {validationResults
                            .filter(r => !r.valid)
                            .slice(0, 10)
                            .map((result, index) => (
                                <p key={index} className="text-sm text-red-300">
                                    Row {result.rowIndex + 2}: {result.errors.join(', ')}
                                </p>
                            ))}
                        {invalidCount > 10 && (
                            <p className="text-sm text-red-400">
                                ... and {invalidCount - 10} more errors
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Import Progress */}
            {importing && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Importing...</span>
                        <span className="text-white">{progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-neon-blue transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Import Errors */}
            {importErrors.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <h4 className="text-yellow-400 font-medium mb-2">Import Warnings</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                        {importErrors.map((error, index) => (
                            <p key={index} className="text-sm text-yellow-300">{error}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-white/10">
                <Button variant="ghost" onClick={onBack} disabled={importing}>
                    ← Back
                </Button>
                <Button
                    variant="primary"
                    onClick={handleImport}
                    disabled={validCount === 0 || importing}
                    isLoading={importing}
                >
                    Import {validCount} Flight{validCount !== 1 ? 's' : ''}
                </Button>
            </div>
        </div>
    );
}

