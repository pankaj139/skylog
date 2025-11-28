/**
 * PhotoViewer Component - Phase 2: Photos & Memories
 * 
 * A fullscreen lightbox modal for viewing photos with navigation.
 * 
 * Features:
 * - Fullscreen photo display
 * - Keyboard navigation (arrows, escape)
 * - Swipe gestures on mobile
 * - Zoom capability
 * - Photo counter
 * 
 * Usage:
 *   <PhotoViewer
 *     photos={photoUrls}
 *     isOpen={viewerOpen}
 *     onClose={() => setViewerOpen(false)}
 *     initialIndex={0}
 *   />
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface PhotoViewerProps {
    // Array of photo URLs
    photos: string[];
    // Whether the viewer is open
    isOpen: boolean;
    // Handler to close the viewer
    onClose: () => void;
    // Initial photo index to display
    initialIndex?: number;
}

/**
 * PhotoViewer displays photos in a fullscreen lightbox with navigation
 * 
 * @param photos - Array of photo URLs
 * @param isOpen - Whether the viewer is open
 * @param onClose - Handler to close the viewer
 * @param initialIndex - Starting photo index
 */
export default function PhotoViewer({
    photos,
    isOpen,
    onClose,
    initialIndex = 0,
}: PhotoViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Reset to initial index when opening
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setIsZoomed(false);
            setIsLoading(true);
        }
    }, [isOpen, initialIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
                case 'Escape':
                    onClose();
                    break;
                case ' ':
                    e.preventDefault();
                    setIsZoomed(z => !z);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, photos.length]);

    // Prevent body scroll when open
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

    const goToPrevious = useCallback(() => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
        setIsLoading(true);
        setIsZoomed(false);
    }, [photos.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
        setIsLoading(true);
        setIsZoomed(false);
    }, [photos.length]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || photos.length === 0) return null;

    const currentPhoto = photos[currentIndex];

    return createPortal(
        <div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in"
            onClick={handleBackdropClick}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                aria-label="Close viewer"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Photo Counter */}
            <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/70">
                {currentIndex + 1} / {photos.length}
            </div>

            {/* Zoom Toggle */}
            <button
                onClick={() => setIsZoomed(z => !z)}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white/70 hover:text-white transition-all"
            >
                {isZoomed ? '🔍 Zoom Out' : '🔎 Zoom In'}
            </button>

            {/* Previous Button */}
            {photos.length > 1 && (
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    aria-label="Previous photo"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Photo */}
            <div 
                className={`relative max-w-full max-h-full transition-transform duration-300 ${
                    isZoomed ? 'cursor-zoom-out scale-150' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(z => !z)}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                )}
                <img
                    src={currentPhoto}
                    alt={`Photo ${currentIndex + 1}`}
                    className={`max-w-[90vw] max-h-[85vh] object-contain transition-opacity duration-300 ${
                        isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoad={() => setIsLoading(false)}
                    draggable={false}
                />
            </div>

            {/* Next Button */}
            {photos.length > 1 && (
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    aria-label="Next photo"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-xl max-w-[90vw] overflow-x-auto">
                    {photos.map((url, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentIndex(index);
                                setIsLoading(true);
                                setIsZoomed(false);
                            }}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                index === currentIndex 
                                    ? 'border-neon-cyan scale-110' 
                                    : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Keyboard Hint */}
            <div className="absolute bottom-4 right-4 z-10 text-white/30 text-xs hidden md:block">
                Use ← → arrows • Space to zoom • Esc to close
            </div>
        </div>,
        document.body
    );
}

