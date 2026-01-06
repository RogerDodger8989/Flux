import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import exifParser from 'exif-parser';
import { fileTypeFromBuffer } from 'file-type';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPPORTED_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.heic', '.heif', '.tiff', '.tif',
    '.cr2', '.nef', '.arw', '.dng', '.orf' // RAW formats
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
 * Extract EXIF data from image
 */
async function extractExif(filepath) {
    try {
        const buffer = await fs.readFile(filepath);
        const parser = exifParser.create(buffer);
        const result = parser.parse();

        const exif = {
            dateTaken: result.tags.DateTimeOriginal
                ? new Date(result.tags.DateTimeOriginal * 1000)
                : null,
            cameraModel: result.tags.Model || null,
            lensModel: result.tags.LensModel || null,
            focalLength: result.tags.FocalLength || null,
            aperture: result.tags.FNumber || null,
            shutterSpeed: result.tags.ExposureTime ? `1/${Math.round(1 / result.tags.ExposureTime)}` : null,
            iso: result.tags.ISO || null,
            latitude: result.tags.GPSLatitude || null,
            longitude: result.tags.GPSLongitude || null,
        };

        return exif;
    } catch (error) {
        console.error('Error extracting EXIF:', error.message);
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
        const buffer = await fs.readFile(filepath);
        const fileType = await fileTypeFromBuffer(buffer);
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
                exifData: JSON.stringify(exif),
                dateTaken: exif.dateTaken,
                cameraModel: exif.cameraModel,
                lensModel: exif.lensModel,
                focalLength: exif.focalLength,
                aperture: exif.aperture,
                shutterSpeed: exif.shutterSpeed,
                iso: exif.iso,
                latitude: exif.latitude,
                longitude: exif.longitude,
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
