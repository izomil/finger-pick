class FingerPickGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas não encontrado!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.playBtn = document.getElementById('playBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.countdownEl = document.getElementById('countdown');
        this.winnerEl = document.getElementById('winner');
        
        console.log('Elementos encontrados:', {
            canvas: !!this.canvas,
            playBtn: !!this.playBtn,
            settingsBtn: !!this.settingsBtn,
            countdownEl: !!this.countdownEl,
            winnerEl: !!this.winnerEl
        });
        
        this.fingers = [];
        this.visualFingers = []; // Visual markings that persist during selection
        this.gameState = 'waiting'; // waiting, counting, finished
        this.countdownValue = 5;
        this.countdownInterval = null;
        this.minFingersToStart = 2; // Mínimo de dedos para iniciar
        this.showImage = true; // Whether to show image at the end
        this.winnerCheckInterval = null;
        this.selectionAnimation = null; // Animation for selecting winner
        this.selectionIndex = 0; // Current finger being highlighted
        this.selectionSpeed = 200; // Speed of selection animation (ms)
        this.originalCountdownTime = 5; // Store original countdown time for selection animation
        this.imageShown = false; // Flag to prevent multiple images
        this.colors = [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff',
            '#00ffff', '#ff8000', '#8000ff', '#ff0080', '#80ff00',
            '#0080ff', '#ff4000', '#4000ff', '#ff0040', '#40ff00',
            '#0040ff', '#ff2000', '#2000ff', '#ff0020', '#20ff00'
        ];
        
        this.loadSettings();
        this.init();
        
        // Disable play button initially
        if (this.playBtn) {
            this.playBtn.disabled = true;
        }
    }
    
    loadSettings() {
        // Load settings from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const storedSettings = this.getStoredSettings();
        
        this.countdownValue = parseInt(urlParams.get('countdownTime')) || 
                             parseInt(storedSettings.countdownTime) || 5;
        this.originalCountdownTime = this.countdownValue; // Store original time
        
        // Get showImage from URL params or localStorage
        const urlShowImage = urlParams.get('showImage');
        const storedShowImage = storedSettings.showImage;
        
        // Default to true if not specified
        this.showImage = (urlShowImage === 'true') || 
                        (urlShowImage === null && storedShowImage !== false) ||
                        (storedShowImage === true);
        
        // Get debug mode from URL params or localStorage
        const urlDebugMode = urlParams.get('debugMode');
        const storedDebugMode = storedSettings.debugMode;
        
        // Default to false if not specified
        this.debugMode = (urlDebugMode === 'true') || (storedDebugMode === true);
        
        console.log('Settings loaded:', {
            countdownTime: this.countdownValue,
            showImage: this.showImage,
            debugMode: this.debugMode,
            urlShowImage: urlShowImage,
            storedShowImage: storedShowImage,
            urlDebugMode: urlDebugMode,
            storedDebugMode: storedDebugMode
        });
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
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupCanvasHelpers();
        this.draw();
    }
    
    setupCanvasHelpers() {
        // Add roundRect support for older browsers
        if (!this.ctx.roundRect) {
            this.ctx.roundRect = function(x, y, width, height, radius) {
                this.beginPath();
                this.moveTo(x + radius, y);
                this.lineTo(x + width - radius, y);
                this.quadraticCurveTo(x + width, y, x + width, y + radius);
                this.lineTo(x + width, y + height - radius);
                this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                this.lineTo(x + radius, y + height);
                this.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.lineTo(x, y + radius);
                this.quadraticCurveTo(x, y, x + radius, y);
                this.closePath();
            };
        }
    }
    
    setupCanvas() {
        // Responsive canvas sizing
        const updateCanvasSize = () => {
            const container = this.canvas.parentElement;
            const maxWidth = Math.min(container.clientWidth - 40, 600);
            const maxHeight = Math.min(window.innerHeight * 0.7, 600); // Increased from 0.6 to 0.7 and 500 to 600
            
            this.canvas.width = maxWidth;
            this.canvas.height = maxHeight;
            this.canvas.style.width = maxWidth + 'px';
            this.canvas.style.height = maxHeight + 'px';
        };
        
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
    }
    
    setupEventListeners() {
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // Mouse events (for desktop testing)
        this.canvas.addEventListener('mousedown', (e) => this.handleMouse(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Keyboard events for desktop testing
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Button events
        this.playBtn.addEventListener('click', () => this.resetGame());
        this.settingsBtn.addEventListener('click', () => this.navigateToSettings());
        
        // Test button for debugging (temporary) - disabled for production
        // this.addTestButton();
        
        // Mobile debug button (temporary)
        if (this.debugMode) {
            this.addMobileDebugButton();
        }
        
        // Prevent context menu on long press
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleTouch(e) {
        e.preventDefault();
        console.log('Touch detectado:', e.changedTouches.length, 'dedos');
        
        // Allow adding fingers during counting and selecting, but not during finished state
        if (this.gameState === 'finished') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const touches = Array.from(e.changedTouches);
        
        touches.forEach(touch => {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            console.log(`Touch: x=${x}, y=${y}, canvas=${this.canvas.width}x${this.canvas.height}`);
            
            // Check if touch is within canvas bounds
            if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
                this.addFinger(x, y, touch.identifier);
            } else {
                console.log('Touch fora do canvas');
            }
        });
    }
    
    handleMouse(e) {
        console.log('Mouse detectado');
        
        // Allow adding fingers during counting and selecting, but not during finished state
        if (this.gameState === 'finished') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log(`Mouse: x=${x}, y=${y}`);
        this.addFinger(x, y, 'mouse');
    }
    
    handleMouseUp(e) {
        // Remove mouse finger when mouse is released
        const mouseFingerIndex = this.fingers.findIndex(f => f.id === 'mouse');
        if (mouseFingerIndex !== -1) {
            this.removeFinger('mouse');
        }
    }
    
    handleKeyDown(e) {
        console.log('Tecla pressionada:', e.code, 'Estado do jogo:', this.gameState);
        
        // Only allow keyboard input during waiting and counting states
        if (this.gameState === 'finished') {
            console.log('Jogo finalizado - teclas desabilitadas');
            return;
        }
        
        // Add finger with keyboard (Space, Enter, or number keys 1-9)
        if (e.code === 'Space' || e.code === 'Enter' || 
            (e.code >= 'Digit1' && e.code <= 'Digit9')) {
            e.preventDefault();
            
            // Generate random position for keyboard finger
            const x = Math.random() * (this.canvas.width - 100) + 50;
            const y = Math.random() * (this.canvas.height - 100) + 50;
            
            const fingerId = `keyboard-${e.code}`;
            console.log(`Tecla ${e.code} pressionada: x=${x}, y=${y}, fingerId=${fingerId}`);
            this.addFinger(x, y, fingerId);
        }
        
        // Remove all fingers with Escape key
        if (e.code === 'Escape') {
            e.preventDefault();
            console.log('ESC pressionado - removendo todos os dedos');
            this.fingers = [];
            this.draw();
        }
    }
    
    addFinger(x, y, id) {
        console.log(`Tentando adicionar dedo: id=${id}, x=${x}, y=${y}, estado=${this.gameState}`);
        
        // Check if finger already exists (prevent multiple touches from same finger)
        if (this.fingers.find(f => f.id === id)) {
            console.log(`Dedo com ID ${id} já existe, ignorando`);
            return;
        }
        
        const color = this.colors[this.fingers.length % this.colors.length];
        const finger = {
            id,
            x,
            y,
            color,
            radius: 45,
            pulseRadius: 0,
            isWinner: false,
            isSelected: false
        };
        
        this.fingers.push(finger);
        console.log(`Dedo adicionado com sucesso. Total de dedos: ${this.fingers.length}`);
        this.draw();
        
        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Auto-start logic
        console.log(`Dedo adicionado. Total: ${this.fingers.length}, Estado: ${this.gameState}`);
        this.checkAutoStart();
        
        // If we're counting and someone adds a finger, just continue counting
        if (this.gameState === 'counting') {
            console.log(`Dedo adicionado durante contagem. Total: ${this.fingers.length}`);
        }
        
        // Check if we need to resume from pause
        this.checkResumeFromPause();
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const touches = Array.from(e.changedTouches);
        
        touches.forEach(touch => {
            const fingerIndex = this.fingers.findIndex(f => f.id === touch.identifier);
            if (fingerIndex !== -1) {
                this.removeFinger(touch.identifier);
            }
        });
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        
        if (this.gameState !== 'counting') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const touches = Array.from(e.touches);
        
        touches.forEach(touch => {
            const fingerIndex = this.fingers.findIndex(f => f.id === touch.identifier);
            if (fingerIndex !== -1) {
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                // Check if finger is still within canvas bounds
                if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
                    this.removeFinger(touch.identifier);
                } else {
                    // Update finger position
                    this.fingers[fingerIndex].x = x;
                    this.fingers[fingerIndex].y = y;
                    this.draw();
                }
            }
        });
    }
    
    removeFinger(id) {
        console.log(`Tentando remover dedo com ID: ${id}`);
        console.log(`Estado do jogo: ${this.gameState}`);
        console.log(`Dedos atuais: ${this.fingers.length}`);
        
        const fingerIndex = this.fingers.findIndex(f => f.id === id);
        if (fingerIndex !== -1) {
            const removedFinger = this.fingers[fingerIndex];
            console.log(`Dedo removido:`, removedFinger);
            console.log(`É vencedor? ${removedFinger.isWinner}`);
            
            this.fingers.splice(fingerIndex, 1);
            
            // Always redraw after removing a finger
            this.draw();
            
            // Check if the removed finger was the winner
            if (removedFinger.isWinner && this.gameState === 'finished') {
                console.log('Dedo vencedor removido - mostrando imagem');
                this.showWinnerImage();
                // Don't restart game automatically - wait for play button
                return;
            }
            
            // During counting phase, handle finger removal
            if (this.gameState === 'counting') {
                console.log('Dedo removido durante contagem');
                
                // If less than 2 fingers left, pause countdown and show waiting message
                if (this.fingers.length < this.minFingersToStart) {
                    console.log(`${this.fingers.length} dedo(s) restante(s) - pausando contagem`);
                    this.pauseCountdown();
                    return;
                }
                
                // If 2+ fingers, continue normally
                console.log(`${this.fingers.length} dedos restantes - continuando contagem`);
                return;
            }
            
            // During selection animation, keep finger markings but allow removal
            if (this.gameState === 'selecting') {
                console.log('Dedo removido durante seleção - mantendo marcação');
                // Keep the finger marking on screen even if finger is removed
                // Don't actually remove from fingers array during selection
                return; // Exit early to prevent game logic interference
            }
            
            // During finished state, don't auto-restart - wait for play button
            if (this.gameState === 'finished') {
                console.log('Jogo finalizado - aguardando botão Jogar');
                return;
            }
            
            // Check if we need to pause or continue
            this.checkAutoStart();
            
            // Check if we need to resume from pause
            this.checkResumeFromPause();
        } else {
            console.log('Dedo não encontrado para remoção');
        }
    }
    
    checkAutoStart() {
        console.log(`checkAutoStart: Estado=${this.gameState}, Dedos=${this.fingers.length}, Mínimo=${this.minFingersToStart}`);
        
        if (this.gameState === 'waiting') {
            // Start countdown if we have enough fingers
            if (this.fingers.length >= this.minFingersToStart) {
                console.log('Iniciando jogo automaticamente');
                this.startGame();
            }
        } else if (this.gameState === 'counting') {
            // If countdown is paused and we have enough fingers, restart
            if (!this.countdownInterval && this.fingers.length >= this.minFingersToStart) {
                console.log('Reiniciando contagem - dedos suficientes');
                this.restartCountdown();
            }
            // If countdown is running but we don't have enough fingers, pause
            else if (this.countdownInterval && this.fingers.length < this.minFingersToStart) {
                console.log('Pausando contagem - poucos dedos');
                this.pauseCountdown();
            }
        }
        
        // Always redraw to update the display
        this.draw();
    }
    
    checkResumeFromPause() {
        // If we're in counting state but countdown is paused (no interval running)
        if (this.gameState === 'counting' && !this.countdownInterval && this.fingers.length >= this.minFingersToStart) {
            console.log('Reiniciando contagem após pausa');
            this.restartCountdown();
        }
    }
    
    resumeCountdown() {
        // Hide the "Aguardando jogadores" message
        this.countdownEl.classList.add('hidden');
        
        // Restart countdown from the beginning
        // Countdown time is already loaded from settings
        this.startCountdown();
    }
    
    pauseCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Hide HTML countdown, show pause message on canvas
        this.countdownEl.classList.add('hidden');
        
        console.log('Contagem pausada - mostrando "Aguardando jogadores"');
        
        // Ensure the display is updated
        this.draw();
    }
    
    restartCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Reset countdown to original value
        this.countdownValue = this.originalCountdownTime;
        
        console.log(`Contagem reiniciada: ${this.countdownValue} segundos`);
        
        // Restart countdown
        this.startCountdown();
    }
    
    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Reset game state to waiting
        this.gameState = 'waiting';
        
        console.log('Contagem parada - voltando para estado de espera');
        
        // Update display
        this.draw();
    }
    
    startGame() {
        console.log(`startGame: Dedos=${this.fingers.length}, Mínimo=${this.minFingersToStart}`);
        
        if (this.fingers.length < this.minFingersToStart) {
            console.log('Não há dedos suficientes para iniciar');
            return; // Not enough fingers
        }
        
        console.log('Iniciando contagem com', this.countdownValue, 'segundos');
        this.gameState = 'counting';
        this.playBtn.disabled = false;
        
        // Countdown time is already loaded from settings
        
        this.startCountdown();
    }
    
    startCountdown() {
        // Hide the HTML countdown element
        this.countdownEl.classList.add('hidden');
        
        console.log(`Primeira contagem iniciada: ${this.countdownValue} segundos`);
        
        this.countdownInterval = setInterval(() => {
            this.countdownValue--;
            
            // Redraw to show countdown on canvas
            this.draw();
            
            if (this.countdownValue <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    endGame() {
        clearInterval(this.countdownInterval);
        this.gameState = 'selecting'; // New state for selection animation
        
        console.log('Primeira contagem terminada - iniciando animação de seleção...');
        console.log(`Dedos atuais: ${this.fingers.length}`);
        
        // Copy fingers to visualFingers for persistent markings
        this.visualFingers = [...this.fingers];
        
        // Reset countdown to half the original time for selection phase
        this.countdownValue = Math.ceil(this.originalCountdownTime / 2);
        
        // Start selection animation
        this.startSelectionAnimation();
    }
    
    startSelectionAnimation() {
        // Calculate selection duration (half of original countdown time)
        const selectionDuration = (this.originalCountdownTime * 1000) / 2; // Half the original countdown time in ms
        const totalSteps = Math.floor(selectionDuration / this.selectionSpeed);
        
        console.log(`Segunda contagem (seleção): ${selectionDuration}ms, ${totalSteps} passos, tempo original: ${this.originalCountdownTime}s`);
        
        this.selectionIndex = 0;
        let step = 0;
        
        // Start countdown for selection phase
        this.countdownInterval = setInterval(() => {
            this.countdownValue--;
            if (this.countdownValue <= 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
            }
        }, 1000);
        
        this.selectionAnimation = setInterval(() => {
            // Clear previous selection
            this.visualFingers.forEach(finger => {
                finger.isSelected = false;
            });
            
            // Highlight current finger (only if there are visual fingers left)
            if (this.visualFingers.length > 0) {
                // Adjust selection index if it's out of bounds
                if (this.selectionIndex >= this.visualFingers.length) {
                    this.selectionIndex = 0;
                }
                this.visualFingers[this.selectionIndex].isSelected = true;
                
                // Move to next finger
                this.selectionIndex = (this.selectionIndex + 1) % this.visualFingers.length;
            } else {
                // If no visual fingers left, just continue the animation
                console.log('Nenhum dedo visual restante durante animação');
            }
            
            step++;
            
            // Redraw canvas
            this.draw();
            
            // End selection animation
            if (step >= totalSteps) {
                this.endSelectionAnimation();
            }
        }, this.selectionSpeed);
    }
    
    endSelectionAnimation() {
        clearInterval(this.selectionAnimation);
        this.selectionAnimation = null;
        
        // Check if there are any visual fingers left
        if (this.visualFingers.length === 0) {
            console.log('Nenhum dedo visual restante - reiniciando jogo');
            this.gameState = 'waiting';
            this.draw();
            return;
        }
        
        // Select random winner from visual fingers
        const winnerIndex = Math.floor(Math.random() * this.visualFingers.length);
        const winner = this.visualFingers[winnerIndex];
        winner.isWinner = true;
        
        // Clear selection from all visual fingers
        this.visualFingers.forEach(finger => {
            finger.isSelected = false;
        });
        
        console.log('Vencedor selecionado:', winner, 'de', this.visualFingers.length, 'dedos visuais');
        
        // Change state to finished
        this.gameState = 'finished';
        
        // Keep only the winner in visualFingers
        this.visualFingers = [winner];
        
        // Also update fingers array for consistency
        this.fingers = [winner];
        
        // Enable play button for new game
        this.playBtn.disabled = false;
        
        // Hide countdown
        this.countdownEl.classList.add('hidden');
        this.showWinner(winner);
        
        // Show image only if checkbox is checked
        console.log('Checkbox showImage:', this.showImage);
        console.log('Tipo do showImage:', typeof this.showImage);
        if (this.showImage) {
            console.log('Mostrando imagem do vencedor imediatamente');
            this.showWinnerImage();
        } else {
            console.log('Checkbox desmarcado - não exibindo nada');
            // Don't show anything when checkbox is unchecked
        }
        
        // Haptic feedback for winner
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        
        // Final draw
        this.draw();
    }
    
    setupWinnerRemovalListener(winner) {
        // Add a specific listener for the winner finger
        const checkWinnerRemoval = () => {
            if (this.gameState === 'finished' && this.fingers.length === 0) {
                console.log('Dedo vencedor foi removido - mostrando imagem');
                this.showWinnerImage();
            }
        };
        
        // Check every 100ms if winner is still there
        this.winnerCheckInterval = setInterval(checkWinnerRemoval, 100);
    }
    
    showWinner(winner) {
        // Winner is now only shown visually on the canvas
        // No text message displayed
        
        // Add celebration animation
        this.startCelebration();
        
        // Start continuous animation for winner
        this.startWinnerAnimation();
        
        // Don't show image automatically - wait for winner finger to be removed
    }
    
    startWinnerAnimation() {
        // Keep drawing the winner with continuous animation
        const animate = () => {
            if (this.gameState === 'finished' && this.fingers.some(f => f.isWinner)) {
                this.draw();
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
    
    showWinnerImage() {
        console.log('Mostrando imagem do vencedor');
        
        // Prevent multiple images from being shown
        if (this.imageShown) {
            console.log('Imagem já foi exibida - ignorando chamada duplicada');
            return;
        }
        
        this.imageShown = true;
        
        // Clear the winner check interval
        if (this.winnerCheckInterval) {
            clearInterval(this.winnerCheckInterval);
            this.winnerCheckInterval = null;
        }
        
        // Winner message is no longer shown
        
        // Only show image if enabled in settings
        console.log('showWinnerImage - showImage:', this.showImage);
        if (this.showImage) {
            console.log('Exibindo imagem aleatória local');
            this.showRandomImage();
        } else {
            console.log('Imagem desabilitada nas configurações');
            // Don't show anything when image is disabled
        }
    }
    
    
    showRandomImage() {
        console.log('showRandomImage chamado');
        console.log('Carregando configuração de imagens...');
        
        // Limpar cache do localStorage se necessário
        this.clearImageCache();
        
        // Load images using configuration file
        this.loadImagesFromConfig();
    }
    
    forceReloadForMobile() {
        // Função para forçar reload no mobile se necessário
        console.log('Forçando reload para mobile...');
        
        // Limpar todos os caches possíveis
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    registration.unregister();
                    console.log('Service Worker removido');
                });
            });
        }
        
        // Recarregar a página
        window.location.reload(true);
    }
    
    clearImageCache() {
        // Limpar cache relacionado a imagens se necessário
        console.log('Limpando cache de imagens...');
        
        // Limpar localStorage para forçar recarregamento
        localStorage.removeItem('fingerPickLastSelected');
        localStorage.removeItem('fingerPickSettings');
        
        // Limpar cache do navegador se possível (mobile)
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    // Limpar todos os caches relacionados ao projeto
                    if (name.includes('images-config') || 
                        name.includes('finger-pick') || 
                        name.includes('images') ||
                        name.includes('assets')) {
                        caches.delete(name);
                        console.log('Cache removido:', name);
                    }
                });
            });
        }
        
        // Limpar cache de imagens do navegador se possível
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    if (registration.scope.includes('finger-pick')) {
                        registration.unregister();
                        console.log('Service Worker removido para limpar cache');
                    }
                });
            });
        }
    }
    
    async loadImagesFromConfig() {
        try {
            // Cache busting mais agressivo
            const cacheBuster = `${Date.now()}_${Math.random()}`;
            const configResponse = await fetch(`src/assets/images-config.json?t=${cacheBuster}&v=${cacheBuster}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (configResponse.ok) {
                const config = await configResponse.json();
                console.log('JSON carregado com sucesso (sem cache):', config);
                console.log(`Total de imagens configurado: ${config.totalImages}`);
                console.log(`Cache busting usado: ${cacheBuster}`);
                
                // Verificar se a configuração está correta
                if (config.totalImages && config.totalImages > 0) {
                    console.log(`Range esperado: [${config.startNumber || 0}, ${(config.startNumber || 0) + config.totalImages - 1}]`);
                }
                
                // Obter último número selecionado do localStorage se não estiver no JSON
                if (config.lastSelectedNumber === undefined || config.lastSelectedNumber === null) {
                    config.lastSelectedNumber = this.getLastSelectedNumber();
                }
                
                // Gerar imagem aleatória baseada na configuração
                const result = await this.generateRandomImageFromConfig(config);
                const success = await this.tryLoadImageWithFallback(result.imagePath, result.randomNumber);
                
                if (!success) {
                    this.loadImagesWithFallback(config);
                }
            } else {
                console.log('Erro ao carregar JSON, usando fallback com 13 imagens');
                this.loadImagesWithFallback({
                    totalImages: 13,
                    basePath: 'src/assets/images/',
                    filenamePattern: 'img',
                    extension: 'jpg',
                    startNumber: 0,
                    debug: false
                });
            }
        } catch (error) {
            console.log('Erro ao carregar JSON, usando fallback com 13 imagens:', error);
            this.loadImagesWithFallback({
                totalImages: 13,
                basePath: 'src/assets/images/',
                filenamePattern: 'img',
                extension: 'jpg',
                startNumber: 0,
                debug: false
            });
        }
    }
    
    async generateRandomImageFromConfig(config) {
        // Garantir que temos valores válidos
        const totalImages = parseInt(config.totalImages) || 13;
        const startNumber = parseInt(config.startNumber) || 0;
        const basePath = config.basePath || 'src/assets/images/';
        const filenamePattern = config.filenamePattern || 'img';
        const extension = config.extension || 'jpg';
        const lastSelectedNumber = parseInt(config.lastSelectedNumber) || -1;
        const debug = (config.debug === true) || this.debugMode; // Flag de debug (JSON ou configuração do usuário)
        
        if (debug) {
            console.log('Configuração processada:', { totalImages, startNumber, basePath, filenamePattern, extension, lastSelectedNumber, debug });
            console.log(`Range válido: [${startNumber}, ${startNumber + totalImages - 1}]`);
        }
        
        let randomNumber;
        let attempts = 0;
        const maxAttempts = 10; // Evitar loop infinito
        
        do {
            // Gerar número aleatório entre startNumber e (startNumber + totalImages - 1)
            // Com totalImages=4 e startNumber=0, deve gerar 0, 1, 2, 3
            randomNumber = Math.floor(Math.random() * totalImages) + startNumber;
            attempts++;
            
            if (debug) {
                console.log(`Tentativa ${attempts}: totalImages=${totalImages}, startNumber=${startNumber}, número gerado = ${randomNumber}, último selecionado = ${lastSelectedNumber}`);
            }
            
            // Verificação de segurança para garantir que o número está no range correto
            if (randomNumber < startNumber || randomNumber >= startNumber + totalImages) {
                console.error(`ERRO CRÍTICO: Número ${randomNumber} fora do range [${startNumber}, ${startNumber + totalImages - 1}]`);
                console.error('Forçando número para o range válido...');
                randomNumber = Math.max(startNumber, Math.min(randomNumber, startNumber + totalImages - 1));
            }
        } while (randomNumber === lastSelectedNumber && attempts < maxAttempts);
        
        if (debug) {
            console.log(`✅ Número final validado: ${randomNumber} (range: [${startNumber}, ${startNumber + totalImages - 1}])`);
        }
        
        // Mostrar o número sorteado na tela apenas se debug estiver ativo
        if (debug) {
            this.showImageNumberOnScreen(randomNumber);
        }
        
        // Construir caminho da imagem
        const imagePath = `${basePath}${filenamePattern}${randomNumber}.${extension}`;
        
        if (debug) {
            console.log(`Imagem final gerada: ${imagePath} (número: ${randomNumber}, último: ${lastSelectedNumber})`);
        }
        
        // Atualizar o localStorage com o novo número selecionado
        await this.updateLastSelectedNumber(randomNumber);
        
        // Retornar tanto o caminho quanto o número para exibir na tela
        return { imagePath, randomNumber };
    }
    
    async updateLastSelectedNumber(selectedNumber) {
        try {
            // Cache busting para carregar configuração atual
            const cacheBuster = `${Date.now()}_${Math.random()}`;
            const response = await fetch(`src/assets/images-config.json?t=${cacheBuster}`, {
                cache: 'no-store'
            });
            if (response.ok) {
                const config = await response.json();
                
                // Atualizar o número selecionado no JSON (para referência)
                config.lastSelectedNumber = selectedNumber;
                
                // Salvar no localStorage como backup
                console.log(`Atualizando último número selecionado: ${selectedNumber}`);
                localStorage.setItem('fingerPickLastSelected', selectedNumber.toString());
            }
        } catch (error) {
            console.log('Erro ao atualizar último número selecionado:', error);
            // Fallback para localStorage
            localStorage.setItem('fingerPickLastSelected', selectedNumber.toString());
        }
    }
    
    getLastSelectedNumber() {
        // Obter o último número selecionado do localStorage
        const stored = localStorage.getItem('fingerPickLastSelected');
        return stored ? parseInt(stored) : -1;
    }
    
    async tryLoadImageWithFallback(imagePath, imageNumber = null) {
        console.log('Tentando carregar imagem:', imagePath);
        
        // Cache busting para imagens também
        const imageCacheBuster = `?t=${Date.now()}&v=${Math.random()}`;
        
        const basePaths = [
            '', // Caminho relativo atual
            '../', // Um nível acima
            '../../', // Dois níveis acima
            '/', // Caminho absoluto
            './' // Caminho relativo explícito
        ];
        
        // Tentar cada caminho base até encontrar a imagem
        for (const basePathPrefix of basePaths) {
            const fullPath = basePathPrefix + imagePath + imageCacheBuster;
            console.log(`Testando caminho com cache busting: ${fullPath}`);
            
            try {
                const exists = await this.testImageExists(fullPath);
                console.log(`Resultado do teste: ${exists ? 'SUCESSO' : 'FALHA'} para ${fullPath}`);
                if (exists) {
                    console.log(`Imagem encontrada: ${fullPath}`);
                    this.createImageModal(fullPath, imageNumber);
                    return true;
                }
            } catch (error) {
                console.log(`Erro ao testar ${fullPath}:`, error);
            }
        }
        
        console.log('Nenhuma imagem encontrada em todos os caminhos testados');
        return false;
    }
    
    async loadImagesWithFallback(config) {
        // Obter último número selecionado do localStorage
        config.lastSelectedNumber = this.getLastSelectedNumber();
        
        // Gerar uma imagem aleatória baseada na configuração
        const result = await this.generateRandomImageFromConfig(config);
        
        // Tentar carregar a imagem aleatória
        const success = await this.tryLoadImageWithFallback(result.imagePath, result.randomNumber);
        
        if (!success) {
            this.showDefaultMessage();
        }
    }
    
    showDefaultMessage() {
        // Criar modal com mensagem padrão quando não há imagens
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        
        const messageContainer = document.createElement('div');
        messageContainer.style.cssText = `
            text-align: center;
            color: white;
            font-size: 1.5rem;
            padding: 2rem;
        `;
        messageContainer.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
            <div>Parabéns ao vencedor!</div>
            <div style="font-size: 1rem; margin-top: 1rem; opacity: 0.8;">Clique para fechar</div>
        `;
        
        modal.appendChild(messageContainer);
        document.body.appendChild(modal);
        
        // Fechar automaticamente após 3 segundos
        setTimeout(() => {
            if (modal.parentNode) modal.remove();
        }, 3000);
        
        // Fechar ao clicar
        modal.onclick = () => modal.remove();
    }
    
    addTestButton() {
        // Adicionar botão de teste temporário para debug
        const testBtn = document.createElement('button');
        testBtn.textContent = '🧪 Testar Imagem';
        testBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        `;
        testBtn.onclick = () => {
            console.log('Botão de teste clicado');
            this.showRandomImage();
        };
        document.body.appendChild(testBtn);
    }
    
    addMobileDebugButton() {
        // Botão de debug específico para mobile
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '🔄 Limpar Cache';
        debugBtn.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 1000;
            background: #4ecdc4;
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        debugBtn.onclick = () => {
            console.log('Botão de debug mobile clicado');
            this.forceReloadForMobile();
        };
        document.body.appendChild(debugBtn);
    }
    
    
    extractImagesFromHTML(html, basePath) {
        const imageList = [];
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        
        // Parse HTML to find image files
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a[href]');
        
        console.log('Links encontrados no HTML:', links.length);
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.includes('/') && !href.startsWith('.')) {
                // Check if it's an image file
                const extension = href.toLowerCase().substring(href.lastIndexOf('.'));
                if (imageExtensions.includes(extension)) {
                    const fullPath = basePath + href;
                    imageList.push(fullPath);
                    console.log('Imagem encontrada:', fullPath);
                }
            }
        });
        
        return imageList;
    }
    
    async discoverImages() {
        const basePaths = [
            'src/assets/images/',
            '../assets/images/',
            '../../assets/images/',
            'assets/images/',
            '/src/assets/images/'
        ];
        
        for (const basePath of basePaths) {
            console.log('Tentando base path:', basePath);
            
            try {
                // Try to get directory listing
                console.log('Fazendo fetch para:', basePath);
                const response = await fetch(basePath);
                console.log('Response status:', response.status, response.statusText);
                
                if (response.ok) {
                    const html = await response.text();
                    console.log('HTML recebido (primeiros 500 chars):', html.substring(0, 500));
                    const imageList = this.parseImageList(html, basePath);
                    console.log('Lista de imagens extraída:', imageList);
                    
                    if (imageList.length > 0) {
                        console.log('Imagens encontradas:', imageList);
                        // Select random image
                        const randomIndex = Math.floor(Math.random() * imageList.length);
                        const selectedImage = imageList[randomIndex];
                        console.log('Imagem selecionada:', selectedImage);
                        this.createImageModal(selectedImage);
                        return;
                    } else {
                        console.log('Nenhuma imagem encontrada no HTML');
                    }
                } else {
                    console.log('Response não OK:', response.status, response.statusText);
                }
            } catch (error) {
                console.log('Erro ao acessar diretório:', basePath, error);
            }
        }
        
        console.log('Nenhuma imagem encontrada na pasta assets/images');
        // Don't show anything if no images found
    }
    
    parseImageList(html, basePath) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const imageList = [];
        
        // Parse HTML to find image files
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.includes('/') && !href.startsWith('.')) {
                // Check if it's an image file
                const extension = href.toLowerCase().substring(href.lastIndexOf('.'));
                if (imageExtensions.includes(extension)) {
                    imageList.push(basePath + href);
                }
            }
        });
        
        return imageList;
    }
    
    async testImageExists(imagePath) {
        return new Promise((resolve) => {
            // Skip cache check and always test by loading the image directly
            // This ensures we get the latest version
            const testImg = new Image();
            testImg.onload = () => {
                console.log('Imagem encontrada na rede:', imagePath);
                resolve(true);
            };
            testImg.onerror = () => {
                console.log('Imagem não encontrada:', imagePath);
                resolve(false);
            };
            
            // Force reload by adding cache busting if not already present
            let finalPath = imagePath;
            if (!imagePath.includes('?t=')) {
                finalPath = imagePath + `?t=${Date.now()}`;
            }
            
            testImg.src = finalPath;
        });
    }
    
    showImageNumberOnScreen(imageNumber) {
        // Create or update the image number display on canvas
        this.imageNumberDisplay = {
            number: imageNumber,
            startTime: Date.now(),
            duration: 3000, // Show for 3 seconds
            visible: true
        };
        
        console.log(`Número da imagem sorteado: ${imageNumber}`);
        
        // Redraw to show the number
        this.draw();
    }
    
    createImageModal(imageUrl, imageNumber = null) {
        console.log('createImageModal chamado com:', imageUrl, 'número:', imageNumber);
        
        // Check if modal already exists and remove it
        const existingModal = document.querySelector('.image-modal');
        if (existingModal) {
            console.log('Removendo modal existente');
            existingModal.remove();
        }
        
        // Create modal for image
        const modal = document.createElement('div');
        modal.className = 'image-modal'; // Add class for easy identification
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        
        const imageContainer = document.createElement('div');
        imageContainer.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            text-align: center;
        `;
        
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            animation: scaleIn 0.5s ease;
        `;
        
        img.onload = () => {
            console.log('Imagem carregada com sucesso no modal:', imageUrl);
        };
        
        img.onerror = () => {
            console.error('Erro ao carregar imagem no modal:', imageUrl);
            modal.remove();
        };
        
        imageContainer.appendChild(img);
        
        const closeText = document.createElement('div');
        closeText.style.cssText = `
            color: white;
            font-size: 1.2rem;
            margin-top: 1rem;
            opacity: 0.8;
        `;
        closeText.textContent = 'Clique para fechar';
        
        imageContainer.appendChild(closeText);
        modal.appendChild(imageContainer);
        document.body.appendChild(modal);
        
        console.log('Modal criado e adicionado ao DOM');
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (modal.parentNode) modal.remove();
        }, 5000);
        
        // Close on click
        modal.onclick = () => {
            console.log('Modal clicado - removendo');
            modal.remove();
        };
    }
    
    
    startCelebration() {
        const celebrationDuration = 3000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / celebrationDuration;
            
            if (progress < 1) {
                // Animate winner finger
                const winner = this.fingers.find(f => f.isWinner);
                if (winner) {
                    winner.pulseRadius = Math.sin(progress * Math.PI * 4) * 20;
                }
                
                this.draw();
                requestAnimationFrame(animate);
            } else {
                // Stop animation
                const winner = this.fingers.find(f => f.isWinner);
                if (winner) {
                    winner.pulseRadius = 0;
                }
                this.draw();
            }
        };
        
        animate();
    }
    
    resetGame() {
        console.log('Resetando jogo...');
        
        // Clear any running intervals
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        if (this.winnerCheckInterval) {
            clearInterval(this.winnerCheckInterval);
            this.winnerCheckInterval = null;
        }
        
        if (this.selectionAnimation) {
            clearInterval(this.selectionAnimation);
            this.selectionAnimation = null;
        }
        
        // Reset game state
        this.gameState = 'waiting';
        this.fingers = [];
        this.visualFingers = [];
        this.imageShown = false; // Reset image flag
        
        // Reload settings to get current countdown time
        this.loadSettings();
        
        this.playBtn.disabled = true;
        
        // Hide all UI elements
        this.countdownEl.classList.add('hidden');
        
        // Clear any winner image if showing
        if (window.SupabaseConfig && window.SupabaseConfig.hideFinalImage) {
            window.SupabaseConfig.hideFinalImage();
        }
        
        console.log('Jogo resetado. Tempo configurado:', this.countdownValue, 'segundos');
        this.draw();
    }
    
    navigateToSettings() {
        window.location.href = 'settings.html';
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background pattern
        this.drawBackground();
        
        // Draw fingers
        if (this.gameState === 'selecting') {
            // During selection, draw visual fingers
            this.visualFingers.forEach(finger => {
                this.drawFinger(finger);
            });
        } else if (this.gameState === 'finished') {
            // During finished state, draw visual fingers to maintain winner marking
            if (this.visualFingers.length > 0) {
                this.visualFingers.forEach(finger => {
                    this.drawFinger(finger);
                });
            }
        } else {
            // During other states, draw actual fingers
            this.fingers.forEach(finger => {
                this.drawFinger(finger);
            });
        }
        
        // Draw countdown or instructions
        if (this.gameState === 'counting' && this.countdownInterval) {
            // Only show countdown if countdown is actually running
            this.drawCountdown();
        } else if (this.gameState === 'selecting') {
            // Don't show countdown during selection phase
            // Only show the selection animation on fingers
        } else if (this.gameState === 'waiting' && this.fingers.length < this.minFingersToStart && this.fingers.length > 0) {
            this.drawWaitingMessage();
        } else if (this.fingers.length === 0) {
            this.drawInstructions();
        }
        
        // Draw image number display if visible
        if (this.imageNumberDisplay && this.imageNumberDisplay.visible) {
            this.drawImageNumberDisplay();
        }
    }
    
    drawBackground() {
        // Subtle grid pattern
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawFinger(finger) {
        const { x, y, color, radius, pulseRadius, isWinner, isSelected } = finger;
        
        // Draw outer glow for winner
        if (isWinner) {
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 30;
        } else {
            this.ctx.shadowBlur = 0;
        }
        
        // Draw selection animation (rotating border)
        if (isSelected && this.gameState === 'selecting') {
            this.ctx.strokeStyle = '#ff6b6b';
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([10, 5]);
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        // Draw pulse ring
        if (pulseRadius > 0) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = 0.6;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius + pulseRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
        
        // Draw continuous pulse for winner
        if (isWinner && this.gameState === 'finished') {
            const time = Date.now() * 0.003;
            const continuousPulse = Math.sin(time) * 10 + 15;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 4;
            this.ctx.globalAlpha = 0.7;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius + continuousPulse, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
        
        // Draw main circle
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw inner circle
        if (isWinner) {
            // Special effect for winner - golden inner circle
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        } else {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        }
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw finger number
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            this.fingers.indexOf(finger) + 1,
            x,
            y
        );
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    drawCountdown() {
        // Draw countdown in the center of the canvas
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Background circle for countdown
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 0.9;
        this.ctx.globalAlpha = pulse;
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
        
        // Countdown number
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 96px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.countdownValue.toString(), centerX, centerY);
        
        // Shadow effect for better visibility
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fillText(this.countdownValue.toString(), centerX, centerY);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    drawSelectionCountdown() {
        // Draw selection countdown in the center of the canvas
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Background circle for selection countdown
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pulsing effect with different color
        const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 0.9;
        this.ctx.globalAlpha = pulse;
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
        
        // Selection countdown number (use current countdownValue)
        const selectionTime = this.countdownValue;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 96px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(selectionTime.toString(), centerX, centerY);
        
        // Shadow effect for better visibility
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fillText(selectionTime.toString(), centerX, centerY);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    drawWaitingMessage() {
        // Draw waiting message in the center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Background with rounded corners
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.beginPath();
        this.ctx.roundRect(centerX - 180, centerY - 25, 360, 50, 25);
        this.ctx.fill();
        
        // Border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(centerX - 180, centerY - 25, 360, 50, 25);
        this.ctx.stroke();
        
        // Message
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 22px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⏸️ Aguardando jogadores...', centerX, centerY);
    }
    
    drawImageNumberDisplay() {
        const elapsed = Date.now() - this.imageNumberDisplay.startTime;
        const progress = elapsed / this.imageNumberDisplay.duration;
        
        // Hide if time is up
        if (progress >= 1) {
            this.imageNumberDisplay.visible = false;
            return;
        }
        
        // Fade out effect
        const alpha = 1 - (progress * 0.3); // Fade to 70% opacity
        
        const centerX = this.canvas.width / 2;
        const topY = 80;
        
        // Background rectangle (smaller and less intrusive)
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`;
        this.ctx.beginPath();
        this.ctx.roundRect(centerX - 60, topY - 25, 120, 50, 10);
        this.ctx.fill();
        
        // Border
        this.ctx.strokeStyle = `rgba(255, 107, 107, ${alpha})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(centerX - 60, topY - 25, 120, 50, 10);
        this.ctx.stroke();
        
        // Number text (smaller)
        this.ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Img: ${this.imageNumberDisplay.number}`, centerX, topY);
        
        // Range info (small text)
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText('(0-3)', centerX, topY + 20);
    }
    
    drawInstructions() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.fillText('👆 Coloque 2+ dedos', centerX, centerY - 60);
        this.ctx.fillText('na tela para começar!', centerX, centerY - 30);
        
        // Show current finger count
        if (this.fingers.length > 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText(`${this.fingers.length} dedo(s) - Precisa de ${this.minFingersToStart}`, centerX, centerY + 10);
        }
        
        // Show keyboard instructions
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('💻 PC: Use ESPAÇO, ENTER ou teclas 1-9', centerX, centerY + 40);
        this.ctx.fillText('📱 Mobile: Toque na tela', centerX, centerY + 65);
        
        // Draw example circles
        const exampleColors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
        exampleColors.forEach((color, index) => {
            const x = centerX - 60 + (index * 60);
            const y = centerY + 100;
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText(index + 1, x, y);
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FingerPickGame();
});

// Prevent zoom on double tap
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
