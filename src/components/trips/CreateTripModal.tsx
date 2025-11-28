/**
 * CreateTripModal Component - Phase 2: Multi-segment Trip Grouping
 * 
 * Modal for creating and editing trips. Allows users to:
 * - Set trip name and description
 * - Select date range
 * - Choose flights to include
 * - Add tags
 * 
 * Usage:
 *   <CreateTripModal 
 *     isOpen={isOpen}
 *     onClose={() => setIsOpen(false)}
 *     existingTrip={tripToEdit} // Optional, for editing
 *   />
 */

import { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuthStore } from '../../store/authStore';
import { useFlightsStore } from '../../store/flightsStore';
import { useTripsStore } from '../../store/tripsStore';
import { createTrip, updateTrip } from '../../services/tripService';
import type { Trip, Flight, TripFormData } from '../../types';
import { formatDate } from '../../utils/formatters';

interface CreateTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingTrip?: Trip | null;
}

/**
 * Modal component for creating or editing trips
 * 
 * @param isOpen - Whether the modal is visible
 * @param onClose - Handler to close the modal
 * @param existingTrip - Optional trip to edit (if editing)
 */
export default function CreateTripModal({ isOpen, onClose, existingTrip }: CreateTripModalProps) {
    const { user } = useAuthStore();
    const { flights } = useFlightsStore();
    const { addTrip, updateTrip: updateTripInStore } = useTripsStore();

    const isEditing = !!existingTrip;

    const [formData, setFormData] = useState<TripFormData>({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        flightIds: [],
        tags: [],
    });

    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form data when editing
    useEffect(() => {
        if (existingTrip) {
            setFormData({
                name: existingTrip.name,
                description: existingTrip.description || '',
                startDate: new Date(existingTrip.startDate).toISOString().split('T')[0],
                endDate: new Date(existingTrip.endDate).toISOString().split('T')[0],
                flightIds: existingTrip.flightIds || [],
                coverPhoto: existingTrip.coverPhoto,
                tags: existingTrip.tags || [],
            });
        } else {
            // Reset form for new trip
            setFormData({
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                flightIds: [],
                tags: [],
            });
        }
        setErrors({});
    }, [existingTrip, isOpen]);

    // Get available flights (not already in another trip, or in this trip when editing)
    const availableFlights = useMemo(() => {
        return flights.filter(f => {
            // If editing, include flights already in this trip
            if (existingTrip && existingTrip.flightIds.includes(f.id)) {
                return true;
            }
            // Include flights not in any trip
            return !f.tripId;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [flights, existingTrip]);

    // Auto-calculate date range from selected flights
    useEffect(() => {
        if (formData.flightIds.length > 0) {
            const selectedFlights = flights.filter(f => formData.flightIds.includes(f.id));
            const dates = selectedFlights.map(f => new Date(f.date).getTime());
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            
            setFormData(prev => ({
                ...prev,
                startDate: minDate.toISOString().split('T')[0],
                endDate: maxDate.toISOString().split('T')[0],
            }));
        }
    }, [formData.flightIds, flights]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Trip name is required';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }
        if (!formData.endDate) {
            newErrors.endDate = 'End date is required';
        }
        if (formData.startDate && formData.endDate && 
            new Date(formData.startDate) > new Date(formData.endDate)) {
            newErrors.endDate = 'End date must be after start date';
        }
        if (formData.flightIds.length === 0) {
            newErrors.flights = 'Select at least one flight';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate() || !user) return;

        setIsSubmitting(true);

        try {
            if (isEditing && existingTrip) {
                // Update existing trip
                await updateTrip(existingTrip.id, formData);
                updateTripInStore(existingTrip.id, {
                    ...existingTrip,
                    name: formData.name,
                    description: formData.description,
                    startDate: new Date(formData.startDate),
                    endDate: new Date(formData.endDate),
                    flightIds: formData.flightIds,
                    tags: formData.tags,
                    updatedAt: new Date(),
                });
            } else {
                // Create new trip
                const tripId = await createTrip(user.id, formData);
                addTrip({
                    id: tripId,
                    userId: user.id,
                    name: formData.name,
                    description: formData.description,
                    startDate: new Date(formData.startDate),
                    endDate: new Date(formData.endDate),
                    flightIds: formData.flightIds,
                    coverPhoto: formData.coverPhoto,
                    tags: formData.tags,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            onClose();
        } catch (error) {
            console.error('Error saving trip:', error);
            setErrors({ submit: 'Failed to save trip. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleFlight = (flightId: string) => {
        setFormData(prev => ({
            ...prev,
            flightIds: prev.flightIds.includes(flightId)
                ? prev.flightIds.filter(id => id !== flightId)
                : [...prev.flightIds, flightId],
        }));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()],
            }));
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag),
        }));
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={isEditing ? 'Edit Trip' : 'Create New Trip'} 
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {errors.submit && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{errors.submit}</p>
                    </div>
                )}

                {/* Trip Name & Description */}
                <div className="space-y-4">
                    <Input
                        label="Trip Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Europe Summer 2024"
                        error={errors.name}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add a description for your trip..."
                            rows={2}
                            className="w-full px-4 py-3 bg-dark-surface border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors resize-none"
                        />
                    </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        type="date"
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        error={errors.startDate}
                        required
                    />
                    <Input
                        type="date"
                        label="End Date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        error={errors.endDate}
                        required
                    />
                </div>

                {/* Flight Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Flights <span className="text-red-400">*</span>
                    </label>
                    {errors.flights && (
                        <p className="text-red-400 text-sm mb-2">{errors.flights}</p>
                    )}
                    
                    <div className="max-h-60 overflow-y-auto border border-white/10 rounded-lg divide-y divide-white/5">
                        {availableFlights.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No available flights. Add flights first.
                            </div>
                        ) : (
                            availableFlights.map((flight) => (
                                <FlightSelectItem
                                    key={flight.id}
                                    flight={flight}
                                    isSelected={formData.flightIds.includes(flight.id)}
                                    onToggle={() => toggleFlight(flight.id)}
                                />
                            ))
                        )}
                    </div>
                    
                    {formData.flightIds.length > 0 && (
                        <p className="text-sm text-neon-cyan mt-2">
                            {formData.flightIds.length} flight{formData.flightIds.length > 1 ? 's' : ''} selected
                        </p>
                    )}
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag();
                                }
                            }}
                            placeholder="Add a tag..."
                            className="flex-1 px-4 py-2 bg-dark-surface border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            className="px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg text-neon-cyan transition-all"
                        >
                            Add
                        </button>
                    </div>
                    {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 flex items-center gap-2"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
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
                        {isEditing ? 'Save Changes' : 'Create Trip'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

/**
 * Flight selection item component
 */
interface FlightSelectItemProps {
    flight: Flight;
    isSelected: boolean;
    onToggle: () => void;
}

function FlightSelectItem({ flight, isSelected, onToggle }: FlightSelectItemProps) {
    return (
        <div
            onClick={onToggle}
            className={`p-3 cursor-pointer transition-all ${
                isSelected 
                    ? 'bg-neon-cyan/10 border-l-2 border-neon-cyan' 
                    : 'hover:bg-white/5'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected 
                        ? 'bg-neon-cyan border-neon-cyan' 
                        : 'border-gray-500'
                }`}>
                    {isSelected && <span className="text-dark-bg text-sm">✓</span>}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                            {flight.originAirport.iata} → {flight.destinationAirport.iata}
                        </span>
                        <span className="text-gray-500 text-sm">
                            {flight.airline}
                        </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                        {formatDate(flight.date)}
                    </div>
                </div>
            </div>
        </div>
    );
}

