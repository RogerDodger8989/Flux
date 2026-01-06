export const securityConfig = {
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],  // Allow inline scripts for React
                styleSrc: ["'self'", "'unsafe-inline'"],   // Allow inline styles
                imgSrc: ["'self'", 'data:', 'blob:'],      // Allow data URLs and blob URLs for images
                connectSrc: ["'self'"],
                fontSrc: ["'self'", 'data:'],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'", 'blob:'],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,  // Allow loading cross-origin resources
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    },
};
