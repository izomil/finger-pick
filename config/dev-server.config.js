/**
 * Development Server Configuration
 * 
 * Configuration for the development server
 */

const DEV_SERVER_CONFIG = {
    // Server settings
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    
    // File paths
    paths: {
        static: '.',
        index: 'index.html',
        css: 'src/css',
        js: 'src/js',
        assets: 'src/assets',
        public: 'public'
    },
    
    // Cache settings
    cache: {
        static: 'public, max-age=3600',
        css: 'public, max-age=31536000, immutable',
        js: 'public, max-age=31536000, immutable',
        images: 'public, max-age=31536000, immutable',
        sw: 'public, max-age=0, must-revalidate'
    },
    
    // MIME types
    mimeTypes: {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
    },
    
    // PWA headers
    pwaHeaders: {
        'Service-Worker-Allowed': '/',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'same-origin'
    }
};

module.exports = DEV_SERVER_CONFIG;
