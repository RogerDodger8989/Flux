// Authentication middleware to protect routes
export const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }

    res.status(401).json({ error: 'Authentication required' });
};

// Middleware to attach user to request
export const attachUser = (req, res, next) => {
    if (req.session && req.session.userId) {
        req.userId = req.session.userId;
    }
    next();
};
