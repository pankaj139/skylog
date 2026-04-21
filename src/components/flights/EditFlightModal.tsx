import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import AirportSearch from './AirportSearch';
import AirlineSearch from './AirlineSearch';
import AircraftSearch from './AircraftSearch';
import { useFlightsStore } from '../../store/flightsStore';
import { useAchievementsStore } from '../../store/achievementsStore';
import { useAchievementStore } from '../../store/useAchievementStore';
import { updateFlight } from '../../services/flightService';
import { ensureUserProgress } from '../../services/achievementService';
import { parseOptionalMoneyOrPoints, parsePassengerCount } from '../../utils/flightFormParsers';
import type { Airport, Flight } from '../../types';

interface EditFlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    flight: Flight | null;
}

export default function EditFlightModal({ isOpen, onClose, flight }: EditFlightModalProps) {
    const { updateFlightInStore } = useFlightsStore();
    const loadProgress = useAchievementsStore(s => s.loadProgress);
    const checkAndUpdateAchievements = useAchievementsStore(s => s.checkAndUpdateAchievements);
    const initializeAchievementStore = useAchievementStore(s => s.initialize);

    const [formData, setFormData] = useState({
        originAirport: null as Airport | null,
        destinationAirport: null as Airport | null,
        airline: '',
        flightNumber: '',
        date: '',
        aircraftType: '',
        aircraftRegistration: '',
        seatNumber: '',
        seatClass: '' as '' | 'Economy' | 'Premium Economy' | 'Business' | 'First',
        passengerCount: '1',
        amountPaidInr: '',
        pointsPaid: '',
        pnr: '',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate form when flight changes
    useEffect(() => {
        if (flight) {
            setFormData({
                originAirport: flight.originAirport,
                destinationAirport: flight.destinationAirport,
                airline: flight.airline,
                flightNumber: flight.flightNumber || '',
                date: flight.date instanceof Date 
                    ? flight.date.toISOString().split('T')[0]
                    : new Date(flight.date).toISOString().split('T')[0],
                aircraftType: flight.aircraftType || '',
                aircraftRegistration: flight.aircraftRegistration || '',
                seatNumber: flight.seatNumber || '',
                seatClass: flight.seatClass || '',
                passengerCount: String(flight.passengerCount ?? 1),
                amountPaidInr: flight.amountPaidInr != null ? String(flight.amountPaidInr) : '',
                pointsPaid: flight.pointsPaid != null ? String(flight.pointsPaid) : '',
                pnr: flight.pnr || '',
                notes: flight.notes || '',
            });
        }
    }, [flight]);

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

        const inrParsed = parseOptionalMoneyOrPoints(formData.amountPaidInr);
        if (inrParsed.invalid) newErrors.amountPaidInr = 'Enter a valid INR amount';

        const ptsParsed = parseOptionalMoneyOrPoints(formData.pointsPaid);
        if (ptsParsed.invalid) newErrors.pointsPaid = 'Enter a valid points amount';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate() || !flight) return;

        setIsSubmitting(true);

        const aircraftRegistration = formData.aircraftRegistration.trim()
            ? formData.aircraftRegistration.trim().toUpperCase().replace(/\s+/g, '')
            : undefined;

        const passengerCount = parsePassengerCount(formData.passengerCount);
        const inrResult = parseOptionalMoneyOrPoints(formData.amountPaidInr);
        const ptsResult = parseOptionalMoneyOrPoints(formData.pointsPaid);

        try {
            await updateFlight(flight.id, {
                originAirport: formData.originAirport!,
                destinationAirport: formData.destinationAirport!,
                airline: formData.airline,
                flightNumber: formData.flightNumber || undefined,
                date: new Date(formData.date),
                aircraftType: formData.aircraftType || undefined,
                aircraftRegistration,
                passengerCount,
                amountPaidInr: inrResult.value,
                pointsPaid: ptsResult.value,
                seatNumber: formData.seatNumber || undefined,
                seatClass: formData.seatClass || undefined,
                pnr: formData.pnr || undefined,
                notes: formData.notes || undefined,
            });

            // Update in store
            updateFlightInStore(flight.id, {
                ...flight,
                originAirport: formData.originAirport!,
                destinationAirport: formData.destinationAirport!,
                airline: formData.airline,
                flightNumber: formData.flightNumber || undefined,
                date: new Date(formData.date),
                aircraftType: formData.aircraftType || undefined,
                aircraftRegistration,
                passengerCount,
                amountPaidInr: inrResult.value,
                pointsPaid: ptsResult.value,
                seatNumber: formData.seatNumber || undefined,
                seatClass: formData.seatClass || undefined,
                pnr: formData.pnr || undefined,
                notes: formData.notes || undefined,
                updatedAt: new Date(),
            });

            const allFlights = useFlightsStore.getState().flights;
            await ensureUserProgress(flight.userId);
            await loadProgress(flight.userId);
            await checkAndUpdateAchievements(flight.userId, allFlights);
            await initializeAchievementStore(flight.userId);

            onClose();
        } catch (error) {
            console.error('Error updating flight:', error);
            setErrors({ submit: 'Failed to update flight. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!flight) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Flight" size="xl">
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

                <Input
                    label="Aircraft registration (tail number)"
                    value={formData.aircraftRegistration}
                    onChange={(e) =>
                        setFormData({ ...formData, aircraftRegistration: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. N123AB, G-EUUU"
                />

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Input
                        type="number"
                        min={1}
                        max={999}
                        label="Passengers / seats booked"
                        value={formData.passengerCount}
                        onChange={(e) => setFormData({ ...formData, passengerCount: e.target.value })}
                        placeholder="1"
                    />
                    <Input
                        type="text"
                        inputMode="decimal"
                        label="Amount paid (INR)"
                        value={formData.amountPaidInr}
                        onChange={(e) => setFormData({ ...formData, amountPaidInr: e.target.value })}
                        placeholder="e.g. 15000"
                        error={errors.amountPaidInr}
                    />
                    <Input
                        type="text"
                        inputMode="numeric"
                        label="Points redeemed"
                        value={formData.pointsPaid}
                        onChange={(e) => setFormData({ ...formData, pointsPaid: e.target.value })}
                        placeholder="e.g. 12000"
                        error={errors.pointsPaid}
                    />
                </div>

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
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

