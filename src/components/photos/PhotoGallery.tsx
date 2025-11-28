/**
 * PhotoGallery Component - Phase 2: Photos & Memories
 * 
 * A responsive grid gallery for displaying flight/trip photos.
 * Supports click to open full-screen viewer.
 * 
 * Usage:
 *   <PhotoGallery
 *     photos={photoUrls}
 *     onPhotoClick={(index) => openViewer(index)}
 *   />
 */

import { useState } from 'react';
import PhotoViewer from './PhotoViewer';

interface PhotoGalleryProps {
    // Array of photo URLs to display
    photos: string[];
    // Optional: Max photos to show (with "show more" option)
    maxDisplay?: number;
    // Optional: Custom click handler (if not provided, opens built-in viewer)
    onPhotoClick?: (index: number) => void;
    // Optional: Show delete buttons
    editable?: boolean;
    // Optional: Delete handler
    onDelete?: (photoUrl: string) => void;
    // Optional: Gallery title
    title?: string;
    // Grid columns
    columns?: 2 | 3 | 4 | 5;
}

/**
 * PhotoGallery displays photos in a responsive grid with lightbox support
 * 
 * @param photos - Array of photo URLs
 * @param maxDisplay - Maximum photos to show before "show more"
 * @param onPhotoClick - Custom click handler
 * @param editable - Whether to show delete buttons
 * @param onDelete - Handler for photo deletion
 */
export default function PhotoGallery({
    photos,
    maxDisplay = 12,
    onPhotoClick,
    editable = false,
    onDelete,
    title,
    columns = 4,
}: PhotoGalleryProps) {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [showAll, setShowAll] = useState(false);

    const displayedPhotos = showAll ? photos : photos.slice(0, maxDisplay);
    const hasMore = photos.length > maxDisplay;
    const hiddenCount = photos.length - maxDisplay;

    const columnClasses = {
        2: 'grid-cols-2',
        3: 'grid-cols-2 sm:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
        5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    };

    const handlePhotoClick = (index: number) => {
        if (onPhotoClick) {
            onPhotoClick(index);
        } else {
            setViewerIndex(index);
            setViewerOpen(true);
        }
    };

    const handleDelete = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(url);
        }
    };

    if (photos.length === 0) {
        return (
            <div className="text-center py-8">
                <span className="text-4xl mb-2 block">📷</span>
                <p className="text-gray-400">No photos yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            {title && (
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <span className="text-sm text-gray-400">{photos.length} photos</span>
                </div>
            )}

            {/* Photo Grid */}
            <div className={`grid ${columnClasses[columns]} gap-3`}>
                {displayedPhotos.map((url, index) => (
                    <div
                        key={index}
                        onClick={() => handlePhotoClick(index)}
                        className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg border border-white/10 hover:border-neon-cyan/40 transition-all"
                    >
                        <img
                            src={url}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-2xl">🔍</span>
                        </div>

                        {/* Delete Button */}
                        {editable && onDelete && (
                            <button
                                onClick={(e) => handleDelete(e, url)}
                                className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                                title="Delete photo"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}

                {/* Show More Tile */}
                {hasMore && !showAll && (
                    <div
                        onClick={() => setShowAll(true)}
                        className="aspect-square cursor-pointer rounded-lg border border-white/10 hover:border-neon-cyan/40 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center"
                    >
                        <span className="text-3xl text-white font-bold">+{hiddenCount}</span>
                        <span className="text-sm text-gray-400 mt-1">more</span>
                    </div>
                )}
            </div>

            {/* Show Less Button */}
            {showAll && hasMore && (
                <button
                    onClick={() => setShowAll(false)}
                    className="text-neon-cyan hover:text-neon-cyan/80 text-sm transition-colors"
                >
                    Show less
                </button>
            )}

            {/* Photo Viewer Modal */}
            <PhotoViewer
                photos={photos}
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                initialIndex={viewerIndex}
            />
        </div>
    );
}

/**
 * Compact version of PhotoGallery for cards/previews
 */
export function PhotoGalleryPreview({
    photos,
    maxDisplay = 4,
    onClick,
}: {
    photos: string[];
    maxDisplay?: number;
    onClick?: () => void;
}) {
    if (photos.length === 0) return null;

    const displayedPhotos = photos.slice(0, maxDisplay);
    const hasMore = photos.length > maxDisplay;

    return (
        <div 
            className="flex gap-2 cursor-pointer"
            onClick={onClick}
        >
            {displayedPhotos.map((url, index) => (
                <div
                    key={index}
                    className="w-12 h-12 rounded-lg overflow-hidden border border-white/10"
                >
                    <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
            {hasMore && (
                <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                    <span className="text-xs text-gray-400">+{photos.length - maxDisplay}</span>
                </div>
            )}
        </div>
    );
}

