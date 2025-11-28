/**
 * PhotoUpload Component - Phase 2: Photos & Memories
 * 
 * A drag-and-drop photo upload component with preview and progress.
 * 
 * Features:
 * - Drag and drop file upload
 * - Click to browse files
 * - Multiple file selection
 * - Image preview before upload
 * - Upload progress indicator
 * - File type and size validation
 * 
 * Usage:
 *   <PhotoUpload
 *     onUpload={(files) => handleUpload(files)}
 *     onPhotosChange={(urls) => setPhotos(urls)}
 *     existingPhotos={photos}
 *     maxFiles={10}
 *   />
 */

import { useState, useRef, useCallback } from 'react';

interface PhotoUploadProps {
    // Handler for when files are selected
    onUpload?: (files: File[]) => Promise<string[]>;
    // Handler for when photos array changes (including removals)
    onPhotosChange?: (urls: string[]) => void;
    // Existing photo URLs
    existingPhotos?: string[];
    // Maximum number of files allowed
    maxFiles?: number;
    // Whether upload is in progress
    uploading?: boolean;
    // Disabled state
    disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * PhotoUpload provides a drag-and-drop interface for uploading photos
 * 
 * @param onUpload - Async handler to upload files, returns array of URLs
 * @param onPhotosChange - Handler called when photos array changes
 * @param existingPhotos - Array of already uploaded photo URLs
 * @param maxFiles - Maximum number of photos allowed (default: 10)
 */
export default function PhotoUpload({
    onUpload,
    onPhotosChange,
    existingPhotos = [],
    maxFiles = 10,
    uploading = false,
    disabled = false,
}: PhotoUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // All photos (existing + pending previews)
    const totalPhotos = existingPhotos.length + pendingFiles.length;
    const canAddMore = totalPhotos < maxFiles;

    /**
     * Validates a file before adding to pending
     */
    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `Invalid file type: ${file.name}. Only JPEG, PNG, WebP, and GIF allowed.`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File too large: ${file.name}. Maximum size is 5MB.`;
        }
        return null;
    };

    /**
     * Handles file selection from input or drop
     */
    const handleFiles = useCallback((files: FileList | File[]) => {
        setError(null);
        const fileArray = Array.from(files);
        
        // Check if adding these would exceed max
        const availableSlots = maxFiles - existingPhotos.length - pendingFiles.length;
        if (fileArray.length > availableSlots) {
            setError(`Can only add ${availableSlots} more photo${availableSlots !== 1 ? 's' : ''}`);
            return;
        }

        // Validate each file
        const validFiles: File[] = [];
        for (const file of fileArray) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            validFiles.push(file);
        }

        setPendingFiles(prev => [...prev, ...validFiles]);
    }, [maxFiles, existingPhotos.length, pendingFiles.length]);

    /**
     * Handles drag events
     */
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (disabled || !canAddMore) return;
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    }, [disabled, canAddMore, handleFiles]);

    /**
     * Handles file input change
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
        // Reset input value so same file can be selected again
        e.target.value = '';
    };

    /**
     * Removes a pending file
     */
    const removePendingFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    /**
     * Removes an existing photo
     */
    const removeExistingPhoto = (url: string) => {
        if (onPhotosChange) {
            onPhotosChange(existingPhotos.filter(u => u !== url));
        }
    };

    /**
     * Uploads all pending files
     */
    const uploadPendingFiles = async () => {
        if (!onUpload || pendingFiles.length === 0) return;

        try {
            setUploadProgress(0);
            const urls = await onUpload(pendingFiles);
            
            // Add new URLs to existing photos
            if (onPhotosChange) {
                onPhotosChange([...existingPhotos, ...urls]);
            }
            
            // Clear pending files
            setPendingFiles([]);
            setUploadProgress(100);
        } catch (err) {
            setError('Failed to upload photos. Please try again.');
            console.error('Upload error:', err);
        }
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && canAddMore && fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${isDragging 
                        ? 'border-neon-cyan bg-neon-cyan/10' 
                        : 'border-white/20 hover:border-neon-cyan/50 hover:bg-white/5'
                    }
                    ${disabled || !canAddMore ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    multiple
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={disabled || !canAddMore}
                />

                <div className="text-4xl mb-3">📷</div>
                <p className="text-white font-medium mb-1">
                    {isDragging ? 'Drop photos here' : 'Drag & drop photos'}
                </p>
                <p className="text-gray-500 text-sm">
                    or click to browse • Max {maxFiles} photos • 5MB each
                </p>
                <p className="text-gray-600 text-xs mt-2">
                    JPEG, PNG, WebP, GIF supported
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Photo Previews */}
            {(existingPhotos.length > 0 || pendingFiles.length > 0) && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                            {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''} selected
                        </span>
                        {pendingFiles.length > 0 && onUpload && (
                            <button
                                onClick={uploadPendingFiles}
                                disabled={uploading}
                                className="px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/30 rounded-lg text-neon-cyan text-sm font-medium transition-all disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : `Upload ${pendingFiles.length} photo${pendingFiles.length !== 1 ? 's' : ''}`}
                            </button>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-neon-cyan transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}

                    {/* Preview Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {/* Existing Photos */}
                        {existingPhotos.map((url, index) => (
                            <div key={`existing-${index}`} className="relative group aspect-square">
                                <img
                                    src={url}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg border border-white/10"
                                />
                                <button
                                    onClick={() => removeExistingPhoto(url)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    ×
                                </button>
                                <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-green-500/80 rounded text-xs text-white">
                                    ✓
                                </div>
                            </div>
                        ))}

                        {/* Pending Files (not yet uploaded) */}
                        {pendingFiles.map((file, index) => (
                            <div key={`pending-${index}`} className="relative group aspect-square">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-full object-cover rounded-lg border border-neon-cyan/30"
                                />
                                <button
                                    onClick={() => removePendingFile(index)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    ×
                                </button>
                                <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-yellow-500/80 rounded text-xs text-white">
                                    Pending
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

