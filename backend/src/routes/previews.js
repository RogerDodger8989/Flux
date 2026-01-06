import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Serve preview images
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const previewPath = path.join(process.cwd(), 'previews', `${id}_preview.jpg`);

        // Check if preview exists
        if (!fs.existsSync(previewPath)) {
            // Fallback to thumbnail if preview missing
            const thumbnailPath = path.join(process.cwd(), 'thumbnails', `${id}_thumb.jpg`);
            if (fs.existsSync(thumbnailPath)) {
                return res.sendFile(thumbnailPath);
            }
            return res.status(404).json({ error: 'Preview not found' });
        }

        res.sendFile(previewPath);
    } catch (error) {
        console.error('Error serving preview:', error);
        res.status(500).json({ error: 'Failed to serve preview' });
    }
});

export default router;
