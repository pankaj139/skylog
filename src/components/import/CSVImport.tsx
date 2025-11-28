/**
 * CSVImport Component - Phase 2: CSV Import
 * 
 * Main component for importing flights from CSV files.
 * Handles file upload, parsing, validation, and import.
 * 
 * Usage:
 *   <CSVImport 
 *     onImportComplete={(count) => console.log(`Imported ${count} flights`)}
 *     onClose={() => setShowImport(false)}
 *   />
 */

import { useState, useRef, useCallback } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ImportPreview from './ImportPreview';
import { parseCSV, detectColumnMapping, generateSampleCSV } from '../../utils/csvParser';

interface CSVImportProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete?: (count: number) => void;
}

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

export default function CSVImport({ isOpen, onClose, onImportComplete }: CSVImportProps) {
    const [step, setStep] = useState<ImportStep>('upload');
    const [csvData, setCSVData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Handles file selection
     */
    const handleFileSelect = useCallback(async (file: File) => {
        setError(null);

        if (!file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }

        try {
            const content = await file.text();
            const parsed = parseCSV(content);
            setCSVData(parsed);

            // Auto-detect column mappings
            const detected = detectColumnMapping(parsed.headers);
            const mapping: Record<string, string> = {};
            Object.entries(detected).forEach(([field, index]) => {
                if (index !== null) {
                    mapping[field] = parsed.headers[index];
                }
            });
            setColumnMapping(mapping);

            setStep('mapping');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
        }
    }, []);

    /**
     * Drag and drop handlers
     */
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    /**
     * Downloads sample CSV template
     */
    const downloadTemplate = () => {
        const csv = generateSampleCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'skylog_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    /**
     * Resets the import process
     */
    const resetImport = () => {
        setStep('upload');
        setCSVData(null);
        setColumnMapping({});
        setError(null);
    };

    /**
     * Closes modal and resets
     */
    const handleClose = () => {
        resetImport();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Import Flights from CSV" size="xl">
            {/* Step 1: Upload */}
            {step === 'upload' && (
                <div className="space-y-6">
                    {/* Upload Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                            ${isDragging 
                                ? 'border-neon-blue bg-neon-blue/10' 
                                : 'border-white/20 hover:border-neon-blue/50 hover:bg-white/5'
                            }
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleInputChange}
                            className="hidden"
                        />
                        
                        <div className="text-5xl mb-4">📄</div>
                        <p className="text-white font-medium text-lg mb-2">
                            {isDragging ? 'Drop CSV file here' : 'Drag & drop your CSV file'}
                        </p>
                        <p className="text-gray-500 text-sm">or click to browse</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Template Download */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h3 className="text-white font-medium mb-2">Need a template?</h3>
                        <p className="text-gray-400 text-sm mb-3">
                            Download our sample CSV template with the correct column format.
                        </p>
                        <button
                            onClick={downloadTemplate}
                            className="px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/30 rounded-lg text-neon-blue text-sm font-medium transition-all"
                        >
                            📥 Download Template
                        </button>
                    </div>

                    {/* Expected Format */}
                    <div className="text-sm text-gray-500">
                        <p className="mb-2">Expected columns (in any order):</p>
                        <div className="flex flex-wrap gap-2">
                            {['origin', 'destination', 'airline', 'date'].map(col => (
                                <span key={col} className="px-2 py-1 bg-white/5 rounded text-xs">
                                    {col} <span className="text-red-400">*</span>
                                </span>
                            ))}
                            {['flight_number', 'aircraft', 'seat', 'class', 'notes'].map(col => (
                                <span key={col} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-600">
                                    {col}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Column Mapping */}
            {step === 'mapping' && csvData && (
                <div className="space-y-6">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-white mb-1">
                            Found <span className="text-neon-blue font-bold">{csvData.rows.length}</span> rows
                        </p>
                        <p className="text-sm text-gray-400">
                            Please verify the column mappings below are correct.
                        </p>
                    </div>

                    {/* Mapping Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { field: 'originIata', label: 'Origin Airport', required: true },
                            { field: 'destinationIata', label: 'Destination Airport', required: true },
                            { field: 'airline', label: 'Airline', required: true },
                            { field: 'date', label: 'Date', required: true },
                            { field: 'flightNumber', label: 'Flight Number', required: false },
                            { field: 'aircraftType', label: 'Aircraft Type', required: false },
                            { field: 'seatNumber', label: 'Seat Number', required: false },
                            { field: 'seatClass', label: 'Seat Class', required: false },
                            { field: 'notes', label: 'Notes', required: false },
                        ].map(({ field, label, required }) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    {label} {required && <span className="text-red-400">*</span>}
                                </label>
                                <select
                                    value={columnMapping[field] || ''}
                                    onChange={(e) => setColumnMapping(prev => ({
                                        ...prev,
                                        [field]: e.target.value,
                                    }))}
                                    className="w-full px-3 py-2 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue"
                                >
                                    <option value="">-- Select column --</option>
                                    {csvData.headers.map(header => (
                                        <option key={header} value={header}>{header}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-4 border-t border-white/10">
                        <Button variant="ghost" onClick={resetImport}>
                            ← Back
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setStep('preview')}
                            disabled={!columnMapping.originIata || !columnMapping.destinationIata || 
                                     !columnMapping.airline || !columnMapping.date}
                        >
                            Preview Import →
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview & Import */}
            {step === 'preview' && csvData && (
                <ImportPreview
                    csvData={csvData}
                    columnMapping={columnMapping}
                    onBack={() => setStep('mapping')}
                    onImportComplete={(count) => {
                        onImportComplete?.(count);
                        handleClose();
                    }}
                />
            )}
        </Modal>
    );
}

