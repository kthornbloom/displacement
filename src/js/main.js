import { GameEngine } from './game/GameEngine.js';
import { UIManager } from './ui/UIManager.js';
import { LevelManager } from './game/LevelManager.js';

class PuzzleApp {
    constructor() {
        this.gameEngine = null;
        this.uiManager = null;
        this.levelManager = null;
        this.storageManager = null;
        this.currentLevel = 1;
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('=== NEW VERSION LOADED ===');
            console.log('Initializing Puzzle App...');
            
            // Skip storage for now - initialize with null
            this.storageManager = null;
            console.log('Storage manager set to null');
            
            // Initialize level manager with null storage
            this.levelManager = new LevelManager(null);
            await this.levelManager.init();
            console.log('Level manager initialized');
            
            // Initialize UI manager
            this.uiManager = new UIManager(this);
            await this.uiManager.init();
            console.log('UI manager initialized');
            
            // Initialize game engine
            this.gameEngine = new GameEngine(this);
            await this.gameEngine.init();
            console.log('Game engine initialized');
            
            // Load current level
            await this.loadLevel(this.currentLevel);
            
            // Hide loading screen and show game
            this.hideLoadingScreen();
            this.showGame();
            
            this.isInitialized = true;
            console.log('Puzzle App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Puzzle App:', error);
            console.error('Error details:', error.message, error.stack);
            this.showError(`Failed to initialize app: ${error.message}`);
        }
    }

    async loadLevel(levelNumber) {
        try {
            console.log(`Loading level ${levelNumber}...`);
            
            // Update current level
            this.currentLevel = levelNumber;
            
            // Load level data
            const levelData = await this.levelManager.getLevel(levelNumber);
            if (!levelData) {
                throw new Error(`Level ${levelNumber} not found`);
            }
            
            // Update UI
            this.uiManager.updateLevelInfo(levelNumber);
            this.uiManager.updateLevelGrid();
            
            // Load level in game engine
            await this.gameEngine.loadLevel(levelData);
            
            console.log(`Level ${levelNumber} loaded successfully`);
            
        } catch (error) {
            console.error(`Failed to load level ${levelNumber}:`, error);
            this.showError(`Failed to load level ${levelNumber}`);
        }
    }

    async nextLevel() {
        const nextLevelNumber = this.currentLevel + 1;
        if (await this.levelManager.isLevelUnlocked(nextLevelNumber)) {
            await this.loadLevel(nextLevelNumber);
        }
    }

    async resetLevel() {
        await this.loadLevel(this.currentLevel);
    }

    onLevelComplete(stats) {
        console.log('Level completed with stats:', stats);
        
        // Save level completion
        this.levelManager.completeLevel(this.currentLevel, stats);
        
        // Show victory modal
        this.uiManager.showVictoryModal(stats);
        
        // Unlock next level if possible
        this.levelManager.unlockLevel(this.currentLevel + 1);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        
        if (loadingScreen && gameContainer) {
            loadingScreen.classList.add('hidden');
            gameContainer.classList.remove('hidden');
        }
    }

    showGame() {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
        }
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper error modal
        console.error(message);
    }

    // Getters for other modules
    getGameEngine() {
        return this.gameEngine;
    }

    getUIManager() {
        return this.uiManager;
    }

    getLevelManager() {
        return this.levelManager;
    }

    getStorageManager() {
        return this.storageManager;
    }

    getCurrentLevel() {
        return this.currentLevel;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new PuzzleApp();
    await app.init();
    
    // Make app globally accessible for debugging
    window.puzzleApp = app;
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.puzzleApp && window.puzzleApp.gameEngine) {
        window.puzzleApp.gameEngine.handleResize();
    }
});

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Prevent zoom on double tap (mobile)
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false); 