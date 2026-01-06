import { useState, useEffect } from 'react';
import useImageStore from '../store/imageStore';
import useViewStore from '../store/viewStore';
import ImportModal from '../components/ImportModal';
import ViewControls from '../components/ViewControls';

function Library() {
    const [showImportModal, setShowImportModal] = useState(false);
    const { images, loading, fetchImages } = useImageStore();
    const { gridSize } = useViewStore();

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const colorLabelColors = {
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
        green: 'bg-green-500',
        blue: 'bg-blue-500',
    };

    const gridSizeClasses = {
        small: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12',
        medium: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
        large: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
        xlarge: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2">Bibliotek</h1>
                    <p className="text-secondary">
                        {loading ? 'Laddar...' : `${images.length} bilder`}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <ViewControls />
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition duration-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Importera bilder
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-secondary">Laddar bilder...</p>
                    </div>
                </div>
            ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Inga bilder ännu</h3>
                    <p className="text-secondary mb-6">Börja med att importera dina foton</p>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition duration-200"
                    >
                        Importera bilder
                    </button>
                </div>
            ) : (
                <div className={`grid ${gridSizeClasses[gridSize]} gap-4`}>
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className="group relative aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-500 transition"
                        >
                            {/* Thumbnail */}
                            <img
                                src={image.thumbnailPath ? `/api/thumbnails/${image.id}` : '/placeholder-image.svg'}
                                alt={image.filename}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex items-start justify-between">
                                    {/* Rating */}
                                    {image.rating > 0 && (
                                        <div className="flex items-center gap-0.5 text-yellow-400">
                                            {Array.from({ length: Math.floor(image.rating) }).map((_, i) => (
                                                <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    )}

                                    {/* Color label */}
                                    {image.colorLabel && (
                                        <div className={`w-3 h-3 rounded-full ${colorLabelColors[image.colorLabel]}`}></div>
                                    )}
                                </div>

                                {/* Filename */}
                                <p className="text-white text-xs truncate">{image.filename}</p>
                            </div>

                            {/* Favorite badge */}
                            {image.isFavorite && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Import Modal */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
            />
        </div>
    );
}

export default Library;
