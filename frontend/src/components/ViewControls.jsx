import useViewStore from '../store/viewStore';

function ViewControls() {
    const { viewMode, gridSize, setViewMode, setGridSize } = useViewStore();

    const gridSizes = [
        { value: 'small', label: 'Små', cols: 'grid-cols-8' },
        { value: 'medium', label: 'Medium', cols: 'grid-cols-6' },
        { value: 'large', label: 'Stora', cols: 'grid-cols-4' },
        { value: 'xlarge', label: 'Extra stora', cols: 'grid-cols-2' },
    ];

    return (
        <div className="flex items-center gap-4">
            {/* View mode toggle */}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded transition ${viewMode === 'grid'
                            ? 'bg-primary-600 text-white'
                            : 'text-secondary hover:bg-tertiary'
                        }`}
                    title="Grid-vy"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </button>

                <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded transition ${viewMode === 'list'
                            ? 'bg-primary-600 text-white'
                            : 'text-secondary hover:bg-tertiary'
                        }`}
                    title="List-vy"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Grid size slider (only show in grid mode) */}
            {viewMode === 'grid' && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-tertiary">Storlek:</span>
                    <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                        {gridSizes.map((size) => (
                            <button
                                key={size.value}
                                onClick={() => setGridSize(size.value)}
                                className={`px-2 py-1 text-xs rounded transition ${gridSize === size.value
                                        ? 'bg-primary-600 text-white'
                                        : 'text-secondary hover:bg-tertiary'
                                    }`}
                                title={size.label}
                            >
                                {size.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewControls;
