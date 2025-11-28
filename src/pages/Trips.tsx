/**
 * Trips Page - Phase 2: Multi-segment Trip Grouping
 * 
 * Main page for viewing and managing trips.
 * Displays a list of all user trips with filtering and search capabilities.
 * 
 * Features:
 * - List all trips with summary statistics
 * - Create new trips
 * - Edit and delete existing trips
 * - Filter by year or tag
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import TripCard from '../components/trips/TripCard';
import CreateTripModal from '../components/trips/CreateTripModal';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useTripsStore } from '../store/tripsStore';
import { useFlightsStore } from '../store/flightsStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { getUserTrips, deleteTrip as deleteTripService } from '../services/tripService';
import { getUserFlights } from '../services/flightService';
import type { Trip } from '../types';

export default function Trips() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { trips, setTrips, deleteTrip } = useTripsStore();
    const { flights, setFlights } = useFlightsStore();
    const {
        isCreateTripModalOpen,
        openCreateTripModal,
        closeCreateTripModal,
        isEditTripModalOpen,
        editingTripId,
        openEditTripModal,
        closeEditTripModal,
        isDeleteTripDialogOpen,
        deletingTripId,
        openDeleteTripDialog,
        closeDeleteTripDialog,
    } = useUIStore();

    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterTag, setFilterTag] = useState('');

    // Load trips and flights from Firestore
    useEffect(() => {
        if (user) {
            setLoading(true);
            Promise.all([
                getUserTrips(user.id),
                getUserFlights(user.id),
            ])
                .then(([loadedTrips, loadedFlights]) => {
                    setTrips(loadedTrips);
                    setFlights(loadedFlights);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user, setTrips, setFlights]);

    // Extract unique years and tags for filtering
    const { years, tags } = useMemo(() => {
        const yearsSet = new Set<string>();
        const tagsSet = new Set<string>();

        trips.forEach(trip => {
            yearsSet.add(new Date(trip.startDate).getFullYear().toString());
            trip.tags?.forEach(tag => tagsSet.add(tag));
        });

        return {
            years: Array.from(yearsSet).sort((a, b) => Number(b) - Number(a)),
            tags: Array.from(tagsSet).sort(),
        };
    }, [trips]);

    // Filter trips
    const filteredTrips = useMemo(() => {
        let result = [...trips];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(trip =>
                trip.name.toLowerCase().includes(query) ||
                trip.description?.toLowerCase().includes(query)
            );
        }

        // Apply year filter
        if (filterYear) {
            result = result.filter(trip =>
                new Date(trip.startDate).getFullYear().toString() === filterYear
            );
        }

        // Apply tag filter
        if (filterTag) {
            result = result.filter(trip =>
                trip.tags?.includes(filterTag)
            );
        }

        return result;
    }, [trips, searchQuery, filterYear, filterTag]);

    // Get flights for a specific trip
    const getFlightsForTrip = (trip: Trip) => {
        return flights.filter(f => trip.flightIds.includes(f.id));
    };

    const handleTripClick = (tripId: string) => {
        navigate(`/trip/${tripId}`);
    };

    const handleEditTrip = (trip: Trip) => {
        openEditTripModal(trip.id);
    };

    const handleDeleteTrip = (trip: Trip) => {
        openDeleteTripDialog(trip.id);
    };

    const confirmDelete = async () => {
        if (!deletingTripId) return;

        setIsDeleting(true);
        try {
            await deleteTripService(deletingTripId);
            deleteTrip(deletingTripId);
            closeDeleteTripDialog();
        } catch (error) {
            console.error('Error deleting trip:', error);
            alert('Failed to delete trip. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const editingTrip = trips.find(t => t.id === editingTripId) || null;
    const deletingTrip = trips.find(t => t.id === deletingTripId);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg">
                <Header />
                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner size="lg" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg pb-24">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
                            My Trips <span className="text-4xl">🗺️</span>
                        </h1>
                        <p className="text-gray-400 text-lg">
                            {trips.length === 0
                                ? 'No trips created yet'
                                : `${trips.length} trip${trips.length === 1 ? '' : 's'} created`}
                        </p>
                    </div>
                    <button
                        onClick={openCreateTripModal}
                        className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-blue rounded-lg text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-neon-cyan/20"
                    >
                        <span className="text-xl">+</span> Create Trip
                    </button>
                </div>

                {trips.length === 0 ? (
                    <EmptyState
                        icon={<span className="text-6xl">🗺️</span>}
                        title="No Trips Yet"
                        description="Group your flights into memorable trips! Create your first trip to get started."
                        action={{
                            label: 'Create Your First Trip',
                            onClick: openCreateTripModal,
                        }}
                    />
                ) : (
                    <>
                        {/* Filters */}
                        <div className="glass rounded-xl p-4 mb-6 border border-white/10">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search trips..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
                                    />
                                </div>

                                {/* Year Filter */}
                                <select
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className="px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors min-w-[140px]"
                                >
                                    <option value="">All Years</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>

                                {/* Tag Filter */}
                                {tags.length > 0 && (
                                    <select
                                        value={filterTag}
                                        onChange={(e) => setFilterTag(e.target.value)}
                                        className="px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors min-w-[140px]"
                                    >
                                        <option value="">All Tags</option>
                                        {tags.map(tag => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Results Count */}
                        {filteredTrips.length !== trips.length && (
                            <div className="mb-4 text-gray-400">
                                Showing {filteredTrips.length} of {trips.length} trips
                            </div>
                        )}

                        {/* Trip Cards */}
                        {filteredTrips.length === 0 ? (
                            <div className="glass rounded-xl p-12 border border-white/10 text-center">
                                <span className="text-5xl mb-4 block">🔍</span>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    No trips match your filters
                                </h3>
                                <p className="text-gray-400">
                                    Try adjusting your search criteria
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTrips.map(trip => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        flights={getFlightsForTrip(trip)}
                                        onClick={() => handleTripClick(trip.id)}
                                        onEdit={() => handleEditTrip(trip)}
                                        onDelete={() => handleDeleteTrip(trip)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Create Trip Modal */}
            <CreateTripModal
                isOpen={isCreateTripModalOpen}
                onClose={closeCreateTripModal}
            />

            {/* Edit Trip Modal */}
            <CreateTripModal
                isOpen={isEditTripModalOpen}
                onClose={closeEditTripModal}
                existingTrip={editingTrip}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteTripDialogOpen}
                onClose={closeDeleteTripDialog}
                onConfirm={confirmDelete}
                title="Delete Trip"
                message={
                    deletingTrip
                        ? `Are you sure you want to delete "${deletingTrip.name}"? This will not delete the flights, only the trip grouping.`
                        : 'Are you sure you want to delete this trip?'
                }
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={isDeleting}
            />
        </div>
    );
}

