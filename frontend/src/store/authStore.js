import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    checkAuth: async () => {
        try {
            const { data } = await api.get('/auth/check');
            set({
                isAuthenticated: data.authenticated,
                user: data.user || null,
                isLoading: false,
            });
        } catch (error) {
            set({ isAuthenticated: false, user: null, isLoading: false });
        }
    },

    login: async (username, password) => {
        const { data } = await api.post('/auth/login', { username, password });
        set({
            isAuthenticated: true,
            user: data.user,
        });
        return data;
    },

    logout: async () => {
        await api.post('/auth/logout');
        set({ isAuthenticated: false, user: null });
    },
}));

export default useAuthStore;
