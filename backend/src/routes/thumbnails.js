import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Serve thumbnail images
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const thumbnailPath = path.join(process.cwd(), 'thumbnails', `${id}_thumb.jpg`);

        // Check if thumbnail exists
        if (!fs.existsSync(thumbnailPath)) {
            return res.status(404).json({ error: 'Thumbnail not found' });
        }

        res.sendFile(thumbnailPath);
    } catch (error) {
        console.error('Error serving thumbnail:', error);
        res.status(500).json({ error: 'Failed to serve thumbnail' });
    }
});

export default router;
