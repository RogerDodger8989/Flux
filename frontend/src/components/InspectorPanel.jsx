import { useEffect } from 'react';
import useImageStore from '../store/imageStore';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

function InspectorPanel() {
    const { selectedImage, setSelectedImage, updateImageMetadata } = useImageStore();

    // Close on ESC key
    useKeyboardShortcuts({
        Escape: () => setSelectedImage(null),
    });

    // Close on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setSelectedImage(null);
        }
    };

    if (!selectedImage) return null;

    const handleRatingChange = async (rating) => {
        try {
            await updateImageMetadata(selectedImage.id, { rating });
        } catch (error) {
            console.error('Failed to update rating:', error);
        }
    };

    const handleColorLabelChange = async (colorLabel) => {
        try {
            await updateImageMetadata(selectedImage.id, { colorLabel });
        } catch (error) {
            console.error('Failed to update color label:', error);
        }
    };

    const handleFavoriteToggle = async () => {
        try {
            await updateImageMetadata(selectedImage.id, { isFavorite: !selectedImage.isFavorite });
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${mb.toFixed(2)} MB`;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exifData = selectedImage.exifData ? JSON.parse(selectedImage.exifData) : {};

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-md bg-primary h-full overflow-y-auto shadow-2xl animate-slide-left">
                {/* Header */}
                <div className="sticky top-0 bg-primary border-b border-default p-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-primary">Detaljer</h2>
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="p-2 hover:bg-secondary rounded-lg transition"
                    >
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Image Preview */}
                    <div className="relative aspect-square bg-secondary rounded-lg overflow-hidden">
                        <img
                            src={selectedImage.previewPath ? `/api/previews/${selectedImage.id}` : `/api/thumbnails/${selectedImage.id}`}
                            alt={selectedImage.filename}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleFavoriteToggle}
                            className={`flex-1 px-4 py-2 rounded-lg transition ${selectedImage.isFavorite
                                ? 'bg-red-500 text-white'
                                : 'bg-secondary text-primary hover:bg-tertiary'
                                }`}
                        >
                            <svg className="w-5 h-5 mx-auto" fill={selectedImage.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Image Metadata (Title, Description, Keywords, People) */}
                    {(selectedImage.title || selectedImage.description || selectedImage.keywords || selectedImage.people) && (
                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-3">Metadata</h3>
                            <div className="space-y-2 text-sm">
                                {selectedImage.title && (
                                    <div>
                                        <span className="text-tertiary block mb-1">Titel:</span>
                                        <span className="text-primary">{selectedImage.title}</span>
                                    </div>
                                )}
                                {selectedImage.description && (
                                    <div>
                                        <span className="text-tertiary block mb-1">Beskrivning:</span>
                                        <span className="text-primary whitespace-pre-wrap">{selectedImage.description}</span>
                                    </div>
                                )}
                                {selectedImage.keywords && (
                                    <div>
                                        <span className="text-tertiary block mb-1">Nyckelord:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedImage.keywords.split(',').map((keyword, i) => (
                                                <span key={i} className="px-2 py-1 bg-tertiary rounded text-xs text-primary">
                                                    {keyword.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedImage.people && (
                                    <div>
                                        <span className="text-tertiary block mb-1">Personer:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedImage.people.split(',').map((person, i) => (
                                                <span key={i} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-primary">
                                                    {person.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedImage.copyright && (
                                    <div>
                                        <span className="text-tertiary block mb-1">Copyright:</span>
                                        <span className="text-primary text-xs">{selectedImage.copyright}</span>
                                    </div>
                                )}
                                {selectedImage.creator && (
                                    <div>
                                        <span className="text-tertiary block mb-1">Fotograf:</span>
                                        <span className="text-primary">{selectedImage.creator}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-primary mb-2">Betyg</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRatingChange(star)}
                                    className="p-1 hover:scale-110 transition"
                                >
                                    <svg
                                        className={`w-8 h-8 ${star <= (selectedImage.rating || 0) ? 'text-yellow-400' : 'text-gray-400'
                                            }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Label */}
                    <div>
                        <label className="block text-sm font-medium text-primary mb-2">Färgetikett</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'red', color: 'bg-red-500' },
                                { value: 'yellow', color: 'bg-yellow-500' },
                                { value: 'green', color: 'bg-green-500' },
                                { value: 'blue', color: 'bg-blue-500' },
                            ].map((label) => (
                                <button
                                    key={label.value}
                                    onClick={() => handleColorLabelChange(selectedImage.colorLabel === label.value ? null : label.value)}
                                    className={`w-10 h-10 rounded-full ${label.color} hover:scale-110 transition ${selectedImage.colorLabel === label.value ? 'ring-4 ring-primary-500' : 'opacity-50'
                                        }`}
                                />
                            ))}
                            <button
                                onClick={() => handleColorLabelChange(null)}
                                className={`w-10 h-10 rounded-full border-2 border-default hover:bg-secondary transition ${!selectedImage.colorLabel ? 'bg-secondary' : ''
                                    }`}
                                title="Ingen färg"
                            >
                                <svg className="w-6 h-6 mx-auto text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* File Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary mb-3">Filinformation</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-tertiary">Filnamn:</span>
                                <span className="text-primary font-medium">{selectedImage.filename}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-tertiary">Storlek:</span>
                                <span className="text-primary">{formatFileSize(selectedImage.fileSize)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-tertiary">Dimensioner:</span>
                                <span className="text-primary">{selectedImage.width} × {selectedImage.height}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-tertiary">Format:</span>
                                <span className="text-primary uppercase">{selectedImage.mimeType?.split('/')[1] || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-tertiary">Importerad:</span>
                                <span className="text-primary">{formatDate(selectedImage.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* EXIF Data */}
                    {(selectedImage.cameraModel || selectedImage.dateTaken || selectedImage.exifData) && (
                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-3">EXIF-data</h3>
                            <div className="space-y-2 text-sm">
                                {selectedImage.dateTaken && (
                                    <div className="flex justify-between">
                                        <span className="text-tertiary">Fotodatum:</span>
                                        <span className="text-primary">{formatDate(selectedImage.dateTaken)}</span>
                                    </div>
                                )}
                                {selectedImage.cameraModel && (
                                    <div className="flex justify-between">
                                        <span className="text-tertiary">Kamera:</span>
                                        <span className="text-primary">{selectedImage.cameraModel}</span>
                                    </div>
                                )}
                                {selectedImage.lensModel && (
                                    <div className="flex justify-between">
                                        <span className="text-tertiary">Objektiv:</span>
                                        <span className="text-primary">{selectedImage.lensModel}</span>
                                    </div>
                                )}
                                {selectedImage.focalLength && (
                                    <div className="flex justify-between">
                                        <span className="text-tertiary">Brännvidd:</span>
                                        <span className="text-primary">{selectedImage.focalLength}mm</span>
                                    </div>
                                )}
                                {selectedImage.aperture && (
                                    <div className="flex justify-between">
                                        <span className="text-tertiary">Bländare:</span>
                                        <span className="text-primary">f/{selectedImage.aperture}</span>
                                    </div>
                                )}
                                {selectedImage.shutterSpeed && (
                                    <div className="flex justify-between">
                                        <span className="text-tertiary">Slutartid:</span>
                                        <span className="text-primary">{selectedImage.shutterSpeed}s</span>
                                    </div>
                                )}
                                {selectedImage.iso && (
                                    <div className="flex justify-between">
                                        <span className="text-tertiary">ISO:</span>
                                        <span className="text-primary">{selectedImage.iso}</span>
                                    </div>
                                )}
                                {(selectedImage.latitude && selectedImage.longitude) && (
                                    <div className="flex justify-between">
                                        <span className="text-tertiary">GPS:</span>
                                        <span className="text-primary text-xs">
                                            {selectedImage.latitude.toFixed(6)}, {selectedImage.longitude.toFixed(6)}
                                        </span>
                                    </div>
                                )}

                                {/* Additional EXIF from exifData JSON */}
                                {exifData && Object.keys(exifData).length > 0 && (
                                    <>
                                        {exifData.Software && (
                                            <div className="flex justify-between">
                                                <span className="text-tertiary">Program:</span>
                                                <span className="text-primary text-xs">{exifData.Software}</span>
                                            </div>
                                        )}
                                        {exifData.Copyright && (
                                            <div className="flex justify-between">
                                                <span className="text-tertiary">Copyright:</span>
                                                <span className="text-primary text-xs">{exifData.Copyright}</span>
                                            </div>
                                        )}
                                        {exifData.Artist && (
                                            <div className="flex justify-between">
                                                <span className="text-tertiary">Fotograf:</span>
                                                <span className="text-primary">{exifData.Artist}</span>
                                            </div>
                                        )}
                                        {exifData.Make && !selectedImage.cameraModel && (
                                            <div className="flex justify-between">
                                                <span className="text-tertiary">Tillverkare:</span>
                                                <span className="text-primary">{exifData.Make}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InspectorPanel;
