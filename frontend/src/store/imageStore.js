import { create } from 'zustand';
import api from '../utils/api';

const useImageStore = create((set, get) => ({
    images: [],
    total: 0,
    loading: false,
    error: null,

    // Import state
    importing: false,
    importProgress: 0,
    importStatus: '',

    fetchImages: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.get('/images', { params });
            set({
                images: data.images,
                total: data.total,
                loading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.error || 'Failed to fetch images',
                loading: false,
            });
        }
    },

    scanFolder: async (folderPath) => {
        try {
            const { data } = await api.post('/images/scan', { path: folderPath });
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to scan folder');
        }
    },

    importImages: async (files) => {
        set({ importing: true, importProgress: 0, importStatus: 'Importerar bilder...' });

        try {
            const batchSize = 10; // Import 10 at a time
            const batches = [];

            for (let i = 0; i < files.length; i += batchSize) {
                batches.push(files.slice(i, i + batchSize));
            }

            let imported = 0;
            const errors = [];

            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];

                try {
                    const { data } = await api.post('/images/import', { files: batch });
                    imported += data.imported;
                    errors.push(...data.details.errors);

                    const progress = Math.round(((i + 1) / batches.length) * 100);
                    set({
                        importProgress: progress,
                        importStatus: `Importerade ${imported} av ${files.length} bilder...`
                    });
                } catch (error) {
                    console.error('Batch import error:', error);
                }
            }

            set({
                importing: false,
                importProgress: 100,
                importStatus: `Import klar! ${imported} bilder importerade.`
            });

            // Refresh image list
            get().fetchImages();

            return { imported, errors };
        } catch (error) {
            set({
                importing: false,
                importProgress: 0,
                importStatus: 'Import misslyckades'
            });
            throw error;
        }
    },

    updateImage: async (id, updates) => {
        try {
            const { data } = await api.patch(`/images/${id}`, updates);

            // Update in local state
            set((state) => ({
                images: state.images.map((img) => (img.id === id ? { ...img, ...data } : img)),
            }));

            return data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to update image');
        }
    },

    deleteImage: async (id) => {
        try {
            await api.delete(`/images/${id}`);

            // Remove from local state
            set((state) => ({
                images: state.images.filter((img) => img.id !== id),
                total: state.total - 1,
            }));
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to delete image');
        }
    },
}));

export default useImageStore;
