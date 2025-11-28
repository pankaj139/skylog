import { useState } from 'react';
import { X, Heart } from 'lucide-react';
import { updateUserProfile } from '../../services/userService';
import type { User, TravelPreferences } from '../../types';
import Button from '../common/Button';

interface PreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSuccess: () => void;
}

const TRAVEL_STYLES = ['Adventure', 'Relaxation', 'Culture', 'Food', 'Nature', 'Urban', 'Beach', 'Mountains'];
const BUDGET_LEVELS = ['Budget', 'Mid-Range', 'Luxury'] as const;
const ACCOMMODATION_TYPES = ['Hotels', 'Hostels', 'Resorts', 'Airbnb', 'Boutique', 'Camping'];
const INTERESTS = ['History', 'Art', 'Sports', 'Wildlife', 'Photography', 'Shopping', 'Nightlife', 'Wellness'];

export default function PreferencesModal({ isOpen, onClose, user, onSuccess }: PreferencesModalProps) {
    const [preferences, setPreferences] = useState<TravelPreferences>(user.preferences || {});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const toggleArrayItem = (field: 'travelStyle' | 'accommodationType' | 'interests', item: string) => {
        const current = preferences[field] || [];
        const newArray = current.includes(item)
            ? current.filter(i => i !== item)
            : [...current, item];
        setPreferences({ ...preferences, [field]: newArray });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await updateUserProfile(user.id, { preferences });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating preferences:', error);
            alert('Failed to update preferences');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 glass border-b border-white/10 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Heart size={24} className="text-neon-cyan" />
                        <h2 className="text-2xl font-bold text-white">Travel Preferences</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Travel Style */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-3">
                            Travel Style <span className="text-gray-500">(Select all that apply)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TRAVEL_STYLES.map(style => (
                                <button
                                    key={style}
                                    type="button"
                                    onClick={() => toggleArrayItem('travelStyle', style)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${preferences.travelStyle?.includes(style)
                                            ? 'bg-neon-blue text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Budget Level */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-3">
                            Budget Level
                        </label>
                        <div className="flex gap-4">
                            {BUDGET_LEVELS.map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setPreferences({ ...preferences, budgetLevel: level })}
                                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${preferences.budgetLevel === level
                                            ? 'bg-neon-cyan text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Accommodation Type */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-3">
                            Accommodation Preferences <span className="text-gray-500">(Select all that apply)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ACCOMMODATION_TYPES.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => toggleArrayItem('accommodationType', type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${preferences.accommodationType?.includes(type)
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interests */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-3">
                            Interests <span className="text-gray-500">(Select all that apply)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {INTERESTS.map(interest => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => toggleArrayItem('interests', interest)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${preferences.interests?.includes(interest)
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
