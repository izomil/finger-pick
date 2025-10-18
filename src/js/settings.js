/**
 * Settings Page Controller
 * 
 * Handles the settings page functionality and navigation
 */

class SettingsController {
    constructor() {
        this.countdownTimeSelect = document.getElementById('countdownTime');
        this.showImageCheckbox = document.getElementById('showImage');
        this.startGameBtn = document.getElementById('startGameBtn');
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Start game button
        this.startGameBtn.addEventListener('click', () => {
            this.saveSettings();
            this.navigateToGame();
        });
        
        // Settings change listeners
        this.countdownTimeSelect.addEventListener('change', () => {
            this.saveSettings();
        });
        
        this.showImageCheckbox.addEventListener('change', () => {
            this.saveSettings();
        });
        
    }
    
    loadSettings() {
        // Load settings from localStorage
        const settings = this.getStoredSettings();
        
        // Apply settings to UI
        this.countdownTimeSelect.value = settings.countdownTime || 5;
        this.showImageCheckbox.checked = settings.showImage !== false; // Default to true
    }
    
    saveSettings() {
        const settings = {
            countdownTime: parseInt(this.countdownTimeSelect.value),
            showImage: this.showImageCheckbox.checked
        };
        
        // Store settings in localStorage
        localStorage.setItem('fingerPickSettings', JSON.stringify(settings));
        
        console.log('Settings saved:', settings);
    }
    
    getStoredSettings() {
        try {
            const stored = localStorage.getItem('fingerPickSettings');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading settings:', error);
            return {};
        }
    }
    
    navigateToGame() {
        // Save current settings first
        this.saveSettings();
        
        // Navigate to game page with settings
        const settings = this.getStoredSettings();
        const params = new URLSearchParams(settings);
        window.location.href = `game.html?${params.toString()}`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsController();
});
