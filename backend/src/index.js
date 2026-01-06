import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import imageRoutes from './routes/images.js';
import thumbnailRoutes from './routes/thumbnails.js';
import previewRoutes from './routes/previews.js'; // New import
import uploadRoutes from './routes/upload.js';

// Import middleware
import { rateLimiter } from './middleware/rateLimiter.js';
import { securityConfig } from './config/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet(securityConfig.helmet));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? false  // Serve frontend from same origin
        : 'http://localhost:4173',  // Vite dev server
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'flux-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
    },
}));

// Rate limiting
app.use('/api/', rateLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/thumbnails', thumbnailRoutes);
app.use('/api/previews', previewRoutes); // New route
app.use('/api/upload', uploadRoutes);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, '../public');
    app.use(express.static(publicPath));

    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Flux server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security headers enabled`);
    console.log(`⚡ Rate limiting active`);
});
