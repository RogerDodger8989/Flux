import { create } from 'zustand';

const useThemeStore = create((set) => ({
    theme: localStorage.getItem('flux-theme') || 'dark',

    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('flux-theme', newTheme);

        // Update document class
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        return { theme: newTheme };
    }),

    initTheme: () => set((state) => {
        // Apply theme on init
        if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return state;
    }),
}));

export default useThemeStore;
