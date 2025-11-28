import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import AirportSearch from './AirportSearch';
import AirlineSearch from './AirlineSearch';
import AircraftSearch from './AircraftSearch';
import { useAuthStore } from '../../store/authStore';
import { useFlightsStore } from '../../store/flightsStore';
import { createFlight } from '../../services/flightService';
import type { Airport } from '../../types';
import CSVImport from '../import/CSVImport';

interface AddFlightModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddFlightModal({ isOpen, onClose }: AddFlightModalProps) {
    const { user } = useAuthStore();
    const { addFlight } = useFlightsStore();
    const [showCSVImport, setShowCSVImport] = useState(false);

    const [formData, setFormData] = useState({
        originAirport: null as Airport | null,
        destinationAirport: null as Airport | null,
        airline: '',
        flightNumber: '',
        date: '',
        aircraftType: '',
        seatNumber: '',
        seatClass: '' as '' | 'Economy' | 'Premium Economy' | 'Business' | 'First',
        pnr: '',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.originAirport) {
            newErrors.originAirport = 'Origin airport is required';
        }
        if (!formData.destinationAirport) {
            newErrors.destinationAirport = 'Destination airport is required';
        }
        if (formData.originAirport && formData.destinationAirport &&
            formData.originAirport.iata === formData.destinationAirport.iata) {
            newErrors.destinationAirport = 'Destination must be different from origin';
        }
        if (!formData.airline.trim()) {
            newErrors.airline = 'Airline is required';
        }
        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate() || !user) return;

        setIsSubmitting(true);

        try {
            const flightId = await createFlight(user.id, {
                originAirport: formData.originAirport!,
                destinationAirport: formData.destinationAirport!,
                airline: formData.airline,
                flightNumber: formData.flightNumber || undefined,
                date: new Date(formData.date),
                aircraftType: formData.aircraftType || undefined,
                seatNumber: formData.seatNumber || undefined,
                seatClass: formData.seatClass || undefined,
                pnr: formData.pnr || undefined,
                notes: formData.notes || undefined,
            });

            // Add to store (will be replaced by fetching from Firestore)
            addFlight({
                id: flightId,
                userId: user.id,
                originAirport: formData.originAirport!,
                destinationAirport: formData.destinationAirport!,
                airline: formData.airline,
                flightNumber: formData.flightNumber || undefined,
                date: new Date(formData.date),
                aircraftType: formData.aircraftType || undefined,
                seatNumber: formData.seatNumber || undefined,
                seatClass: formData.seatClass || undefined,
                pnr: formData.pnr || undefined,
                notes: formData.notes || undefined,
                distance: 0, // Will be calculated by service
                duration: 0, // Will be calculated by service
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // Reset form and close
            setFormData({
                originAirport: null,
                destinationAirport: null,
                airline: '',
                flightNumber: '',
                date: '',
                aircraftType: '',
                seatNumber: '',
                seatClass: '',
                pnr: '',
                notes: '',
            });
            onClose();
        } catch (error) {
            console.error('Error adding flight:', error);
            setErrors({ submit: 'Failed to add flight. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Add New Flight" size="xl">
                <div className="space-y-6">
                    {/* Import Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-neon-blue/30 transition-colors">
                            <h3 className="text-white font-medium mb-2">Import from CSV</h3>
                            <p className="text-sm text-gray-400 mb-3">Upload a CSV file with your flight history.</p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowCSVImport(true)}
                                className="w-full"
                            >
                                Upload CSV
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 bg-dark-bg text-sm text-gray-500">or enter manually</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {errors.submit && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                                <p className="text-red-400 text-sm">{errors.submit}</p>
                            </div>
                        )}

                        {/* Flight Route */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <AirportSearch
                                label="From"
                                value={formData.originAirport}
                                onChange={(airport) => setFormData({ ...formData, originAirport: airport })}
                                error={errors.originAirport}
                                required
                            />

                            <AirportSearch
                                label="To"
                                value={formData.destinationAirport}
                                onChange={(airport) => setFormData({ ...formData, destinationAirport: airport })}
                                error={errors.destinationAirport}
                                required
                            />
                        </div>

                        {/* Airline & Flight Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <AirlineSearch
                                label="Airline"
                                value={formData.airline}
                                onChange={(airline) => setFormData({ ...formData, airline })}
                                placeholder="Search airline..."
                                error={errors.airline}
                                required
                            />

                            <Input
                                label="Flight Number"
                                value={formData.flightNumber}
                                onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                                placeholder="e.g. BA178"
                            />
                        </div>

                        {/* Date & Aircraft Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                type="date"
                                label="Date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                error={errors.date}
                                required
                            />

                            <AircraftSearch
                                label="Aircraft Type"
                                value={formData.aircraftType}
                                onChange={(aircraftType) => setFormData({ ...formData, aircraftType })}
                                placeholder="e.g. Boeing 787, A320"
                            />
                        </div>

                        {/* Seat Number & Class */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                label="Seat Number"
                                value={formData.seatNumber}
                                onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                                placeholder="e.g. 12A"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Class
                                </label>
                                <select
                                    value={formData.seatClass}
                                    onChange={(e) => setFormData({ ...formData, seatClass: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                                >
                                    <option value="">Select class</option>
                                    <option value="Economy">Economy</option>
                                    <option value="Premium Economy">Premium Economy</option>
                                    <option value="Business">Business</option>
                                    <option value="First">First</option>
                                </select>
                            </div>
                        </div>

                        {/* PNR / Booking Reference */}
                        <Input
                            label="PNR / Booking Reference"
                            value={formData.pnr}
                            onChange={(e) => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })}
                            placeholder="e.g. ABC123"
                        />

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add any notes about this flight..."
                                rows={3}
                                className="w-full px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue transition-colors resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 mt-2 border-t border-white/10">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isSubmitting}
                            >
                                Add Flight
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <CSVImport
                isOpen={showCSVImport}
                onClose={() => setShowCSVImport(false)}
                onImportComplete={(count) => {
                    console.log(`Imported ${count} flights`);
                    // Refresh flights or just close
                    setShowCSVImport(false);
                    onClose();
                }}
            />
        </>
    );
}
