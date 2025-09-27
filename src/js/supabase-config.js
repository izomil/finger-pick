// Supabase Configuration
// Replace these with your actual Supabase project details
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // e.g., 'https://your-project.supabase.co'
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
    storageBucket: 'finais' // Bucket name for final images
};

// Supabase client (you'll need to include the Supabase JS library)
let supabase = null;

// Initialize Supabase if available
function initSupabase() {
    if (typeof supabase !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('Supabase initialized');
        return true;
    }
    return false;
}

// Get random image from Supabase Storage
async function getRandomFinalImage() {
    if (!supabase) {
        console.log('Supabase not available, using fallback');
        return getFallbackImage();
    }
    
    try {
        // List files in the 'finais' bucket
        const { data: files, error } = await supabase.storage
            .from(SUPABASE_CONFIG.storageBucket)
            .list('', {
                limit: 100,
                offset: 0
            });
        
        if (error) {
            console.error('Error fetching images:', error);
            return getFallbackImage();
        }
        
        if (!files || files.length === 0) {
            console.log('No images found in bucket');
            return getFallbackImage();
        }
        
        // Filter for image files
        const imageFiles = files.filter(file => 
            file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );
        
        if (imageFiles.length === 0) {
            return getFallbackImage();
        }
        
        // Select random image
        const randomIndex = Math.floor(Math.random() * imageFiles.length);
        const selectedFile = imageFiles[randomIndex];
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from(SUPABASE_CONFIG.storageBucket)
            .getPublicUrl(selectedFile.name);
        
        return {
            url: urlData.publicUrl,
            name: selectedFile.name,
            source: 'supabase'
        };
        
    } catch (error) {
        console.error('Error getting random image:', error);
        return getFallbackImage();
    }
}

// Fallback images when Supabase is not available
function getFallbackImage() {
    const fallbackImages = [
        {
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OjzwvdGV4dD4KPC9zdmc+',
            name: 'celebration-1.svg',
            source: 'fallback'
        },
        {
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNkVDQzQ0Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OjzwvdGV4dD4KPC9zdmc+',
            name: 'celebration-2.svg',
            source: 'fallback'
        },
        {
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY5RjQzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OjzwvdGV4dD4KPC9zdmc+',
            name: 'celebration-3.svg',
            source: 'fallback'
        }
    ];
    
    const randomIndex = Math.floor(Math.random() * fallbackImages.length);
    return fallbackImages[randomIndex];
}

// Show final image when game ends
async function showFinalImage() {
    try {
        const imageData = await getRandomFinalImage();
        
        // Create image element
        const img = new Image();
        img.onload = () => {
            // Show image in a modal or overlay
            showImageModal(imageData);
        };
        img.onerror = () => {
            console.log('Failed to load image, using fallback');
            showImageModal(getFallbackImage());
        };
        
        img.src = imageData.url;
        
    } catch (error) {
        console.error('Error showing final image:', error);
        showImageModal(getFallbackImage());
    }
}

// Show image in modal
function showImageModal(imageData) {
    // Remove existing modal if any
    const existingModal = document.getElementById('imageModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        text-align: center;
        animation: scaleIn 0.5s ease;
    `;
    
    // Create image
    const img = document.createElement('img');
    img.src = imageData.url;
    img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 24px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        backdrop-filter: blur(10px);
    `;
    
    // Add click handlers
    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    // Add styles for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Assemble modal
    imageContainer.appendChild(img);
    modal.appendChild(imageContainer);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
        if (modal.parentNode) modal.remove();
    }, 3000);
}

// Export functions for use in game
window.SupabaseConfig = {
    initSupabase,
    showFinalImage,
    getRandomFinalImage
};

