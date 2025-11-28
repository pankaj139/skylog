/**
 * Storage Service - Phase 2: Photos & Memories
 * 
 * This service handles all Firebase Storage operations for photo uploads.
 * Supports uploading, deleting, and managing flight/trip photos.
 * 
 * Usage:
 *   import { uploadPhoto, deletePhoto, uploadMultiplePhotos } from './storageService';
 *   
 *   // Upload a single photo
 *   const url = await uploadPhoto(userId, flightId, file);
 *   
 *   // Upload multiple photos
 *   const urls = await uploadMultiplePhotos(userId, flightId, files);
 *   
 *   // Delete a photo
 *   await deletePhoto(photoUrl);
 */

import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject,
    listAll,
} from 'firebase/storage';
import { storage } from '../config/firebase';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validates a file before upload
 * 
 * @param file - The file to validate
 * @throws Error if file is invalid
 */
function validateFile(file: File): void {
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP, GIF`);
    }
    
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 5MB`);
    }
}

/**
 * Generates a unique filename for upload
 * 
 * @param originalName - Original filename
 * @returns Unique filename with timestamp
 */
function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}-${random}.${extension}`;
}

/**
 * Uploads a single photo to Firebase Storage
 * 
 * @param userId - The ID of the user uploading the photo
 * @param flightId - The ID of the flight the photo belongs to
 * @param file - The file to upload
 * @returns The download URL of the uploaded photo
 * 
 * @example
 * const url = await uploadPhoto('user123', 'flight456', photoFile);
 */
export async function uploadPhoto(
    userId: string, 
    flightId: string, 
    file: File
): Promise<string> {
    try {
        // Validate file
        validateFile(file);

        // Generate unique filename
        const filename = generateUniqueFilename(file.name);
        
        // Create storage reference
        const storageRef = ref(storage, `users/${userId}/flights/${flightId}/${filename}`);
        
        // Upload file
        const snapshot = await uploadBytes(storageRef, file, {
            contentType: file.type,
            customMetadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString(),
            },
        });
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
}

/**
 * Uploads multiple photos to Firebase Storage
 * 
 * @param userId - The ID of the user uploading the photos
 * @param flightId - The ID of the flight the photos belong to
 * @param files - Array of files to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Array of download URLs for uploaded photos
 * 
 * @example
 * const urls = await uploadMultiplePhotos('user123', 'flight456', files, (progress) => {
 *   console.log(`${progress}% complete`);
 * });
 */
export async function uploadMultiplePhotos(
    userId: string,
    flightId: string,
    files: File[],
    onProgress?: (progress: number) => void
): Promise<string[]> {
    const urls: string[] = [];
    let completed = 0;

    for (const file of files) {
        const url = await uploadPhoto(userId, flightId, file);
        urls.push(url);
        completed++;
        
        if (onProgress) {
            onProgress(Math.round((completed / files.length) * 100));
        }
    }

    return urls;
}

/**
 * Uploads a photo for a trip cover
 * 
 * @param userId - The ID of the user
 * @param tripId - The ID of the trip
 * @param file - The file to upload
 * @returns The download URL of the uploaded cover photo
 */
export async function uploadTripCover(
    userId: string,
    tripId: string,
    file: File
): Promise<string> {
    try {
        validateFile(file);

        const filename = generateUniqueFilename(file.name);
        const storageRef = ref(storage, `users/${userId}/trips/${tripId}/cover/${filename}`);
        
        const snapshot = await uploadBytes(storageRef, file, {
            contentType: file.type,
        });
        
        return await getDownloadURL(snapshot.ref);
    } catch (error) {
        console.error('Error uploading trip cover:', error);
        throw error;
    }
}

/**
 * Deletes a photo from Firebase Storage
 * 
 * @param photoUrl - The download URL of the photo to delete
 * 
 * @example
 * await deletePhoto('https://firebasestorage.googleapis.com/...');
 */
export async function deletePhoto(photoUrl: string): Promise<void> {
    try {
        // Extract the path from the URL
        const urlObj = new URL(photoUrl);
        const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);
        
        if (!pathMatch) {
            throw new Error('Invalid storage URL');
        }
        
        const path = decodeURIComponent(pathMatch[1]);
        const storageRef = ref(storage, path);
        
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
    }
}

/**
 * Deletes multiple photos from Firebase Storage
 * 
 * @param photoUrls - Array of download URLs to delete
 * 
 * @example
 * await deleteMultiplePhotos([url1, url2, url3]);
 */
export async function deleteMultiplePhotos(photoUrls: string[]): Promise<void> {
    const deletePromises = photoUrls.map(url => deletePhoto(url));
    await Promise.all(deletePromises);
}

/**
 * Deletes all photos for a specific flight
 * 
 * @param userId - The ID of the user
 * @param flightId - The ID of the flight
 */
export async function deleteFlightPhotos(userId: string, flightId: string): Promise<void> {
    try {
        const folderRef = ref(storage, `users/${userId}/flights/${flightId}`);
        const listResult = await listAll(folderRef);
        
        const deletePromises = listResult.items.map(item => deleteObject(item));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting flight photos:', error);
        throw error;
    }
}

/**
 * Resizes an image file before upload (client-side)
 * 
 * @param file - The original file
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - JPEG quality (0-1)
 * @returns Promise resolving to the resized file
 */
export async function resizeImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Could not create blob'));
                        return;
                    }
                    const resizedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(resizedFile);
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Gets all photo URLs for a flight
 * 
 * @param userId - The ID of the user
 * @param flightId - The ID of the flight
 * @returns Array of download URLs
 */
export async function getFlightPhotos(userId: string, flightId: string): Promise<string[]> {
    try {
        const folderRef = ref(storage, `users/${userId}/flights/${flightId}`);
        const listResult = await listAll(folderRef);
        
        const urlPromises = listResult.items.map(item => getDownloadURL(item));
        return await Promise.all(urlPromises);
    } catch (error) {
        console.error('Error getting flight photos:', error);
        return [];
    }
}

