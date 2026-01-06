import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { requireAuth } from '../middleware/auth.js';
import { importImage } from '../services/imageImporter.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Keep original filename with timestamp to avoid collisions
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, `${basename}_${timestamp}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024, // MB to bytes
    },
    fileFilter: (req, file, cb) => {
        // Default allowed extensions if not set in .env
        const defaultExts = 'jpg,jpeg,png,gif,webp,bmp,heic,heif,tiff,tif,cr2,nef,arw,dng,orf,rw2,pef,pcx,psd,svg,mp4,mov,avi,mkv,webm,m4v,wmv,flv';
        const allowedExts = (process.env.ALLOWED_EXTENSIONS || defaultExts).split(',').map(e => e.trim().toLowerCase());
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

        if (allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`File type .${ext} not allowed. Supported: ${allowedExts.join(', ')}`));
        }
    }
});

// Upload multiple files from browser
router.post('/', requireAuth, upload.array('files', 1000), async (req, res) => {
    try {
        const files = req.files;
        const userId = req.session.userId;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const results = {
            imported: 0,
            skipped: 0,
            errors: [],
        };

        // Process each uploaded file
        for (const file of files) {
            try {
                await importImage(file.path, userId);
                results.imported++;
            } catch (error) {
                if (error.message === 'Image already imported') {
                    results.skipped++;
                } else {
                    results.errors.push({
                        file: file.originalname,
                        error: error.message,
                    });
                }
            }
        }

        res.json({
            success: true,
            imported: results.imported,
            skipped: results.skipped,
            total: files.length,
            errors: results.errors,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Failed to upload files',
            details: error.message,
        });
    }
});

export default router;
