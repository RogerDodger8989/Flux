import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useViewStore = create(
    persist(
        (set) => ({
            // View mode: 'grid' or 'list'
            viewMode: 'grid',

            // Grid size: 'small', 'medium', 'large', 'xlarge'
            gridSize: 'medium',

            // Toggle between grid and list
            setViewMode: (mode) => set({ viewMode: mode }),

            // Set grid size
            setGridSize: (size) => set({ gridSize: size }),
        }),
        {
            name: 'flux-view-settings',
        }
    )
);

export default useViewStore;
