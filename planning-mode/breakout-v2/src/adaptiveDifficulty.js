// Adaptive difficulty engine
const AdaptiveDifficulty = {
    
    // Evaluate triggers and apply adjustments
    evaluate(context) {
        const now = Date.now();
        
        // Update decay timers
        this.updateDecay(now);
        
        // Evaluate fail streak (assistance)
        if (context.type === 'life-loss') {
            this.evaluateFailAssist();
        }
        
        // Evaluate success streak (challenge)
        if (context.type === 'level-complete') {
            this.evaluateSuccessChallenge();
        }
        
        // Evaluate stagnation
        if (context.type === 'periodic') {
            this.evaluateStagnation(context.rallyTime, context.bricksRemaining);
        }
        
        // Evaluate precision-based adjustments
        if (context.type === 'level-complete') {
            this.evaluatePrecision();
        }
        
        GameState.adaptive.lastEvaluation = now;
        
        // Save changes
        Persistence.save();
    },
    
    // Evaluate fail streak and apply assists
    evaluateFailAssist() {
        const failStreak = GameState.stats.progression.failStreak;
        
        if (failStreak >= 3) {
            // Apply paddle width assist
            if (GameState.adaptive.activeAssists.paddleWidthMod < 1.25) {
                GameState.adaptive.activeAssists.paddleWidthMod = 1.20;
                GameState.adaptive.decayTimers.paddleWidth = Date.now() + 120000; // 120s decay
                GameState.stats.progression.adaptiveAdjustmentsApplied++;
                console.log('Adaptive: Paddle width increased (assist)');
            }
            
            // Apply ball speed reduction
            if (GameState.adaptive.activeAssists.ballSpeedMod > 0.80) {
                GameState.adaptive.activeAssists.ballSpeedMod = 0.85;
                GameState.adaptive.decayTimers.ballSpeed = Date.now() + 120000;
                GameState.stats.progression.adaptiveAdjustmentsApplied++;
                console.log('Adaptive: Ball speed reduced (assist)');
            }
            
            // Increase power-up drop rate
            if (GameState.adaptive.activeAssists.powerUpRateMod < 1.15) {
                GameState.adaptive.activeAssists.powerUpRateMod = 1.12;
                GameState.adaptive.decayTimers.powerUpRate = Date.now() + 120000;
                GameState.stats.progression.adaptiveAdjustmentsApplied++;
                console.log('Adaptive: Power-up rate increased (assist)');
            }
            
            // Reduce brick durability for next level
            if (GameState.adaptive.activeAssists.brickDurabilityMod > -1) {
                GameState.adaptive.activeAssists.brickDurabilityMod = -1;
                console.log('Adaptive: Brick durability reduced (assist)');
            }
        }
    },
    
    // Evaluate success streak and apply challenges
    evaluateSuccessChallenge() {
        const successStreak = GameState.stats.progression.successStreak;
        
        if (successStreak >= 3) {
            // Apply ball speed increase
            if (GameState.adaptive.activeAssists.ballSpeedMod < 1.10) {
                GameState.adaptive.activeAssists.ballSpeedMod = 1.10;
                GameState.adaptive.decayTimers.ballSpeed = Date.now() + 90000; // 90s decay
                GameState.stats.progression.adaptiveAdjustmentsApplied++;
                console.log('Adaptive: Ball speed increased (challenge)');
            }
            
            // Apply paddle width reduction
            if (GameState.adaptive.activeAssists.paddleWidthMod > 0.88) {
                GameState.adaptive.activeAssists.paddleWidthMod = 0.88;
                GameState.adaptive.decayTimers.paddleWidth = Date.now() + 90000;
                GameState.stats.progression.adaptiveAdjustmentsApplied++;
                console.log('Adaptive: Paddle width reduced (challenge)');
            }
            
            // Increase brick durability
            if (GameState.adaptive.activeAssists.brickDurabilityMod < 1) {
                GameState.adaptive.activeAssists.brickDurabilityMod = 1;
                console.log('Adaptive: Brick durability increased (challenge)');
            }
            
            // Reduce power-up drop rate
            if (GameState.adaptive.activeAssists.powerUpRateMod > 0.92) {
                GameState.adaptive.activeAssists.powerUpRateMod = 0.94;
                GameState.adaptive.decayTimers.powerUpRate = Date.now() + 90000;
                GameState.stats.progression.adaptiveAdjustmentsApplied++;
                console.log('Adaptive: Power-up rate reduced (challenge)');
            }
        }
    },
    
    // Evaluate stagnation
    evaluateStagnation(rallyTime, bricksRemaining) {
        if (rallyTime > 10000 && bricksRemaining > 0) {
            // This will be handled in GameScene to nudge ball or spawn power-up
            return { needsHelp: true };
        }
        return { needsHelp: false };
    },
    
    // Evaluate precision-based adjustments
    evaluatePrecision() {
        const precision = GameState.stats.performance.precisionRatio;
        
        if (precision < 60) {
            // Low precision - provide help
            if (GameState.adaptive.activeAssists.paddleWidthMod < 1.08) {
                GameState.adaptive.activeAssists.paddleWidthMod = 1.08;
                GameState.adaptive.decayTimers.paddleWidth = Date.now() + 90000;
                console.log('Adaptive: Paddle width increased (low precision)');
            }
            
            if (GameState.adaptive.activeAssists.brickDurabilityMod > -1) {
                GameState.adaptive.activeAssists.brickDurabilityMod = -1;
                console.log('Adaptive: Brick durability reduced (low precision)');
            }
        } else if (precision > 90) {
            // High precision - add challenge
            if (GameState.adaptive.activeAssists.brickDurabilityMod < 1) {
                GameState.adaptive.activeAssists.brickDurabilityMod = 1;
                console.log('Adaptive: Brick durability increased (high precision)');
            }
        }
    },
    
    // Update decay timers and revert adjustments
    updateDecay(now) {
        const assists = GameState.adaptive.activeAssists;
        const timers = GameState.adaptive.decayTimers;
        
        // Paddle width decay
        if (timers.paddleWidth > 0 && now > timers.paddleWidth) {
            const step = assists.paddleWidthMod > 1.0 ? -0.05 : 0.05;
            assists.paddleWidthMod += step;
            
            if (Math.abs(assists.paddleWidthMod - 1.0) < 0.02) {
                assists.paddleWidthMod = 1.0;
                timers.paddleWidth = 0;
                console.log('Adaptive: Paddle width normalized');
            } else {
                timers.paddleWidth = now + 45000; // Continue decay
            }
        }
        
        // Ball speed decay
        if (timers.ballSpeed > 0 && now > timers.ballSpeed) {
            const step = assists.ballSpeedMod > 1.0 ? -0.05 : 0.05;
            assists.ballSpeedMod += step;
            
            if (Math.abs(assists.ballSpeedMod - 1.0) < 0.02) {
                assists.ballSpeedMod = 1.0;
                timers.ballSpeed = 0;
                console.log('Adaptive: Ball speed normalized');
            } else {
                timers.ballSpeed = now + 45000;
            }
        }
        
        // Power-up rate decay
        if (timers.powerUpRate > 0 && now > timers.powerUpRate) {
            const step = assists.powerUpRateMod > 1.0 ? -0.03 : 0.03;
            assists.powerUpRateMod += step;
            
            if (Math.abs(assists.powerUpRateMod - 1.0) < 0.02) {
                assists.powerUpRateMod = 1.0;
                timers.powerUpRate = 0;
                console.log('Adaptive: Power-up rate normalized');
            } else {
                timers.powerUpRate = now + 45000;
            }
        }
    },
    
    // Get current adjustments summary
    getAdjustments() {
        const assists = GameState.adaptive.activeAssists;
        const active = [];
        
        if (Math.abs(assists.paddleWidthMod - 1.0) > 0.01) {
            active.push(assists.paddleWidthMod > 1.0 ? 'Wider Paddle' : 'Narrower Paddle');
        }
        
        if (Math.abs(assists.ballSpeedMod - 1.0) > 0.01) {
            active.push(assists.ballSpeedMod > 1.0 ? 'Faster Ball' : 'Slower Ball');
        }
        
        if (Math.abs(assists.powerUpRateMod - 1.0) > 0.01) {
            active.push(assists.powerUpRateMod > 1.0 ? 'More Power-ups' : 'Fewer Power-ups');
        }
        
        if (assists.brickDurabilityMod !== 0) {
            active.push(assists.brickDurabilityMod > 0 ? 'Harder Bricks' : 'Weaker Bricks');
        }
        
        return active;
    },
    
    // Apply adjustments to level configuration
    applyToLevel(levelConfig) {
        const assists = GameState.adaptive.activeAssists;
        
        return {
            ...levelConfig,
            ballSpeed: Math.max(120, Math.min(800, levelConfig.ballSpeed * assists.ballSpeedMod)),
            paddleWidth: Math.max(60, Math.min(150, levelConfig.paddleWidth * assists.paddleWidthMod)),
            powerUpDropRate: Math.max(0.05, Math.min(0.30, levelConfig.powerUpDropRate * assists.powerUpRateMod)),
            brickDurabilityMod: assists.brickDurabilityMod
        };
    }
};
