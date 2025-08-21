export class StorageManager {
    constructor() {
        this.storagePrefix = 'puzzle_app_';
        this.isInitialized = false;
    }

    async init() {
        console.log('Initializing Storage Manager...');
        
        try {
            // Check if localStorage is available
            if (!this.isStorageAvailable()) {
                throw new Error('localStorage is not available');
            }
            
            // Simple test to ensure storage works
            const testKey = '__storage_test__';
            const testValue = 'test';
            
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            if (retrieved !== testValue) {
                throw new Error('Storage test failed');
            }
            
            this.isInitialized = true;
            console.log('Storage Manager initialized successfully');
        } catch (error) {
            console.error('Storage Manager initialization failed:', error.message);
            throw error;
        }
    }

    async set(key, value) {
        if (!this.isInitialized) {
            throw new Error('Storage Manager not initialized');
        }
        
        const fullKey = this.storagePrefix + key;
        
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(fullKey, serializedValue);
        } catch (error) {
            console.error(`Failed to save to storage: ${error.message}`);
            throw error;
        }
    }

    async get(key) {
        if (!this.isInitialized) {
            throw new Error('Storage Manager not initialized');
        }
        
        const fullKey = this.storagePrefix + key;
        
        try {
            const item = localStorage.getItem(fullKey);
            if (item === null) {
                return null;
            }
            
            return JSON.parse(item);
        } catch (error) {
            console.error(`Failed to retrieve from storage: ${error.message}`);
            throw error;
        }
    }

    async remove(key) {
        if (!this.isInitialized) {
            throw new Error('Storage Manager not initialized');
        }
        
        const fullKey = this.storagePrefix + key;
        
        try {
            localStorage.removeItem(fullKey);
        } catch (error) {
            console.error(`Failed to remove from storage: ${error.message}`);
            throw error;
        }
    }

    async clear() {
        if (!this.isInitialized) {
            throw new Error('Storage Manager not initialized');
        }
        
        try {
            const keysToRemove = [];
            
            // Find all keys with our prefix
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove all keys with our prefix
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error(`Failed to clear storage: ${error.message}`);
            throw error;
        }
    }

    async has(key) {
        if (!this.isInitialized) {
            throw new Error('Storage Manager not initialized');
        }
        
        const fullKey = this.storagePrefix + key;
        return localStorage.getItem(fullKey) !== null;
    }

    async getAllKeys() {
        if (!this.isInitialized) {
            throw new Error('Storage Manager not initialized');
        }
        
        const keys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.storagePrefix)) {
                // Remove prefix from key
                const cleanKey = key.substring(this.storagePrefix.length);
                keys.push(cleanKey);
            }
        }
        
        return keys;
    }

    async getStorageSize() {
        if (!this.isInitialized) {
            throw new Error('Storage Manager not initialized');
        }
        
        let totalSize = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.storagePrefix)) {
                const value = localStorage.getItem(key);
                totalSize += key.length + (value ? value.length : 0);
            }
        }
        
        return totalSize;
    }

    // Utility methods for common game data
    async saveGameProgress(progress) {
        return this.set('gameProgress', progress);
    }

    async loadGameProgress() {
        return this.get('gameProgress');
    }

    async saveSettings(settings) {
        return this.set('settings', settings);
    }

    async loadSettings() {
        return this.get('settings');
    }

    async saveHighScores(scores) {
        return this.set('highScores', scores);
    }

    async loadHighScores() {
        return this.get('highScores');
    }

    // Backup and restore functionality
    async exportData() {
        if (!this.isInitialized) {
            throw new Error('Storage Manager not initialized');
        }
        
        const data = {};
        const keys = await this.getAllKeys();
        
        for (const key of keys) {
            data[key] = await this.get(key);
        }
        
        return data;
    }

    async importData(data) {
        if (!this.isInitialized) {
            throw new Error('Storage Manager not initialized');
        }
        
        // Clear existing data
        await this.clear();
        
        // Import new data
        for (const [key, value] of Object.entries(data)) {
            await this.set(key, value);
        }
    }

    // Check storage availability
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Get storage quota information (if available)
    async getStorageQuota() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                return {
                    usage: estimate.usage || 0,
                    quota: estimate.quota || 0,
                    percentage: estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0
                };
            } catch (error) {
                console.warn('Could not get storage quota:', error);
                return null;
            }
        }
        
        return null;
    }
} 