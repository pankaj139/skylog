import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className={`relative w-full ${sizeClasses[size]} glass rounded-2xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg text-2xl leading-none"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="px-6 py-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
