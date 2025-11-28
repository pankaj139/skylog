import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}: ConfirmDialogProps) {
    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return '⚠️';
            case 'warning':
                return '⚡';
            case 'info':
                return 'ℹ️';
            default:
                return '❓';
        }
    };

    const getConfirmButtonClass = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-500 hover:bg-red-600 text-white';
            case 'warning':
                return 'bg-yellow-500 hover:bg-yellow-600 text-white';
            case 'info':
                return 'bg-neon-blue hover:bg-neon-cyan text-white';
            default:
                return 'bg-neon-blue hover:bg-neon-cyan text-white';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="text-center py-6">
                <div className="text-6xl mb-4">{getIcon()}</div>
                <p className="text-gray-300 text-lg mb-8">{message}</p>

                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${getConfirmButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

