import express from 'express';
import searchService from '../services/searchService.js';

const router = express.Router();

// GET /api/search?q=query&limit=100&offset=0
router.get('/', async (req, res) => {
    try {
        const { q, limit, offset } = req.query;
        const result = await searchService.search(
            q || '',
            parseInt(limit) || 100,
            parseInt(offset) || 0
        );
        res.json(result);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// GET /api/search/facets?q=query
router.get('/facets', async (req, res) => {
    try {
        const { q } = req.query;
        const facets = await searchService.getFacets(q || '');
        res.json(facets);
    } catch (error) {
        console.error('Facets error:', error);
        res.status(500).json({ error: 'Failed to build facets' });
    }
});

export default router;
