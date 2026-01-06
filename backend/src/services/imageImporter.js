import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { fileTypeFromFile } from 'file-type';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SUPPORTED_EXTENSIONS = [
    // Common image formats
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
    '.heic', '.heif', '.tiff', '.tif',
    // RAW formats
    '.cr2', '.nef', '.arw', '.dng', '.orf', '.rw2', '.pef',
    // Other image formats
    '.pcx', '.psd', '.svg',
    // Video formats (Phase 6)
    '.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv', '.flv'
];

const THUMBNAIL_SIZE = parseInt(process.env.THUMBNAIL_SIZE) || 300;
const PREVIEW_SIZE = parseInt(process.env.PREVIEW_SIZE) || 1920;
const JPEG_QUALITY = parseInt(process.env.JPEG_QUALITY) || 85;

/**
 * Scan a directory for image files
 */
export async function scanDirectory(dirPath) {
    const files = [];

    async function scan(dir) {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    await scan(fullPath);
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (SUPPORTED_EXTENSIONS.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.error(`Error scanning ${dir}:`, error.message);
        }
    }

    await scan(dirPath);
    return files;
}

/**
 * Calculate file hash for bit-rot detection
 */
async function calculateFileHash(filepath) {
    const buffer = await fs.readFile(filepath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Extract EXIF, IPTC, and XMP data from image using exiftool
 */
import { execFile } from 'child_process';
import util from 'util';

const execFilePromise = util.promisify(execFile);
const EXIFTOOL_PATH = 'C:\\Program Files\\exiftool\\exiftool.exe';

/**
 * Extract EXIF, IPTC, and XMP data from image using native exiftool
 */
async function extractExif(filepath) {
    try {
        console.log('📸 Extracting metadata for:', filepath);

        // Execute exiftool directly
        // -j: JSON output
        // -g: Group by tag family (EXIF, IPTC, XMP)
        // -struct: Preserve structures
        const { stdout } = await execFilePromise(EXIFTOOL_PATH, ['-j', '-g', '-struct', filepath]);

        const data = JSON.parse(stdout)[0];
        if (!data) return {};

        // Flatten groups for easier access, prioritizing XMP then IPTC then EXIF
        const tags = {
            ...data.EXIF,
            ...data.IPTC,
            ...data.XMP,
            ...data.File,
            ...data.Composite
        };

        // Helper to get value from multiple possible keys
        const get = (...keys) => {
            for (const key of keys) {
                // Check flat tags
                if (tags[key] !== undefined) return tags[key];

                // Check specific groups
                if (data.XMP && data.XMP[key]) return data.XMP[key];
                if (data.IPTC && data.IPTC[key]) return data.IPTC[key];
                if (data.EXIF && data.EXIF[key]) return data.EXIF[key];
            }
            return null;
        };

        // Parse Date
        const parseDate = (dateStr) => {
            if (!dateStr) return null;
            // ExifTool standard format: YYYY:MM:DD HH:MM:SS
            // Try to parse standard JS date or Exif format
            try {
                // If it matches YYYY:MM:DD, replace colons with dashes for standard ISO parsing
                if (typeof dateStr === 'string' && /^\d{4}:\d{2}:\d{2}/.test(dateStr)) {
                    const isoStr = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
                    return new Date(isoStr);
                }
                return new Date(dateStr);
            } catch {
                return null;
            }
        };

        // Parse GPS Coordinates (DMS to Decimal)
        const parseGPS = (gpsStr, ref) => {
            if (!gpsStr) return null;
            if (typeof gpsStr === 'number') return gpsStr;

            // Format: "56 deg 13' 28.00" N"
            try {
                const parts = gpsStr.match(/(\d+)\s*deg\s*(\d+)'\s*([\d.]+)"\s*([NSEW])?/i);
                if (parts) {
                    let val = parseFloat(parts[1]) + parseFloat(parts[2]) / 60 + parseFloat(parts[3]) / 3600;
                    const hemisphere = parts[4] || ref;
                    if (hemisphere && (hemisphere.toUpperCase() === 'S' || hemisphere.toUpperCase() === 'W')) {
                        val = -val;
                    }
                    return val;
                }
                return parseFloat(gpsStr);
            } catch (e) {
                console.warn('Failed to parse GPS:', gpsStr, e);
                return null;
            }
        };

        const exif = {
            // Camera & Basic EXIF
            dateTaken: parseDate(get('DateTimeOriginal', 'CreateDate', 'ModifyDate')),
            cameraModel: get('Model'),
            lensModel: get('LensModel', 'LensID', 'Lens'),
            focalLength: get('FocalLength'),
            aperture: get('FNumber', 'ApertureValue', 'Aperture'),
            shutterSpeed: data.Composite?.ShutterSpeed ? data.Composite.ShutterSpeed.toString() : (get('ExposureTime') ? `1/${Math.round(1 / get('ExposureTime'))}` : null),
            iso: get('ISO'),

            // GPS
            latitude: parseGPS(get('GPSLatitude'), get('GPSLatitudeRef')),
            longitude: parseGPS(get('GPSLongitude'), get('GPSLongitudeRef')),

            // IPTC & XMP metadata (Lightroom tags)
            title: get('Title', 'Headline', 'ObjectName'),
            description: get('Description', 'Caption', 'Caption-Abstract'),
            keywords: get('Keywords', 'Subject'),
            people: get('PersonInImage', 'RegionName'),
            copyright: get('Copyright', 'Rights'),
            creator: get('Creator', 'Artist', 'By-line'),
            software: get('Software', 'CreatorTool'),
            rating: get('Rating'),

            // Store complete raw data
            allTags: data
        };

        console.log('✅ Metadata extracted:', {
            hasTitle: !!exif.title,
            hasKeywords: !!exif.keywords,
            people: exif.people
        });

        return exif;
    } catch (error) {
        console.error('❌ Error extracting EXIF:', error.message);
        // Fallback: don't crash the import, just return empty
        return {};
    }
}

/**
 * Generate thumbnail and preview images
 */
async function generateThumbnails(filepath, imageId) {
    const thumbnailDir = path.join(process.cwd(), 'thumbnails');
    const previewDir = path.join(process.cwd(), 'previews');

    await fs.mkdir(thumbnailDir, { recursive: true });
    await fs.mkdir(previewDir, { recursive: true });

    const ext = '.jpg';
    const thumbnailPath = path.join(thumbnailDir, `${imageId}_thumb${ext}`);
    const previewPath = path.join(previewDir, `${imageId}_preview${ext}`);

    try {
        // Generate thumbnail
        await sharp(filepath)
            .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
                fit: 'cover',
                position: 'center',
            })
            .jpeg({ quality: JPEG_QUALITY })
            .toFile(thumbnailPath);

        // Generate preview
        await sharp(filepath)
            .resize(PREVIEW_SIZE, PREVIEW_SIZE, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality: JPEG_QUALITY })
            .toFile(previewPath);

        return { thumbnailPath, previewPath };
    } catch (error) {
        console.error('Error generating thumbnails:', error.message);
        return { thumbnailPath: null, previewPath: null };
    }
}

/**
 * Get image metadata (dimensions, file type)
 */
async function getImageMetadata(filepath) {
    try {
        const metadata = await sharp(filepath).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
        };
    } catch (error) {
        console.error('Error reading image metadata:', error.message);
        return { width: null, height: null, format: null };
    }
}

/**
 * Import a single image into the database
 */
export async function importImage(filepath, userId) {
    try {
        // Check if file exists
        const stats = await fs.stat(filepath);

        // Calculate file hash
        const fileHash = await calculateFileHash(filepath);

        // Check if already imported
        const existing = await prisma.image.findUnique({
            where: { fileHash },
        });

        if (existing) {
            throw new Error('Image already imported');
        }

        // Get file type
        const fileType = await fileTypeFromFile(filepath);
        const mimeType = fileType?.mime || 'application/octet-stream';

        // Get image metadata
        const { width, height } = await getImageMetadata(filepath);

        // Extract EXIF
        const exif = await extractExif(filepath);

        // Create database record
        const image = await prisma.image.create({
            data: {
                filename: path.basename(filepath),
                filepath,
                fileHash,
                fileSize: stats.size,
                mimeType,
                width,
                height,
                userId,

                // EXIF data
                dateTaken: exif.dateTaken,
                cameraModel: exif.cameraModel,
                lensModel: exif.lensModel,
                focalLength: exif.focalLength,
                aperture: exif.aperture,
                shutterSpeed: exif.shutterSpeed,
                iso: exif.iso,
                latitude: exif.latitude,
                longitude: exif.longitude,

                // IPTC & XMP metadata (Lightroom)
                title: exif.title,
                description: exif.description,
                keywords: Array.isArray(exif.keywords) ? exif.keywords.join(', ') : exif.keywords,
                people: Array.isArray(exif.people) ? exif.people.join(', ') : exif.people,
                copyright: exif.copyright,
                creator: exif.creator,

                // Store complete metadata as JSON
                exifData: JSON.stringify(exif.allTags || {}),
            },
        });

        // Generate thumbnails in background
        generateThumbnails(filepath, image.id)
            .then(async ({ thumbnailPath, previewPath }) => {
                await prisma.image.update({
                    where: { id: image.id },
                    data: { thumbnailPath, previewPath },
                });
            })
            .catch(error => console.error('Error updating thumbnails:', error));

        return image;
    } catch (error) {
        console.error(`Error importing ${filepath}:`, error.message);
        throw error;
    }
}
