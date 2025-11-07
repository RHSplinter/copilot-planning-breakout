// Global game state singleton
const GameState = {
    // Progress tracking
    progress: {
        currentLevel: 1,
        highScore: 0,
        unlockedLevel: 1,
        levelsCompleted: 0,
        score: 0,
        lives: 3
    },
    
    // Settings
    settings: {
        volume: 0.7,
        muted: false,
        reducedMotion: false,
        showStats: false
    },
    
    // Extended stats
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
    
    // Adaptive difficulty state
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
    },
    
    // Temporary session data (not persisted)
    session: {
        gameStartTime: 0,
        levelStartTime: 0,
        lastHitTime: 0,
        hitIntervals: [],
        rallyStartTime: 0,
        currentBalls: 1
    },
    
    // Reset session-specific data
    resetSession() {
        this.progress.score = 0;
        this.progress.lives = 3;
        this.session.gameStartTime = Date.now();
        this.session.levelStartTime = Date.now();
        this.session.lastHitTime = 0;
        this.session.hitIntervals = [];
        this.session.rallyStartTime = Date.now();
        this.session.currentBalls = 1;
        
        // Reset stats for new game
        this.stats.session.playTime = 0;
        this.stats.session.ballsLaunched = 0;
        this.stats.session.ballsLost = 0;
        this.stats.session.bricksBroken = 0;
        this.stats.session.powerUpsCollected = 0;
        this.stats.session.multiBallEvents = 0;
        this.stats.session.laserShots = 0;
        this.stats.session.maxConcurrentBalls = 1;
        this.stats.session.paddleHits = 0;
        
        this.stats.progression.failStreak = 0;
        this.stats.progression.successStreak = 0;
    },
    
    // Update precision ratio
    updatePrecision() {
        const total = this.stats.session.paddleHits + this.stats.session.ballsLost;
        this.stats.performance.precisionRatio = total > 0 
            ? Math.round((this.stats.session.paddleHits / total) * 100) 
            : 100;
    },
    
    // Record hit interval
    recordHit() {
        const now = Date.now();
        if (this.session.lastHitTime > 0) {
            const interval = now - this.session.lastHitTime;
            this.session.hitIntervals.push(interval);
            
            // Keep only last 20 intervals for consistency calculation
            if (this.session.hitIntervals.length > 20) {
                this.session.hitIntervals.shift();
            }
            
            // Update average
            const sum = this.session.hitIntervals.reduce((a, b) => a + b, 0);
            this.stats.performance.averageHitInterval = Math.round(sum / this.session.hitIntervals.length);
            
            // Calculate consistency (standard deviation)
            if (this.session.hitIntervals.length > 2) {
                const mean = this.stats.performance.averageHitInterval;
                const squareDiffs = this.session.hitIntervals.map(val => Math.pow(val - mean, 2));
                const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
                this.stats.performance.hitConsistency = Math.round(Math.sqrt(avgSquareDiff));
            }
        }
        this.session.lastHitTime = now;
    }
};
