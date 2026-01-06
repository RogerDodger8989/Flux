import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class SearchService {
    /**
     * Parse a raw search query string into a Prisma 'where' object
     * Supports syntax:
     * - keyword (title, description, keywords, filename)
     * - rating:5 or rating:>=4
     * - year:1986
     * - iso:400
     * - camera:"Canon"
     */
    parseQuery(queryString) {
        if (!queryString) return {};

        const where = { AND: [] };
        const tokens = queryString.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

        tokens.forEach(token => {
            // Handle key:value pairs
            if (token.includes(':')) {
                const parts = token.split(/:(.+)/);
                const key = parts[0];
                const rawValue = parts[1];

                if (!rawValue) return; // Skip invalid tokens

                const value = rawValue.replace(/"/g, ''); // Remove quotes

                switch (key.toLowerCase()) {
                    case 'rating':
                        this._handleRating(where, value);
                        break;
                    case 'year':
                        this._handleDate(where, value, 'year');
                        break;
                    case 'iso':
                        where.AND.push({ iso: parseInt(value) });
                        break;
                    case 'camera':
                    case 'model':
                        where.AND.push({ cameraModel: { contains: value } });
                        break;
                    case 'lens':
                        where.AND.push({ lensModel: { contains: value } });
                        break;
                    case 'person':
                    case 'people':
                        where.AND.push({ people: { contains: value } });
                        break;
                    case 'keyword':
                    case 'tag':
                        where.AND.push({ keywords: { contains: value } });
                        break;
                    case 'make':
                        where.AND.push({ exifData: { contains: `"Make":"${value}"` } }); // Poor man's JSON search
                        break;
                }
            } else {
                // Free text search across multiple fields
                const cleanToken = token.replace(/"/g, '');

                // Log what we are building
                console.log(`Building free text query for token: "${cleanToken}"`);

                where.AND.push({
                    OR: [
                        { filename: { contains: cleanToken } },
                        { title: { contains: cleanToken } },
                        { description: { contains: cleanToken } },
                        { keywords: { contains: cleanToken } },
                        { people: { contains: cleanToken } }
                    ]
                });
            }
        });

        console.log('Final Prisma WHERE clause:', JSON.stringify(where, null, 2));
        return where;
    }

    _handleRating(where, value) {
        if (value.startsWith('>=')) {
            where.AND.push({ rating: { gte: parseInt(value.substring(2)) } });
        } else if (value.startsWith('<=')) {
            where.AND.push({ rating: { lte: parseInt(value.substring(2)) } });
        } else if (value.startsWith('>')) {
            where.AND.push({ rating: { gt: parseInt(value.substring(1)) } });
        } else if (value.startsWith('<')) {
            where.AND.push({ rating: { lt: parseInt(value.substring(1)) } });
        } else {
            where.AND.push({ rating: parseInt(value) });
        }
    }

    _handleDate(where, value, type) {
        if (type === 'year') {
            const year = parseInt(value);
            const start = new Date(`${year}-01-01T00:00:00.000Z`);
            const end = new Date(`${year}-12-31T23:59:59.999Z`);
            where.AND.push({
                dateTaken: { gte: start, lte: end }
            });
        }
    }

    async search(query, limit = 100, offset = 0) {
        const where = this.parseQuery(query);

        const images = await prisma.image.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { dateTaken: 'desc' },
            include: {
                // Future: include albums?
            }
        });

        const total = await prisma.image.count({ where });

        return { images, total };
    }

    /**
     * Aggregate metadata for facets based on current search result
     */
    async getFacets(query) {
        const where = this.parseQuery(query);

        // Run aggregations in parallel
        const [cameras, rawImages] = await Promise.all([
            // Camera Models
            prisma.image.groupBy({
                by: ['cameraModel'],
                where,
                _count: { _all: true },
                having: { cameraModel: { not: null } },
                orderBy: { _count: { cameraModel: 'desc' } },
                take: 10
            }),

            // Fetch raw data for JS-based aggregation (Years, Keywords, People)
            prisma.image.findMany({
                where,
                select: { keywords: true, people: true, dateTaken: true },
                take: 1000 // Limit for performance
            })
        ]);

        // Process Keywords & People (Client-side aggregation of comma-separated strings)
        const keywordCounts = {};
        const peopleCounts = {};
        const yearCounts = {};

        // Helper to process arrays
        const process = (str, targetObj) => {
            if (!str) return;
            const items = str.split(',').map(s => s.trim());
            items.forEach(item => {
                if (item) targetObj[item] = (targetObj[item] || 0) + 1;
            });
        };

        // Process raw data
        rawImages.forEach(img => {
            process(img.keywords, keywordCounts);
            process(img.people, peopleCounts);
            if (img.dateTaken) {
                const y = new Date(img.dateTaken).getFullYear();
                yearCounts[y] = (yearCounts[y] || 0) + 1;
            }
        });

        // Convert to array and sort
        const toSortedArray = (obj) => Object.entries(obj)
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            cameraModel: cameras.map(c => ({ value: c.cameraModel, count: c._count._all })),
            keywords: toSortedArray(keywordCounts),
            people: toSortedArray(peopleCounts),
            years: Object.entries(yearCounts).map(([value, count]) => ({ value: parseInt(value), count })).sort((a, b) => b.value - a.value)
        };
    }
}

export default new SearchService();
