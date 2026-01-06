import React, { useEffect, useState } from 'react';
import useImageStore from '../store/imageStore';
import useViewStore from '../store/viewStore';
import useSearchStore from '../store/searchStore';
import { Upload, Library as LibraryIcon } from 'lucide-react';
import ImportModal from '../components/ImportModal';
import ImageGrid from '../components/ImageGrid';
import InspectorPanel from '../components/InspectorPanel';
import ViewControls from '../components/ViewControls';
import Omnibar from '../components/Omnibar';
import FilterPanel from '../components/FilterPanel';

const Library = () => {
    const { images, fetchImages, selectedImage, setSelectedImage } = useImageStore();
    const { results: searchResults, query, isFilterOpen, fetchFacets } = useSearchStore();
    const { gridSize } = useViewStore();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Map grid size names to classes
    const sizeMap = {
        small: 'grid-cols-8',
        medium: 'grid-cols-6',
        large: 'grid-cols-4',
        xlarge: 'grid-cols-2'
    };
    const gridSizeClass = sizeMap[gridSize] || 'grid-cols-6';

    useEffect(() => {
        fetchImages();
        fetchFacets(); // Load initial facets
    }, [fetchImages, fetchFacets]);

    // Use search results if query exists, otherwise show all images
    const displayImages = query ? searchResults : images;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <header className="h-[60px] bg-sidebar-bg border-b border-sidebar-border px-6 flex items-center justify-between shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <LibraryIcon className="w-5 h-5 text-accent-500" />
                    <h1 className="font-medium text-lg text-text-primary">Bibliotek</h1>
                    <span className="text-sm text-text-secondary ml-2">
                        {displayImages.length} bilder
                    </span>
                </div>

                <div className="flex-1 mx-4">
                    <Omnibar />
                </div>

                <div className="flex items-center gap-3">
                    <ViewControls />

                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Importera bilder</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden flex">
                <FilterPanel />

                <main className="flex-1 overflow-y-auto p-4 transition-all duration-300">
                    {displayImages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                            <LibraryIcon className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg">Inga bilder hittades</p>
                            {query ? (
                                <p className="text-sm mt-2">Prova att ändra dina filter eller sökord</p>
                            ) : (
                                <button
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="mt-4 text-accent-500 hover:text-accent-400 font-medium"
                                >
                                    Importera dina första bilder
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={`grid ${gridSizeClass} gap-4 pb-20`}>
                            {displayImages.map((image) => (
                                <ImageGrid
                                    key={image.id}
                                    image={image}
                                    isSelected={selectedImage?.id === image.id}
                                    onClick={() => setSelectedImage(image.id)}
                                />
                            ))}
                        </div>
                    )}
                </main>

            </div>

            {/* Inspector Panel - Moved outside overflow container */}
            <InspectorPanel
                isOpen={!!selectedImage}
                image={selectedImage}
                onClose={() => setSelectedImage(null)}
            />

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />
        </div>
    );
};

export default Library;
