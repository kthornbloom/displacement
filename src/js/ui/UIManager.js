export class UIManager {
    constructor(app) {
        this.app = app;
        this.timerInterval = null;
        this.startTime = null;
        
        this.setupEventListeners();
    }

    async init() {
        console.log('Initializing UI Manager...');
        // UI is ready
        console.log('UI Manager initialized');
    }

    setupEventListeners() {
        // Menu button
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.showMenuModal());
        }

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.app.resetLevel());
        }

        // Menu modal events
        this.setupMenuModalEvents();
        
        // Levels modal events
        this.setupLevelsModalEvents();
        
        // Victory modal events
        this.setupVictoryModalEvents();
    }

    setupMenuModalEvents() {
        const levelsBtn = document.getElementById('levels-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const statsBtn = document.getElementById('stats-btn');
        const closeMenuBtn = document.getElementById('close-menu-btn');

        if (levelsBtn) {
            levelsBtn.addEventListener('click', () => {
                this.hideMenuModal();
                this.showLevelsModal();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.hideMenuModal();
                this.showSettingsModal();
            });
        }

        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                this.hideMenuModal();
                this.showStatsModal();
            });
        }

        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', () => this.hideMenuModal());
        }
    }

    setupLevelsModalEvents() {
        const closeLevelsBtn = document.getElementById('close-levels-btn');
        if (closeLevelsBtn) {
            closeLevelsBtn.addEventListener('click', () => this.hideLevelsModal());
        }
    }

    setupVictoryModalEvents() {
        const nextLevelBtn = document.getElementById('next-level-btn');
        const replayBtn = document.getElementById('replay-btn');
        const closeVictoryBtn = document.getElementById('close-victory-btn');

        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                this.hideVictoryModal();
                this.app.nextLevel();
            });
        }

        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                this.hideVictoryModal();
                this.app.resetLevel();
            });
        }

        if (closeVictoryBtn) {
            closeVictoryBtn.addEventListener('click', () => this.hideVictoryModal());
        }
    }

    // Modal management
    showMenuModal() {
        const modal = document.getElementById('menu-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideMenuModal() {
        const modal = document.getElementById('menu-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showLevelsModal() {
        const modal = document.getElementById('levels-modal');
        if (modal) {
            this.populateLevelsGrid();
            modal.classList.remove('hidden');
        }
    }

    hideLevelsModal() {
        const modal = document.getElementById('levels-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showVictoryModal(stats) {
        // TEMPORARILY DISABLED - just log to console
        console.log('Victory modal would show with stats:', stats);
        return;
        
        const modal = document.getElementById('victory-modal');
        if (modal) {
            // Update victory stats
            const victoryMoves = document.getElementById('victory-moves');
            const victoryTime = document.getElementById('victory-time');
            
            if (victoryMoves) {
                victoryMoves.textContent = stats.moves;
            }
            
            if (victoryTime) {
                victoryTime.textContent = this.formatTime(stats.time);
            }
            
            modal.classList.remove('hidden');
        }
    }

    hideVictoryModal() {
        const modal = document.getElementById('victory-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showSettingsModal() {
        // TODO: Implement settings modal
        alert('Settings coming soon!');
    }

    showStatsModal() {
        // TODO: Implement stats modal
        alert('Statistics coming soon!');
    }

    // Level grid management
    populateLevelsGrid() {
        const levelsGrid = document.getElementById('levels-grid');
        if (!levelsGrid) return;

        levelsGrid.innerHTML = '';
        
        // Get level data from level manager
        const levelManager = this.app.getLevelManager();
        const levels = levelManager.getAllLevels();
        
        levels.forEach(level => {
            const levelItem = this.createLevelItem(level);
            levelsGrid.appendChild(levelItem);
        });
    }

    createLevelItem(level) {
        const levelItem = document.createElement('div');
        levelItem.className = 'level-item';
        levelItem.textContent = level.number;
        
        // Set state classes
        if (level.completed) {
            levelItem.classList.add('completed');
        } else if (level.unlocked) {
            levelItem.classList.add('unlocked');
        } else {
            levelItem.classList.add('locked');
        }
        
        // Add click handler
        if (level.unlocked) {
            levelItem.addEventListener('click', () => {
                this.hideLevelsModal();
                this.app.loadLevel(level.number);
            });
        }
        
        return levelItem;
    }

    // UI updates
    updateLevelInfo(levelNumber) {
        const levelNumberElement = document.getElementById('level-number');
        if (levelNumberElement) {
            levelNumberElement.textContent = `Level ${levelNumber}`;
        }
    }

    updateMoveCount(moves) {
        const moveCountElement = document.getElementById('move-count');
        if (moveCountElement) {
            moveCountElement.textContent = `Moves: ${moves}`;
        }
    }

    updateLevelGrid() {
        // This will be called when level data changes
        // For now, just repopulate if levels modal is open
        const levelsModal = document.getElementById('levels-modal');
        if (levelsModal && !levelsModal.classList.contains('hidden')) {
            this.populateLevelsGrid();
        }
    }

    // Timer management
    startTimer() {
        this.startTime = Date.now();
        this.updateTimer();
        
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        if (!this.startTime) return;
        
        const elapsed = Date.now() - this.startTime;
        const timerDisplay = document.getElementById('timer-display');
        
        if (timerDisplay) {
            timerDisplay.textContent = this.formatTime(elapsed);
        }
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Utility methods
    showMessage(message, duration = 3000) {
        // Create a temporary message element
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1000;
            font-size: 1.1rem;
        `;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, duration);
    }

    showError(message) {
        this.showMessage(`Error: ${message}`, 5000);
    }

    showSuccess(message) {
        this.showMessage(message, 3000);
    }
} 