/**
 * Finger Pick - Project Configuration
 * 
 * This file contains all project configuration settings
 * for easy maintenance and customization.
 */

const PROJECT_CONFIG = {
    // Basic project info
    name: 'Finger Pick',
    version: '1.0.0',
    description: 'Um jogo simples onde cada jogador coloca um dedo na tela e um é escolhido aleatoriamente!',
    
    // Game settings
    game: {
        minFingersToStart: 2,
        defaultCountdownTime: 5,
        fingerRadius: 45,
        colors: [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
            '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
            '#10ac84', '#ee5a24', '#0984e3', '#6c5ce7', '#a29bfe'
        ]
    },
    
    // PWA settings
    pwa: {
        themeColor: '#6366f1',
        backgroundColor: '#667eea',
        display: 'standalone',
        orientation: 'portrait-primary'
    },
    
    // Development settings
    dev: {
        port: 3000,
        host: '0.0.0.0',
        enableLogging: true
    },
    
    // Supabase settings (optional)
    supabase: {
        enabled: false,
        url: 'YOUR_SUPABASE_URL',
        anonKey: 'YOUR_SUPABASE_ANON_KEY',
        storageBucket: 'finais'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PROJECT_CONFIG;
} else {
    window.PROJECT_CONFIG = PROJECT_CONFIG;
}
