/**
 * GmailConnect Component - Phase 3
 * 
 * Button component for connecting/disconnecting Gmail account.
 * Shows connection status and allows users to manage their Gmail integration.
 */

import { useState } from 'react';
import Button from '../common/Button';
import { useGmailImport } from '../../hooks/useGmailImport';
import LoadingSpinner from '../common/LoadingSpinner';

interface GmailConnectProps {
    onConnected?: () => void;
    onDisconnected?: () => void;
    showStatus?: boolean;
    compact?: boolean;
}

export default function GmailConnect({
    onConnected,
    onDisconnected,
    showStatus = true,
    compact = false,
}: GmailConnectProps) {
    const {
        connectionStatus,
        isLoading,
        isConfigured,
        error,
        connect,
        disconnect,
        clearError,
    } = useGmailImport();

    const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);

    const handleConnect = async () => {
        clearError();
        await connect();
        // Always call onConnected after connect() completes - let parent verify status
        onConnected?.();
    };

    const handleDisconnect = async () => {
        await disconnect();
        setShowConfirmDisconnect(false);
        onDisconnected?.();
    };

    // Not configured state
    if (!isConfigured) {
        return (
            <div className={`${compact ? '' : 'glass rounded-xl p-6 border border-white/10'}`}>
                <div className="flex items-center gap-3 text-yellow-400">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-medium">Gmail Integration Not Configured</p>
                        <p className="text-sm text-gray-400">
                            Add VITE_GOOGLE_CLIENT_ID to your environment to enable Gmail import.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className={`${compact ? 'flex items-center gap-2' : 'glass rounded-xl p-6 border border-white/10'}`}>
                <LoadingSpinner size="sm" />
                <span className="text-gray-400">
                    {connectionStatus.isConnected ? 'Disconnecting...' : 'Connecting...'}
                </span>
            </div>
        );
    }

    // Connected state
    if (connectionStatus.isConnected) {
        return (
            <div className={`${compact ? '' : 'glass rounded-xl p-6 border border-white/10'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {showStatus && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <span className="text-xl">📧</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-medium">Gmail Connected</span>
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    {connectionStatus.connectedEmail}
                                </p>
                                {connectionStatus.lastScanAt && (
                                    <p className="text-xs text-gray-500">
                                        Last scan: {new Date(connectionStatus.lastScanAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {!showConfirmDisconnect ? (
                            <Button
                                variant="ghost"
                                size={compact ? 'sm' : 'md'}
                                onClick={() => setShowConfirmDisconnect(true)}
                            >
                                Disconnect
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Disconnect?</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDisconnect}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    Yes
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowConfirmDisconnect(false)}
                                >
                                    No
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
            </div>
        );
    }

    // Disconnected state
    return (
        <div className={`${compact ? '' : 'glass rounded-xl p-6 border border-white/10'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {showStatus && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                            <span className="text-xl">📧</span>
                        </div>
                        <div>
                            <p className="text-white font-medium">Connect Gmail</p>
                            <p className="text-sm text-gray-400">
                                Import flight confirmations automatically
                            </p>
                        </div>
                    </div>
                )}

                <Button
                    variant="primary"
                    size={compact ? 'sm' : 'md'}
                    onClick={handleConnect}
                    className="flex items-center gap-2"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                    </svg>
                    Connect Gmail
                </Button>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                        onClick={clearError}
                        className="text-xs text-gray-400 hover:text-white mt-1"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {!compact && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500">
                        🔒 We only read flight confirmation emails. Your data stays private and secure.
                    </p>
                </div>
            )}
        </div>
    );
}

