/**
 * GmailImportModal Component - Phase 3
 * 
 * Modal for importing flights from Gmail.
 * Shows connection status, scans emails, and allows flight selection/editing.
 */

import { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import GmailConnect from './GmailConnect';
import DetectedFlightRow from './DetectedFlightRow';
import { useGmailImport } from '../../hooks/useGmailImport';
import { useAuthStore } from '../../store/authStore';
import { useFlightsStore } from '../../store/flightsStore';
import { createFlight } from '../../services/flightService';
import { getGmailConnectionStatus } from '../../services/gmailAuthService';

interface GmailImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ImportStep = 'connect' | 'scan' | 'review' | 'importing' | 'complete';

export default function GmailImportModal({ isOpen, onClose }: GmailImportModalProps) {
    const { user } = useAuthStore();
    const { addFlight } = useFlightsStore();
    const {
        connectionStatus,
        isScanning,
        detectedFlights,
        scanProgress,
        error,
        scanEmails,
        toggleFlightSelection,
        selectAllFlights,
        deselectAllFlights,
        updateDetectedFlight,
        clearDetectedFlights,
        clearError,
    } = useGmailImport();

    // Local connection status that we can refresh
    const [localConnectionStatus, setLocalConnectionStatus] = useState(connectionStatus);

    // Refresh connection status when modal opens or when connection changes
    const refreshConnectionStatus = useCallback(async () => {
        if (!user) return;
        try {
            const status = await getGmailConnectionStatus(user.id);
            setLocalConnectionStatus(status);
        } catch (err) {
            console.error('Failed to refresh connection status:', err);
        }
    }, [user]);

    // Refresh when modal opens
    useEffect(() => {
        if (isOpen && user) {
            refreshConnectionStatus();
        }
    }, [isOpen, user, refreshConnectionStatus]);

    // Update local status when hook status changes
    useEffect(() => {
        setLocalConnectionStatus(connectionStatus);
    }, [connectionStatus]);

    // Handle successful connection from GmailConnect
    const handleConnected = useCallback(() => {
        refreshConnectionStatus();
    }, [refreshConnectionStatus]);

    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
    const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

    // Determine current step
    const getStep = (): ImportStep => {
        if (!localConnectionStatus.isConnected) return 'connect';
        if (isImporting) return 'importing';
        if (importResults.success > 0 || importResults.failed > 0) return 'complete';
        if (detectedFlights.length > 0) return 'review';
        return 'scan';
    };

    const step = getStep();
    const selectedFlights = detectedFlights.filter(f => f.selected);
    const validSelectedFlights = selectedFlights.filter(f =>
        f.originAirport && f.destinationAirport && f.airline && f.date
    );

    const handleScan = async () => {
        clearError();
        await scanEmails();
    };

    const handleImport = async () => {
        if (!user || validSelectedFlights.length === 0) return;

        setIsImporting(true);
        setImportProgress({ current: 0, total: validSelectedFlights.length });

        let success = 0;
        let failed = 0;

        for (let i = 0; i < validSelectedFlights.length; i++) {
            const flight = validSelectedFlights[i];
            setImportProgress({ current: i + 1, total: validSelectedFlights.length });

            try {
                if (!flight.originAirport || !flight.destinationAirport || !flight.airline || !flight.date) {
                    failed++;
                    continue;
                }

                const flightId = await createFlight(user.id, {
                    originAirport: flight.originAirport,
                    destinationAirport: flight.destinationAirport,
                    airline: flight.airline,
                    flightNumber: flight.flightNumber,
                    date: new Date(flight.date),
                });

                addFlight({
                    id: flightId,
                    userId: user.id,
                    originAirport: flight.originAirport,
                    destinationAirport: flight.destinationAirport,
                    airline: flight.airline,
                    flightNumber: flight.flightNumber,
                    date: new Date(flight.date),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                success++;
            } catch (err) {
                console.error('Failed to import flight:', err);
                failed++;
            }
        }

        setImportResults({ success, failed });
        setIsImporting(false);
    };

    const handleReset = () => {
        clearDetectedFlights();
        setImportResults({ success: 0, failed: 0 });
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Import from Gmail"
            size="xl"
        >
            <div className="space-y-6">
                {/* Step: Connect Gmail */}
                {step === 'connect' && (
                    <div className="space-y-6">
                        <div className="text-center py-6">
                            <div className="text-5xl mb-4">📧</div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Connect Your Gmail
                            </h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                                We'll scan your inbox for flight confirmation emails and help you import them automatically.
                            </p>
                        </div>

                        <GmailConnect showStatus={false} onConnected={handleConnected} />

                        <div className="p-4 bg-dark-surface rounded-lg border border-white/10">
                            <h4 className="text-white font-medium mb-2">What we look for:</h4>
                            <ul className="text-sm text-gray-400 space-y-1">
                                <li>• Flight booking confirmations</li>
                                <li>• E-tickets and itineraries</li>
                                <li>• Airline confirmation emails</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Step: Scan Emails */}
                {step === 'scan' && (
                    <div className="space-y-6">
                        <GmailConnect compact onConnected={handleConnected} />

                        <div className="text-center py-8">
                            {isScanning ? (
                                <>
                                    <LoadingSpinner size="lg" />
                                    <p className="text-white mt-4">Scanning your emails...</p>
                                    <div className="w-48 mx-auto mt-4 h-2 bg-dark-surface rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-neon-blue transition-all duration-300"
                                            style={{ width: `${scanProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">
                                        This may take a moment...
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-5xl mb-4">🔍</div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Ready to Scan
                                    </h3>
                                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                                        Click below to search your Gmail for flight confirmation emails.
                                    </p>
                                    <Button variant="primary" size="lg" onClick={handleScan}>
                                        Scan for Flights
                                    </Button>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <p className="text-red-400">{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step: Review Flights */}
                {step === 'review' && (
                    <div className="space-y-4">
                        {/* Summary Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-dark-surface rounded-lg">
                            <div>
                                <span className="text-white font-medium">
                                    {detectedFlights.length} flights found
                                </span>
                                <span className="text-gray-400 mx-2">•</span>
                                <span className="text-neon-blue">
                                    {selectedFlights.length} selected
                                </span>
                                {selectedFlights.length !== validSelectedFlights.length && (
                                    <>
                                        <span className="text-gray-400 mx-2">•</span>
                                        <span className="text-yellow-400">
                                            {selectedFlights.length - validSelectedFlights.length} need corrections
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={selectAllFlights}>
                                    Select All
                                </Button>
                                <Button variant="ghost" size="sm" onClick={deselectAllFlights}>
                                    Deselect All
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleScan}>
                                    Re-scan
                                </Button>
                            </div>
                        </div>

                        {/* Flight List */}
                        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                            {detectedFlights.map(flight => (
                                <DetectedFlightRow
                                    key={flight.id}
                                    flight={flight}
                                    onToggleSelect={toggleFlightSelection}
                                    onUpdate={updateDetectedFlight}
                                />
                            ))}
                        </div>

                        {/* Import Button */}
                        <div className="flex justify-between items-center pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-400">
                                {validSelectedFlights.length} valid flight{validSelectedFlights.length !== 1 ? 's' : ''} ready to import
                            </p>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleImport}
                                    disabled={validSelectedFlights.length === 0}
                                >
                                    Import {validSelectedFlights.length} Flight{validSelectedFlights.length !== 1 ? 's' : ''}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step: Importing */}
                {step === 'importing' && (
                    <div className="text-center py-12">
                        <LoadingSpinner size="lg" />
                        <p className="text-white mt-4">
                            Importing flights... ({importProgress.current}/{importProgress.total})
                        </p>
                        <div className="w-64 mx-auto mt-4 h-2 bg-dark-surface rounded-full overflow-hidden">
                            <div
                                className="h-full bg-neon-blue transition-all duration-300"
                                style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Step: Complete */}
                {step === 'complete' && (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">
                            {importResults.failed === 0 ? '🎉' : '⚠️'}
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-2">
                            Import Complete
                        </h3>
                        <div className="space-y-2 mb-6">
                            {importResults.success > 0 && (
                                <p className="text-green-400">
                                    ✓ {importResults.success} flight{importResults.success !== 1 ? 's' : ''} imported successfully
                                </p>
                            )}
                            {importResults.failed > 0 && (
                                <p className="text-red-400">
                                    ✕ {importResults.failed} flight{importResults.failed !== 1 ? 's' : ''} failed to import
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3 justify-center">
                            <Button variant="ghost" onClick={handleReset}>
                                Import More
                            </Button>
                            <Button variant="primary" onClick={handleClose}>
                                Done
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

