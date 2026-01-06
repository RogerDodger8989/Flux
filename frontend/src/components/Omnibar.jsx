import React, { useState, useEffect } from 'react';
import useSearchStore from '../store/searchStore';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const Omnibar = () => {
    const { query, search, toggleFilterPanel } = useSearchStore();
    const [localQuery, setLocalQuery] = useState(query);

    // Sync local state with store
    useEffect(() => {
        setLocalQuery(query);
    }, [query]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localQuery !== query) {
                search(localQuery);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localQuery, search, query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        search(localQuery);
    };

    return (
        <div className="flex-1 max-w-2xl mx-auto relative px-4">
            <form onSubmit={handleSubmit} className="relative group">
                <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" />

                <input
                    type="text"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    placeholder="Search query (e.g. year:1986 rating:5 person:Dennis)"
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-20 py-2 text-sm text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all shadow-sm placeholder-gray-400"
                />

                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {localQuery && (
                        <button
                            type="button"
                            onClick={() => { setLocalQuery(''); search(''); }}
                            className="p-1 hover:bg-gray-700/50 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={toggleFilterPanel}
                        className="p-1.5 hover:bg-gray-700/50 rounded-md text-gray-400 hover:text-accent-400 transition-colors border border-transparent hover:border-gray-600"
                        title="Toggle Filters"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Omnibar;
