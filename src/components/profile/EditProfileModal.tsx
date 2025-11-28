import { useState } from 'react';
import { X, Save } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { updateUserProfile } from '../../services/userService';
import type { User } from '../../types';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSuccess: () => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [homeAirport, setHomeAirport] = useState(user.homeAirport || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await updateUserProfile(user.id, {
                displayName: displayName.trim() || undefined,
                homeAirport: homeAirport.trim() || undefined,
            });

            onSuccess();
            onClose();
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <Input
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                />

                <Input
                    label="Home Airport (IATA Code)"
                    value={homeAirport}
                    onChange={(e) => setHomeAirport(e.target.value.toUpperCase())}
                    placeholder="e.g., JFK, LAX, LHR"
                    maxLength={3}
                />

                <div className="flex gap-3 justify-end pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        <X size={18} className="mr-2" />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        <Save size={18} className="mr-2" />
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
