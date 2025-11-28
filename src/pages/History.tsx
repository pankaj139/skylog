import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import FlightCard from '../components/flights/FlightCard';
import FlightFilters from '../components/flights/FlightFilters';
import type { FilterState } from '../components/flights/FlightFilters';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import EditFlightModal from '../components/flights/EditFlightModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import GmailImportModal from '../components/import/GmailImportModal';
import { useFlightsStore } from '../store/flightsStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { getUserFlights, deleteFlight as deleteFlightService } from '../services/flightService';
import { preloadAirlineLogos } from '../utils/airlineLogoCache';
import type { Flight } from '../types';

export default function History() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { flights, setFlights, deleteFlight } = useFlightsStore();
    const {
        openAddFlightModal,
        isEditFlightModalOpen,
        editingFlightId,
        openEditFlightModal,
        closeEditFlightModal,
        isDeleteDialogOpen,
        deletingFlightId,
        openDeleteDialog,
        closeDeleteDialog,
        isGmailImportModalOpen,
        openGmailImportModal,
        closeGmailImportModal,
    } = useUIStore();
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        year: '',
        airline: '',
        country: '',
        aircraftType: '',
        sortBy: 'date-desc',
    });

    // Load flights from Firestore
    useEffect(() => {
        if (user) {
            setLoading(true);
            getUserFlights(user.id)
                .then((loadedFlights) => {
                    setFlights(loadedFlights);
                    // Preload all airline logos for better UX
                    const airlineNames = [...new Set(loadedFlights.map(f => f.airline))];
                    preloadAirlineLogos(airlineNames);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user, setFlights]);

    // Extract unique values for filters
    const { airlines, countries, aircraftTypes } = useMemo(() => {
        const airlinesSet = new Set<string>();
        const countriesSet = new Set<string>();
        const aircraftTypesSet = new Set<string>();

        flights.forEach(flight => {
            if (flight.airline) airlinesSet.add(flight.airline);
            if (flight.originAirport.country) countriesSet.add(flight.originAirport.country);
            if (flight.destinationAirport.country) countriesSet.add(flight.destinationAirport.country);
            if (flight.aircraftType) aircraftTypesSet.add(flight.aircraftType);
        });

        return {
            airlines: Array.from(airlinesSet).sort(),
            countries: Array.from(countriesSet).sort(),
            aircraftTypes: Array.from(aircraftTypesSet).sort(),
        };
    }, [flights]);

    // Filter and sort flights
    const filteredFlights = useMemo(() => {
        let result = [...flights];

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(flight =>
                flight.originAirport.iata.toLowerCase().includes(searchLower) ||
                flight.destinationAirport.iata.toLowerCase().includes(searchLower) ||
                flight.originAirport.city.toLowerCase().includes(searchLower) ||
                flight.destinationAirport.city.toLowerCase().includes(searchLower) ||
                flight.airline.toLowerCase().includes(searchLower)
            );
        }

        // Apply year filter
        if (filters.year) {
            result = result.filter(flight =>
                new Date(flight.date).getFullYear().toString() === filters.year
            );
        }

        // Apply airline filter
        if (filters.airline) {
            result = result.filter(flight => flight.airline === filters.airline);
        }

        // Apply country filter
        if (filters.country) {
            result = result.filter(flight =>
                flight.originAirport.country === filters.country ||
                flight.destinationAirport.country === filters.country
            );
        }

        // Apply aircraft type filter
        if (filters.aircraftType) {
            result = result.filter(flight => flight.aircraftType === filters.aircraftType);
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (filters.sortBy) {
                case 'date-desc':
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'date-asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'distance-desc':
                    return (b.distance || 0) - (a.distance || 0);
                case 'distance-asc':
                    return (a.distance || 0) - (b.distance || 0);
                case 'duration-desc':
                    return (b.duration || 0) - (a.duration || 0);
                case 'duration-asc':
                    return (a.duration || 0) - (b.duration || 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [flights, filters]);

    const handleFlightClick = (flightId: string) => {
        navigate(`/journey/${flightId}`);
    };

    const handleEditFlight = (flight: Flight) => {
        openEditFlightModal(flight.id);
    };

    const handleDeleteFlight = (flight: Flight) => {
        openDeleteDialog(flight.id);
    };

    const confirmDelete = async () => {
        if (!deletingFlightId) return;

        setIsDeleting(true);
        try {
            await deleteFlightService(deletingFlightId);
            deleteFlight(deletingFlightId);
            closeDeleteDialog();
        } catch (error) {
            console.error('Error deleting flight:', error);
            alert('Failed to delete flight. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const editingFlight = flights.find(f => f.id === editingFlightId) || null;
    const deletingFlight = flights.find(f => f.id === deletingFlightId);

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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-3">Flight History</h1>
                        <p className="text-gray-400 text-lg">
                            {flights.length === 0
                                ? 'No flights recorded yet'
                                : `${flights.length} flight${flights.length === 1 ? '' : 's'} recorded`}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={openGmailImportModal}
                            className="flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                            </svg>
                            Import from Gmail
                        </Button>
                        <Button variant="primary" onClick={openAddFlightModal}>
                            + Add Flight
                        </Button>
                    </div>
                </div>

                {flights.length === 0 ? (
                    <EmptyState
                        icon={<span className="text-6xl">✈️</span>}
                        title="No Flights Yet"
                        description="Start tracking your travels by adding your first flight!"
                        action={{
                            label: 'Add Your First Flight',
                            onClick: openAddFlightModal,
                        }}
                    />
                ) : (
                    <>
                        {/* Filters */}
                        <FlightFilters
                            onFilterChange={setFilters}
                            airlines={airlines}
                            countries={countries}
                            aircraftTypes={aircraftTypes}
                        />

                        {/* Results Count */}
                        {filteredFlights.length !== flights.length && (
                            <div className="mb-4 text-gray-400">
                                Showing {filteredFlights.length} of {flights.length} flights
                            </div>
                        )}

                        {/* Flight Cards */}
                        {filteredFlights.length === 0 ? (
                            <div className="glass rounded-xl p-12 border border-white/10 text-center">
                                <span className="text-5xl mb-4 block">🔍</span>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    No flights match your filters
                                </h3>
                                <p className="text-gray-400">
                                    Try adjusting your search criteria
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredFlights.map(flight => (
                                    <FlightCard
                                        key={flight.id}
                                        flight={flight}
                                        onClick={() => handleFlightClick(flight.id)}
                                        onEdit={() => handleEditFlight(flight)}
                                        onDelete={() => handleDeleteFlight(flight)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Edit Flight Modal */}
                <EditFlightModal
                    isOpen={isEditFlightModalOpen}
                    onClose={closeEditFlightModal}
                    flight={editingFlight}
                />

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={closeDeleteDialog}
                    onConfirm={confirmDelete}
                    title="Delete Flight"
                    message={
                        deletingFlight
                            ? `Are you sure you want to delete the flight from ${deletingFlight.originAirport.iata} to ${deletingFlight.destinationAirport.iata}? This action cannot be undone.`
                            : 'Are you sure you want to delete this flight?'
                    }
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="danger"
                    loading={isDeleting}
                />

                {/* Gmail Import Modal */}
                <GmailImportModal
                    isOpen={isGmailImportModalOpen}
                    onClose={closeGmailImportModal}
                />
            </main>
        </div>
    );
}

