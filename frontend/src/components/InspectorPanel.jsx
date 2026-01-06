import React from 'react';
import useImageStore from '../store/imageStore';
import { X, Heart, Star, Calendar, Camera, Aperture, MapPin, Tag, User, Layers, Info } from 'lucide-react';

const InspectorPanel = ({ isOpen, image, onClose }) => {
    const { updateImageMetadata } = useImageStore();

    if (!isOpen || !image) return null;

    const {
        filename,
        width,
        height,
        fileSize,
        mimeType,
        dateTaken,
        cameraModel,
        lensModel,
        focalLength,
        aperture,
        shutterSpeed,
        iso,
        rating,
        colorLabel,
        isFavorite,
        latitude,
        longitude,
        title,
        description,
        keywords,
        people,
        copyright,
        creator
    } = image;

    // Helper to format file size
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        return new Date(dateString).toLocaleString('sv-SE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleRating = (newRating) => {
        updateImageMetadata(image.id, { rating: newRating });
    };

    const handleColorLabel = (color) => {
        // Toggle off if same color
        const newColor = colorLabel === color ? null : color;
        updateImageMetadata(image.id, { colorLabel: newColor });
    };

    const toggleFavorite = () => {
        updateImageMetadata(image.id, { isFavorite: !isFavorite });
    };

    // Use full preview path if available, else thumbnail
    const previewUrl = image.previewPath
        ? `/api/previews/${image.id}`
        : `/api/thumbnails/${image.id}`;

    return (
        <div
            className={`
                fixed top-[60px] right-0 bottom-0 w-80 bg-[var(--bg-secondary)] border-l border-[var(--border-color)] shadow-xl z-50
                transform transition-transform duration-300 ease-in-out overflow-y-auto
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] sticky top-0 z-10">
                <h2 className="font-semibold text-text-primary">Detaljer</h2>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Preview Image */}
            <div className="aspect-video bg-black flex items-center justify-center overflow-hidden">
                <img
                    src={previewUrl}
                    alt={filename}
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            {/* Actions */}
            <div className="p-4 grid grid-cols-1 gap-4 border-b border-sidebar-border">
                {/* Favorite */}
                <button
                    onClick={toggleFavorite}
                    className={`w-full py-2 rounded-md flex items-center justify-center gap-2 transition-colors ${isFavorite
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    <span>{isFavorite ? 'Favoritmarkerad' : 'Markera som favorit'}</span>
                </button>

                {/* Rating */}
                <div>
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Betyg</h3>
                    <div className="flex items-center justify-between px-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleRating(star)}
                                className={`p-1 transition-transform hover:scale-110 focus:outline-none ${star <= rating ? 'text-yellow-500' : 'text-gray-600 hover:text-gray-400'
                                    }`}
                            >
                                <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color Labels */}
                <div>
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Färgetikett</h3>
                    <div className="flex items-center gap-3">
                        {['red', 'yellow', 'green', 'blue', 'purple'].map((color) => (
                            <button
                                key={color}
                                onClick={() => handleColorLabel(color)}
                                className={`
                                    w-6 h-6 rounded-full border-2 transition-all
                                    ${color === 'red' ? 'bg-red-500' :
                                        color === 'yellow' ? 'bg-yellow-500' :
                                            color === 'green' ? 'bg-green-500' :
                                                color === 'blue' ? 'bg-blue-500' :
                                                    color === 'purple' ? 'bg-purple-500' : ''}
                                    ${colorLabel === color
                                        ? 'border-white scale-110 shadow-md ring-2 ring-white/20'
                                        : 'border-transparent hover:border-white/50 scale-100'}
                                `}
                                title={color}
                            />
                        ))}
                        <button
                            onClick={() => handleColorLabel(null)}
                            className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:border-gray-400 ml-auto"
                            title="Rensa etikett"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Metadata Sections */}
            <div className="divide-y divide-sidebar-border">
                {/* IPTC / Description */}
                {(title || description || copyright || creator) && (
                    <div className="p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-accent-500 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Beskrivning
                        </h3>

                        {title && (
                            <div>
                                <label className="text-xs text-text-secondary block">Titel</label>
                                <p className="text-sm text-text-primary">{title}</p>
                            </div>
                        )}

                        {description && (
                            <div>
                                <label className="text-xs text-text-secondary block">Beskrivning</label>
                                <p className="text-sm text-text-primary leading-relaxed">{description}</p>
                            </div>
                        )}

                        {copyright && (
                            <div>
                                <label className="text-xs text-text-secondary block">Copyright</label>
                                <p className="text-xs text-gray-400">© {copyright}</p>
                            </div>
                        )}
                        {creator && (
                            <div>
                                <label className="text-xs text-text-secondary block">Skapare</label>
                                <p className="text-xs text-gray-400">{creator}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Keywords & People */}
                {(keywords || people) && (
                    <div className="p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-accent-500 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Taggar
                        </h3>

                        {people && (
                            <div className="flex flex-wrap gap-1.5">
                                {people.split(',').map((p, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                        <User className="w-3 h-3 mr-1" />
                                        {p.trim()}
                                    </span>
                                ))}
                            </div>
                        )}

                        {keywords && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {keywords.split(',').map((k, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-gray-300 border border-white/10">
                                        {k.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {/* File Info */}
                <div className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-accent-500 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Filinformation
                    </h3>

                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <span className="text-text-secondary">Filnamn:</span>
                        <span className="text-text-primary truncate" title={filename}>{filename}</span>

                        <span className="text-text-secondary">Storlek:</span>
                        <span className="text-text-primary">{formatBytes(fileSize)}</span>

                        <span className="text-text-secondary">Dimensioner:</span>
                        <span className="text-text-primary">{width} × {height}</span>

                        <span className="text-text-secondary">Format:</span>
                        <span className="uppercase text-text-primary">{mimeType?.split('/')[1] || 'Unknown'}</span>

                        <span className="text-text-secondary">Importerad:</span>
                        <span className="text-text-primary text-xs">{new Date().toLocaleString()}</span>
                    </div>
                </div>

                {/* EXIF Data */}
                <div className="p-4 space-y-3 pb-8">
                    <h3 className="text-sm font-semibold text-accent-500 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        EXIF-data
                    </h3>

                    <div className="space-y-2 text-sm">
                        {dateTaken && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                                <span className="text-text-primary">{formatDate(dateTaken)}</span>
                            </div>
                        )}

                        {(cameraModel || lensModel) && (
                            <div className="bg-sheet-bg p-2 rounded border border-sheet-border">
                                {cameraModel && <p className="font-medium text-text-primary">{cameraModel}</p>}
                                {lensModel && <p className="text-xs text-text-secondary mt-0.5">{lensModel}</p>}
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-2">
                            {/* Initierar data för visning även om null för layoutens skull, eller dölj? Vi kör conditional för snygghet */}
                            {focalLength && (
                                <div className="flex flex-col items-center bg-white/5 p-1.5 rounded">
                                    <span className="text-xs text-text-secondary">Brännvidd</span>
                                    <span className="font-medium">{focalLength}mm</span>
                                </div>
                            )}
                            {aperture && (
                                <div className="flex flex-col items-center bg-white/5 p-1.5 rounded">
                                    <Aperture className="w-3 h-3 text-text-secondary mb-1" />
                                    <span className="font-medium">ƒ/{aperture}</span>
                                </div>
                            )}
                            {iso && (
                                <div className="flex flex-col items-center bg-white/5 p-1.5 rounded">
                                    <span className="text-xs text-text-secondary">ISO</span>
                                    <span className="font-medium">{iso}</span>
                                </div>
                            )}
                            {shutterSpeed && (
                                <div className="flex flex-col items-center bg-white/5 p-1.5 rounded col-span-3">
                                    <span className="text-xs text-text-secondary">Slutartid</span>
                                    <span className="font-medium">{shutterSpeed}s</span>
                                </div>
                            )}
                        </div>

                        {(latitude && longitude) && (
                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-white/5">
                                <MapPin className="w-3.5 h-3.5 text-text-secondary mt-0.5" />
                                <div>
                                    <p className="text-xs text-text-secondary">GPS Koordinater</p>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent-400 hover:text-accent-300 hover:underline"
                                    >
                                        {latitude.toFixed(6)}, {longitude.toFixed(6)}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InspectorPanel;
