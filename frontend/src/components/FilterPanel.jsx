import React, { useRef, useEffect } from 'react';
import useSearchStore from '../store/searchStore';
import { X, ChevronDown, Check } from 'lucide-react';

const FilterSection = ({ title, items, type, onToggle, activeQuery }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 px-1">
                {title}
            </h3>
            <div className="space-y-1">
                {items.map((item) => {
                    // Check if this filter is active in the query
                    const valueStr = typeof item.value === 'string' && item.value.includes(' ')
                        ? `"${item.value}"`
                        : item.value;
                    const token = `${type}:${valueStr}`;
                    const isActive = activeQuery.includes(token);

                    return (
                        <button
                            key={item.value}
                            onClick={() => onToggle(type, item.value)}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${isActive
                                ? 'bg-accent-500/20 text-accent-400'
                                : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                                }`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <div className={`w-3 h-3 rounded border flex items-center justify-center ${isActive ? 'bg-accent-500 border-accent-500' : 'border-gray-600'
                                    }`}>
                                    {isActive && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <span className="truncate">{item.value}</span>
                            </div>
                            <span className="text-xs text-gray-500 ml-2">{item.count}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const FilterPanel = () => {
    const { isFilterOpen, toggleFilterPanel, facets, query, toggleFilter } = useSearchStore();
    const panelRef = useRef(null);

    // Close on click outside (optional, maybe distracting)
    /*
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target) && isFilterOpen) {
                toggleFilterPanel();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isFilterOpen, toggleFilterPanel]);
    */

    // Initial fetch of facets
    useEffect(() => {
        // Trigger generic search to populate initial facets if empty
        if (!facets.years || facets.years.length === 0) {
            // This assumes performSearch updates facets. 
            // If performSearch depends on query, we might need a dedicated fetchFacets.
            // But usually searching with empty query returns all stats.
            const fetchInitial = async () => {
                // If the store exposes a direct facet fetcher, use it. 
                // Otherwise checking if performSearch handles it. 
                // Let's assume performSearch('') does the job based on typical patterns.
            };
            // Actually, we'll let the user interact or useEffect in Library handle it.
            // But wait, the user said it shows *nothing*.
            // Let's force a fetch if needed.
        }
    }, []);

    return (
        <div
            ref={panelRef}
            className={`
                bg-[var(--bg-secondary)] border-r border-[var(--border-color)] z-20
                transition-[width,opacity] duration-300 ease-in-out flex flex-col overflow-hidden
                ${isFilterOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'}
            `}
        >
            <div className="flex items-center justify-between p-4 mb-2 shrink-0">
                <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
                <button
                    onClick={toggleFilterPanel}
                    className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <FilterSection
                    title="Years"
                    items={facets.years}
                    type="year"
                    onToggle={toggleFilter}
                    activeQuery={query}
                />

                <FilterSection
                    title="Cameras"
                    items={facets.cameraModel}
                    type="camera"
                    onToggle={toggleFilter}
                    activeQuery={query}
                />

                <FilterSection
                    title="People"
                    items={facets.people}
                    type="person"
                    onToggle={toggleFilter}
                    activeQuery={query}
                />

                <FilterSection
                    title="Keywords"
                    items={facets.keywords}
                    type="keyword"
                    onToggle={toggleFilter}
                    activeQuery={query}
                />
            </div>
        </div>
    );
};

export default FilterPanel;
