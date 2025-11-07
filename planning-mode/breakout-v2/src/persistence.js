// localStorage persistence service with versioning and migration
const Persistence = {
    STORAGE_KEY: 'breakout.save.v2',
    VERSION: 2,
    saveTimeout: null,
    storageAvailable: true,
    
    // Check if localStorage is available
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage unavailable, progress will not be saved');
            return false;
        }
    },
    
    // Compute simple checksum
    computeChecksum(data) {
        const str = JSON.stringify(data);
        return (str.length % 10000).toString(16);
    },
    
    // Load saved data
    load() {
        this.storageAvailable = this.checkAvailability();
        
        if (!this.storageAvailable) {
            return this.getDefaults();
        }
        
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (!saved) {
                return this.getDefaults();
            }
            
            const data = JSON.parse(saved);
            
            // Validate checksum
            const savedChecksum = data.checksum;
            delete data.checksum;
            const computedChecksum = this.computeChecksum(data);
            
            if (savedChecksum !== computedChecksum) {
                console.warn('Save data checksum mismatch, attempting recovery');
                // Continue with potentially corrupt data, will fill in defaults
            }
            
            // Migrate if needed
            if (!data.version || data.version < this.VERSION) {
                console.log('Migrating save data from v' + (data.version || 1) + ' to v' + this.VERSION);
                data = this.migrate(data);
            }
            
            // Merge with defaults to ensure all fields exist
            return this.mergeWithDefaults(data);
            
        } catch (e) {
            console.error('Failed to load save data:', e);
            return this.getDefaults();
        }
    },
    
    // Save data with debouncing
    save(immediate = false) {
        if (!this.storageAvailable) {
            return;
        }
        
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        const doSave = () => {
            try {
                const data = {
                    version: this.VERSION,
                    timestamp: Date.now(),
                    progress: GameState.progress,
                    settings: GameState.settings,
                    stats: GameState.stats,
                    adaptive: GameState.adaptive
                };
                
                data.checksum = this.computeChecksum(data);
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
                
            } catch (e) {
                console.error('Failed to save data:', e);
                if (e.name === 'QuotaExceededError') {
                    console.warn('localStorage quota exceeded');
                }
            }
        };
        
        if (immediate) {
            doSave();
        } else {
            this.saveTimeout = setTimeout(doSave, 400);
        }
    },
    
    // Get default state
    getDefaults() {
        return {
            version: this.VERSION,
            timestamp: Date.now(),
            progress: {
                currentLevel: 1,
                highScore: 0,
                unlockedLevel: 1,
                levelsCompleted: 0,
                score: 0,
                lives: 3
            },
            settings: {
                volume: 0.7,
                muted: false,
                reducedMotion: false,
                showStats: false
            },
            stats: {
                session: {
                    playTime: 0,
                    ballsLaunched: 0,
                    ballsLost: 0,
                    bricksBroken: 0,
                    powerUpsCollected: 0,
                    multiBallEvents: 0,
                    laserShots: 0,
                    maxConcurrentBalls: 1,
                    paddleHits: 0
                },
                performance: {
                    precisionRatio: 100,
                    averageHitInterval: 0,
                    paddleMoveDistance: 0,
                    rallyDuration: 0,
                    clearSpeed: 0,
                    hitConsistency: 0
                },
                progression: {
                    failStreak: 0,
                    successStreak: 0,
                    adaptiveAdjustmentsApplied: 0,
                    assistTimeActive: 0,
                    challengeTimeActive: 0
                }
            },
            adaptive: {
                activeAssists: {
                    paddleWidthMod: 1.0,
                    ballSpeedMod: 1.0,
                    powerUpRateMod: 1.0,
                    brickDurabilityMod: 0
                },
                decayTimers: {
                    paddleWidth: 0,
                    ballSpeed: 0,
                    powerUpRate: 0
                },
                lastEvaluation: 0
            }
        };
    },
    
    // Migrate from v1 to v2
    migrate(data) {
        const defaults = this.getDefaults();
        
        // Preserve v1 fields
        const migrated = {
            version: this.VERSION,
            timestamp: Date.now(),
            progress: data.progress || defaults.progress,
            settings: data.settings || defaults.settings,
            stats: defaults.stats,  // v2 addition
            adaptive: defaults.adaptive  // v2 addition
        };
        
        return migrated;
    },
    
    // Merge loaded data with defaults
    mergeWithDefaults(data) {
        const defaults = this.getDefaults();
        
        return {
            version: this.VERSION,
            timestamp: data.timestamp || Date.now(),
            progress: { ...defaults.progress, ...data.progress },
            settings: { ...defaults.settings, ...data.settings },
            stats: {
                session: { ...defaults.stats.session, ...(data.stats?.session || {}) },
                performance: { ...defaults.stats.performance, ...(data.stats?.performance || {}) },
                progression: { ...defaults.stats.progression, ...(data.stats?.progression || {}) }
            },
            adaptive: {
                activeAssists: { ...defaults.adaptive.activeAssists, ...(data.adaptive?.activeAssists || {}) },
                decayTimers: { ...defaults.adaptive.decayTimers, ...(data.adaptive?.decayTimers || {}) },
                lastEvaluation: data.adaptive?.lastEvaluation || 0
            }
        };
    },
    
    // Clear all saved data
    clear() {
        if (this.storageAvailable) {
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }
};
