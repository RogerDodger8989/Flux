import { create } from 'zustand';
import axios from 'axios';

const useSearchStore = create((set, get) => ({
    query: '',
    results: [],
    total: 0,
    facets: {
        cameraModel: [],
        keywords: [],
        people: [],
        years: []
    },
    isLoading: false,
    error: null,
    isFilterOpen: false,

    setQuery: (q) => set({ query: q }),

    toggleFilterPanel: () => set(state => ({ isFilterOpen: !state.isFilterOpen })),

    search: async (q = get().query) => {
        set({ isLoading: true, error: null, query: q });
        try {
            // Run search and facet aggregation in parallel
            const [searchRes, facetsRes] = await Promise.all([
                axios.get(`/api/search?q=${encodeURIComponent(q)}`),
                axios.get(`/api/search/facets?q=${encodeURIComponent(q)}`)
            ]);

            set({
                results: searchRes.data.images,
                total: searchRes.data.total,
                facets: facetsRes.data,
                isLoading: false
            });
        } catch (error) {
            console.error('Search failed:', error);
            set({ error: 'Search failed', isLoading: false });
        }
    },

    fetchFacets: async () => {
        try {
            const { data } = await axios.get('/api/search/facets?q=');
            set({ facets: data });
        } catch (error) {
            console.error('Failed to fetch facets:', error);
        }
    },

    // Helper to add/remove a filter token from the query string
    toggleFilter: (key, value) => {
        const { query } = get();
        let token = '';

        // Format token based on key
        if (typeof value === 'string' && value.includes(' ')) {
            token = `${key}:"${value}"`;
        } else {
            token = `${key}:${value}`;
        }

        // Check if token exists
        if (query.includes(token)) {
            // Remove token
            const newQuery = query.replace(token, '').replace(/\s\s+/g, ' ').trim();
            get().search(newQuery);
        } else {
            // Add token
            const newQuery = `${query} ${token}`.trim();
            get().search(newQuery);
        }
    },

    clearSearch: () => {
        set({ query: '' });
        get().search('');
    }
}));

export default useSearchStore;
