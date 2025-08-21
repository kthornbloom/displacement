export class LevelManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.levels = [];
        this.currentLevel = 1;
    }

    async init() {
        console.log('Initializing Level Manager...');
        
        // Initialize default levels
        this.initializeLevels();
        
        // Load saved progress
        await this.loadProgress();
        
        console.log('Level Manager initialized');
    }

    initializeLevels() {
        // Create default level data
        this.levels = [
            {
                number: 1,
                name: "Tutorial Cube",
                modelPath: "/glb/rubix2.glb",
                unlocked: true,
                completed: false,
                bestMoves: null,
                bestTime: null,
                lastPlayed: null,
                description: "Learn the basics of cube manipulation"
            },
            {
                number: 2,
                name: "Simple Scramble",
                modelPath: "/glb/rubix2.glb",
                unlocked: false,
                completed: false,
                bestMoves: null,
                bestTime: null,
                lastPlayed: null,
                description: "A slightly more challenging puzzle"
            },
            {
                number: 3,
                name: "Intermediate Challenge",
                modelPath: "/glb/rubix2.glb",
                unlocked: false,
                completed: false,
                bestMoves: null,
                bestTime: null,
                lastPlayed: null,
                description: "Test your cube-solving skills"
            },
            {
                number: 4,
                name: "Advanced Puzzle",
                modelPath: "/glb/rubix2.glb",
                unlocked: false,
                completed: false,
                bestMoves: null,
                bestTime: null,
                lastPlayed: null,
                description: "For experienced puzzle solvers"
            },
            {
                number: 5,
                name: "Expert Level",
                modelPath: "/glb/rubix2.glb",
                unlocked: false,
                completed: false,
                bestMoves: null,
                bestTime: null,
                lastPlayed: null,
                description: "The ultimate challenge"
            }
        ];
    }

    async loadProgress() {
        // Skip loading progress for now
        console.log('Skipping progress loading - storage not available');
    }

    async saveProgress() {
        // Skip saving progress for now
        console.log('Skipping progress saving - storage not available');
    }

    async getLevel(levelNumber) {
        const level = this.levels.find(l => l.number === levelNumber);
        if (!level) {
            throw new Error(`Level ${levelNumber} not found`);
        }
        
        if (!level.unlocked) {
            throw new Error(`Level ${levelNumber} is locked`);
        }
        
        // Update last played timestamp
        level.lastPlayed = Date.now();
        // Skip saving for now
        
        return level;
    }

    getAllLevels() {
        return this.levels;
    }

    async completeLevel(levelNumber, stats) {
        const level = this.levels.find(l => l.number === levelNumber);
        if (!level) return;
        
        level.completed = true;
        level.lastPlayed = Date.now();
        
        // Update best stats if better
        if (!level.bestMoves || stats.moves < level.bestMoves) {
            level.bestMoves = stats.moves;
        }
        
        if (!level.bestTime || stats.time < level.bestTime) {
            level.bestTime = stats.time;
        }
        
        // Skip saving for now
        
        // Unlock next level
        await this.unlockLevel(levelNumber + 1);
    }

    async unlockLevel(levelNumber) {
        const level = this.levels.find(l => l.number === levelNumber);
        if (level && !level.unlocked) {
            level.unlocked = true;
            // Skip saving for now
            console.log(`Level ${levelNumber} unlocked!`);
        }
    }

    async isLevelUnlocked(levelNumber) {
        const level = this.levels.find(l => l.number === levelNumber);
        return level ? level.unlocked : false;
    }

    async isLevelCompleted(levelNumber) {
        const level = this.levels.find(l => l.number === levelNumber);
        return level ? level.completed : false;
    }

    getCurrentLevel() {
        return this.currentLevel;
    }

    setCurrentLevel(levelNumber) {
        this.currentLevel = levelNumber;
    }

    getLevelStats(levelNumber) {
        const level = this.levels.find(l => l.number === levelNumber);
        if (!level) return null;
        
        return {
            bestMoves: level.bestMoves,
            bestTime: level.bestTime,
            completed: level.completed,
            lastPlayed: level.lastPlayed
        };
    }

    getAllStats() {
        const stats = {
            totalLevels: this.levels.length,
            completedLevels: this.levels.filter(l => l.completed).length,
            unlockedLevels: this.levels.filter(l => l.unlocked).length,
            totalMoves: 0,
            totalTime: 0,
            averageMoves: 0,
            averageTime: 0
        };
        
        const completedLevels = this.levels.filter(l => l.completed);
        
        if (completedLevels.length > 0) {
            stats.totalMoves = completedLevels.reduce((sum, l) => sum + (l.bestMoves || 0), 0);
            stats.totalTime = completedLevels.reduce((sum, l) => sum + (l.bestTime || 0), 0);
            stats.averageMoves = Math.round(stats.totalMoves / completedLevels.length);
            stats.averageTime = Math.round(stats.totalTime / completedLevels.length);
        }
        
        return stats;
    }

    // Utility methods for level management
    resetAllProgress() {
        this.levels.forEach(level => {
            level.completed = false;
            level.bestMoves = null;
            level.bestTime = null;
            level.lastPlayed = null;
            level.unlocked = level.number === 1; // Only first level unlocked
        });
        
        this.saveProgress();
    }

    unlockAllLevels() {
        this.levels.forEach(level => {
            level.unlocked = true;
        });
        
        this.saveProgress();
    }

    // Method to add new levels dynamically
    addLevel(levelData) {
        const newLevel = {
            number: this.levels.length + 1,
            unlocked: false,
            completed: false,
            bestMoves: null,
            bestTime: null,
            lastPlayed: null,
            ...levelData
        };
        
        this.levels.push(newLevel);
        this.saveProgress();
        
        return newLevel;
    }
} 