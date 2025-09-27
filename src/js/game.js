class FingerPickGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resetBtn = document.getElementById('resetBtn');
        this.countdownEl = document.getElementById('countdown');
        this.winnerEl = document.getElementById('winner');
        this.countdownTimeSelect = document.getElementById('countdownTime');
        
        this.fingers = [];
        this.gameState = 'waiting'; // waiting, counting, finished
        this.countdownValue = 5;
        this.countdownInterval = null;
        this.minFingersToStart = 2; // Mínimo de dedos para iniciar
        this.colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
            '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
            '#10ac84', '#ee5a24', '#0984e3', '#6c5ce7', '#a29bfe'
        ];
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.draw();
    }
    
    setupCanvas() {
        // Responsive canvas sizing
        const updateCanvasSize = () => {
            const container = this.canvas.parentElement;
            const maxWidth = Math.min(container.clientWidth - 40, 600);
            const maxHeight = Math.min(window.innerHeight * 0.6, 500);
            
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
        
        // Button events
        this.resetBtn.addEventListener('click', () => this.resetGame());
        
        // Prevent context menu on long press
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleTouch(e) {
        e.preventDefault();
        
        // Allow adding fingers during counting, but not during finished state
        if (this.gameState === 'finished') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const touches = Array.from(e.changedTouches);
        
        touches.forEach(touch => {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Check if touch is within canvas bounds
            if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
                this.addFinger(x, y, touch.identifier);
            }
        });
    }
    
    handleMouse(e) {
        // Allow adding fingers during counting, but not during finished state
        if (this.gameState === 'finished') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.addFinger(x, y, 'mouse');
    }
    
    addFinger(x, y, id) {
        // Check if finger already exists (prevent multiple touches from same finger)
        if (this.fingers.find(f => f.id === id)) return;
        
        const color = this.colors[this.fingers.length % this.colors.length];
        const finger = {
            id,
            x,
            y,
            color,
            radius: 45,
            pulseRadius: 0,
            isWinner: false
        };
        
        this.fingers.push(finger);
        this.draw();
        
        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Auto-start logic
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
        if (this.gameState === 'waiting') {
            // Start countdown if we have enough fingers
            if (this.fingers.length >= this.minFingersToStart) {
                this.startGame();
            }
        } else if (this.gameState === 'counting') {
            // Pause countdown if we don't have enough fingers
            if (this.fingers.length < this.minFingersToStart) {
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
            this.resumeCountdown();
        }
    }
    
    resumeCountdown() {
        // Hide the "Aguardando jogadores" message
        this.countdownEl.classList.add('hidden');
        
        // Restart countdown from the beginning
        this.countdownValue = parseInt(this.countdownTimeSelect.value);
        this.startCountdown();
    }
    
    pauseCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        this.countdownEl.textContent = '⏸️ Aguardando jogadores...';
        this.countdownEl.classList.remove('hidden');
        
        // Ensure the display is updated
        this.draw();
    }
    
    startGame() {
        if (this.fingers.length < this.minFingersToStart) {
            return; // Not enough fingers
        }
        
        this.gameState = 'counting';
        this.resetBtn.disabled = false;
        
        // Get countdown time from settings
        this.countdownValue = parseInt(this.countdownTimeSelect.value);
        
        this.startCountdown();
    }
    
    startCountdown() {
        this.countdownEl.textContent = this.countdownValue;
        this.countdownEl.classList.remove('hidden');
        
        this.countdownInterval = setInterval(() => {
            this.countdownValue--;
            this.countdownEl.textContent = this.countdownValue;
            
            if (this.countdownValue <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    endGame() {
        clearInterval(this.countdownInterval);
        this.gameState = 'finished';
        
        // Select random winner
        const winnerIndex = Math.floor(Math.random() * this.fingers.length);
        const winner = this.fingers[winnerIndex];
        winner.isWinner = true;
        
        console.log('Jogo terminado, vencedor selecionado:', winner);
        
        // Remove all fingers except the winner
        this.fingers = [winner];
        
        // Hide countdown, show winner
        this.countdownEl.classList.add('hidden');
        this.showWinner(winner);
        
        // Add event listener for winner finger removal
        this.setupWinnerRemovalListener(winner);
        
        // Haptic feedback for winner
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
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
        this.winnerEl.innerHTML = `
            <div style="color: ${winner.color}; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                🎉 DEDO VENCEDOR! 🎉
            </div>
        `;
        this.winnerEl.classList.remove('hidden');
        
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
        
        // Clear the winner check interval
        if (this.winnerCheckInterval) {
            clearInterval(this.winnerCheckInterval);
            this.winnerCheckInterval = null;
        }
        
        // Hide the winner message
        this.winnerEl.classList.add('hidden');
        
        // Show random final image
        if (window.SupabaseConfig && window.SupabaseConfig.showFinalImage) {
            console.log('Chamando showFinalImage');
            window.SupabaseConfig.showFinalImage();
        } else {
            console.log('SupabaseConfig não disponível, usando fallback');
            // Fallback: show a simple celebration
            this.showFallbackCelebration();
        }
    }
    
    showFallbackCelebration() {
        // Create a simple celebration modal
        const modal = document.createElement('div');
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
        
        const content = document.createElement('div');
        content.style.cssText = `
            text-align: center;
            color: white;
            font-size: 2rem;
            animation: scaleIn 0.5s ease;
        `;
        content.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
            <div>Parabéns ao vencedor!</div>
            <div style="font-size: 1.2rem; margin-top: 1rem; opacity: 0.8;">
                Clique para fechar
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Auto-close after 3 seconds
        setTimeout(() => {
            if (modal.parentNode) modal.remove();
        }, 3000);
        
        // Close on click
        modal.onclick = () => modal.remove();
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
        this.gameState = 'waiting';
        this.fingers = [];
        this.countdownValue = parseInt(this.countdownTimeSelect.value);
        
        this.resetBtn.disabled = true;
        
        this.countdownEl.classList.add('hidden');
        this.winnerEl.classList.add('hidden');
        
        this.draw();
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background pattern
        this.drawBackground();
        
        // Draw fingers
        this.fingers.forEach(finger => {
            this.drawFinger(finger);
        });
        
        // Draw instructions if no fingers
        if (this.fingers.length === 0) {
            this.drawInstructions();
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
        const { x, y, color, radius, pulseRadius, isWinner } = finger;
        
        // Draw outer glow for winner
        if (isWinner) {
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 30;
        } else {
            this.ctx.shadowBlur = 0;
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
    
    drawInstructions() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.fillText('👆 Coloque 2+ dedos', centerX, centerY - 40);
        this.ctx.fillText('na tela para começar!', centerX, centerY - 10);
        
        // Show current finger count
        if (this.fingers.length > 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText(`${this.fingers.length} dedo(s) - Precisa de ${this.minFingersToStart}`, centerX, centerY + 20);
        }
        
        // Draw example circles
        const exampleColors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
        exampleColors.forEach((color, index) => {
            const x = centerX - 60 + (index * 60);
            const y = centerY + 80;
            
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
