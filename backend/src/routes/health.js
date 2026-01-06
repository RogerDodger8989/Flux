import express from 'express';
import os from 'os';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;

        // Get system stats
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        const cpuUsage = os.loadavg()[0]; // 1-minute load average

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            system: {
                platform: os.platform(),
                arch: os.arch(),
                nodeVersion: process.version,
            },
            memory: {
                total: totalMem,
                used: usedMem,
                free: freeMem,
                usagePercent: ((usedMem / totalMem) * 100).toFixed(2),
            },
            cpu: {
                loadAverage: cpuUsage,
                cores: os.cpus().length,
            },
            database: {
                connected: true,
            },
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
        });
    }
});

export default router;
