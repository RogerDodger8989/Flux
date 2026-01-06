import React, { useRef, useEffect } from 'react';
import { Heart } from 'lucide-react';

const ImageGrid = ({ image, onClick, isSelected }) => {
    const {
        thumbnailPath,
        filename,
        rating,
        colorLabel,
        isFavorite,
        fileType
    } = image;

    // Use backend thumbnail URL
    const thumbnailUrl = thumbnailPath
        ? `/api/thumbnails/${image.id}`
        : null;

    return (
        <div
            onClick={onClick}
            className={`
                group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200
                ${isSelected
                    ? 'border-accent-500 shadow-lg scale-[1.02] z-10'
                    : 'border-transparent hover:border-gray-600 bg-card-bg'
                }
            `}
        >
            {thumbnailUrl ? (
                <img
                    src={thumbnailUrl}
                    alt={filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs">
                    {fileType}
                </div>
            )}

            {/* Overlay Info - Always visible now */}
            <div className={`
                absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent 
                transition-opacity duration-200 opacity-100
            `}>
                <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                    <div>
                        {/* Rating if > 0 */}
                        {rating > 0 && (
                            <div className="flex text-yellow-500 mb-1">
                                {[...Array(rating)].map((_, i) => (
                                    <span key={i} className="text-xs">★</span>
                                ))}
                            </div>
                        )}

                        {/* Filename truncated */}
                        <p className="text-white text-xs truncate max-w-[120px] drop-shadow-md">
                            {filename}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1">
                        {/* Favorite Icon */}
                        {isFavorite && (
                            <Heart className="w-4 h-4 text-red-500 fill-current drop-shadow-md" />
                        )}

                        {/* Color Label Dot */}
                        {colorLabel && (
                            <div className={`w-3 h-3 rounded-full border border-white/20 shadow-sm ${colorLabel === 'red' ? 'bg-red-500' :
                                colorLabel === 'yellow' ? 'bg-yellow-500' :
                                    colorLabel === 'green' ? 'bg-green-500' :
                                        colorLabel === 'blue' ? 'bg-blue-500' :
                                            colorLabel === 'purple' ? 'bg-purple-500' : ''
                                }`} />
                        )}
                    </div>
                </div>
            </div>

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-accent-500 rounded-full border border-white shadow-sm" />
            )}
        </div>
    );
};

export default ImageGrid;
