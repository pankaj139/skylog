/**
 * UI Store - Global UI state management
 * 
 * This store manages UI state like modals, theme, and dialogs.
 * Updated: Phase 3 - Added Gmail import modal states
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    theme: 'dark' | 'light';

    // Flight modals
    isAddFlightModalOpen: boolean;
    isEditFlightModalOpen: boolean;
    editingFlightId: string | null;
    isDeleteDialogOpen: boolean;
    deletingFlightId: string | null;

    // Phase 2: Trip modals
    isCreateTripModalOpen: boolean;
    isEditTripModalOpen: boolean;
    editingTripId: string | null;
    isDeleteTripDialogOpen: boolean;
    deletingTripId: string | null;

    // Phase 3: Import modals
    isCSVImportModalOpen: boolean;

    // Actions
    toggleTheme: () => void;
    setTheme: (theme: 'dark' | 'light') => void;
    openAddFlightModal: () => void;
    closeAddFlightModal: () => void;
    openEditFlightModal: (flightId: string) => void;
    closeEditFlightModal: () => void;
    openDeleteDialog: (flightId: string) => void;
    closeDeleteDialog: () => void;

    // Phase 2: Trip actions
    openCreateTripModal: () => void;
    closeCreateTripModal: () => void;
    openEditTripModal: (tripId: string) => void;
    closeEditTripModal: () => void;
    openDeleteTripDialog: (tripId: string) => void;
    closeDeleteTripDialog: () => void;

    // Phase 3: Import actions
    openCSVImportModal: () => void;
    closeCSVImportModal: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'dark',
            isAddFlightModalOpen: false,
            isEditFlightModalOpen: false,
            editingFlightId: null,
            isDeleteDialogOpen: false,
            deletingFlightId: null,

            // Phase 2: Trip modal initial states
            isCreateTripModalOpen: false,
            isEditTripModalOpen: false,
            editingTripId: null,
            isDeleteTripDialogOpen: false,
            deletingTripId: null,

            // Phase 3: Import modal initial states
            isCSVImportModalOpen: false,

            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === 'dark' ? 'light' : 'dark',
                })),

            setTheme: (theme) => set({ theme }),

            openAddFlightModal: () => set({ isAddFlightModalOpen: true }),
            closeAddFlightModal: () => set({ isAddFlightModalOpen: false }),

            openEditFlightModal: (flightId) =>
                set({ isEditFlightModalOpen: true, editingFlightId: flightId }),
            closeEditFlightModal: () =>
                set({ isEditFlightModalOpen: false, editingFlightId: null }),

            openDeleteDialog: (flightId) =>
                set({ isDeleteDialogOpen: true, deletingFlightId: flightId }),
            closeDeleteDialog: () =>
                set({ isDeleteDialogOpen: false, deletingFlightId: null }),

            // Phase 2: Trip modal actions
            openCreateTripModal: () => set({ isCreateTripModalOpen: true }),
            closeCreateTripModal: () => set({ isCreateTripModalOpen: false }),

            openEditTripModal: (tripId) =>
                set({ isEditTripModalOpen: true, editingTripId: tripId }),
            closeEditTripModal: () =>
                set({ isEditTripModalOpen: false, editingTripId: null }),

            openDeleteTripDialog: (tripId) =>
                set({ isDeleteTripDialogOpen: true, deletingTripId: tripId }),
            closeDeleteTripDialog: () =>
                set({ isDeleteTripDialogOpen: false, deletingTripId: null }),

            // Phase 3: Import modal actions
            openCSVImportModal: () => set({ isCSVImportModalOpen: true }),
            closeCSVImportModal: () => set({ isCSVImportModalOpen: false }),
        }),
        {
            name: 'ui-storage',
        }
    )
);
