import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import { scanDirectory, importImage } from '../services/imageImporter.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all images
router.get('/', requireAuth, async (req, res) => {
    try {
        const {
            rating,
            colorLabel,
            limit = 100,
            offset = 0,
            sortBy = 'dateTaken',
            sortOrder = 'desc'
        } = req.query;

        const where = {
            userId: req.session.userId,
            deletedAt: null,
        };

        if (rating) {
            where.rating = { gte: parseFloat(rating) };
        }

        if (colorLabel) {
            where.colorLabel = colorLabel;
        }

        const images = await prisma.image.findMany({
            where,
            take: parseInt(limit),
            skip: parseInt(offset),
            orderBy: { [sortBy]: sortOrder },
            include: {
                albums: {
                    include: {
                        album: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        const total = await prisma.image.count({ where });

        res.json({
            images,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Get single image
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const image = await prisma.image.findFirst({
            where: {
                id: req.params.id,
                userId: req.session.userId,
                deletedAt: null,
            },
            include: {
                albums: {
                    include: {
                        album: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.json(image);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});

// Scan directory for images
router.post('/scan', requireAuth, uploadRateLimiter, async (req, res) => {
    try {
        const { path } = req.body;

        if (!path) {
            return res.status(400).json({ error: 'Path is required' });
        }

        // Start scanning (this will be a background job)
        const files = await scanDirectory(path);

        res.json({
            success: true,
            filesFound: files.length,
            message: 'Scan completed',
        });
    } catch (error) {
        console.error('Error scanning directory:', error);
        res.status(500).json({ error: error.message });
    }
});

// Import images from scan
router.post('/import', requireAuth, uploadRateLimiter, async (req, res) => {
    try {
        const { files } = req.body;

        if (!files || !Array.isArray(files)) {
            return res.status(400).json({ error: 'Files array is required' });
        }

        const imported = [];
        const errors = [];

        for (const filepath of files) {
            try {
                const image = await importImage(filepath, req.session.userId);
                imported.push(image);
            } catch (error) {
                errors.push({ filepath, error: error.message });
            }
        }

        res.json({
            success: true,
            imported: imported.length,
            errors: errors.length,
            details: { imported, errors },
        });
    } catch (error) {
        console.error('Error importing images:', error);
        res.status(500).json({ error: 'Import failed' });
    }
});

// Update image metadata
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        const { rating, colorLabel, isFavorite, isArchived } = req.body;

        const image = await prisma.image.findFirst({
            where: {
                id: req.params.id,
                userId: req.session.userId,
                deletedAt: null,
            },
        });

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const updated = await prisma.image.update({
            where: { id: req.params.id },
            data: {
                ...(rating !== undefined && { rating: parseFloat(rating) }),
                ...(colorLabel !== undefined && { colorLabel }),
                ...(isFavorite !== undefined && { isFavorite }),
                ...(isArchived !== undefined && { isArchived }),
            },
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ error: 'Failed to update image' });
    }
});

// Soft delete image
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const image = await prisma.image.findFirst({
            where: {
                id: req.params.id,
                userId: req.session.userId,
                deletedAt: null,
            },
        });

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        await prisma.image.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() },
        });

        res.json({ success: true, message: 'Image moved to trash' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

export default router;
