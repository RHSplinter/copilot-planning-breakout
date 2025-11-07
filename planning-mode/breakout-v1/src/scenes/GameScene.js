// GameScene - Main gameplay scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        this.paddle = null;
        this.balls = null;
        this.bricks = null;
        this.powerUps = null;
        this.bullets = null;
        
        this.currentLevel = null;
        this.levelConfig = null;
        
        // Input
        this.cursors = null;
        this.activeControl = null; // 'pointer' or 'keyboard'
        this.controlPointer = null;
        
        // Power-up state
        this.activePowerUps = {
            stickyPaddle: false,
            laser: false,
            multiBall: false
        };
        this.powerUpTimers = {};
        
        // Particles
        this.particleEmitter = null;
        
        // HUD
        this.scoreText = null;
        this.livesText = null;
        this.levelText = null;
        this.statsText = null;
        this.adaptiveText = null;
    }
    
    init(data) {
        this.currentLevel = data.level || 1;
        GameState.progress.currentLevel = this.currentLevel;
        GameState.session.levelStartTime = Date.now();
        GameState.session.rallyStartTime = Date.now();
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Load level configuration
        this.loadLevel();
        
        // Create particle emitter
        this.particleEmitter = this.add.particles(0, 0, 'particle', {
            lifespan: 800,
            speed: { min: 150, max: 250 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: 400,
            frequency: -1,
            emitting: false,
            maxParticles: 100
        });
        
        // Create groups
        this.balls = this.physics.add.group();
        this.bricks = this.physics.add.group();
        this.powerUps = this.physics.add.group();
        this.bullets = this.physics.add.group();
        
        // Create paddle
        this.createPaddle();
        
        // Create bricks
        this.createBricks();
        
        // Create initial ball
        this.createBall(width / 2, height - 60, true);
        
        // Setup input
        this.setupInput();
        
        // Setup collisions
        this.setupCollisions();
        
        // Create HUD
        this.createHUD();
        
        // Setup pause key
        this.input.keyboard.on('keydown-ESC', () => {
            this.pauseGame();
        });
    }
    
    loadLevel() {
        // Get base level config
        let config;
        if (this.currentLevel <= 10) {
            config = LEVELS[this.currentLevel - 1];
        } else {
            config = ProceduralGenerator.generate(this.currentLevel);
        }
        
        // Apply adaptive difficulty adjustments
        this.levelConfig = AdaptiveDifficulty.applyToLevel(config);
    }
    
    createPaddle() {
        const { width, height } = this.cameras.main;
        const paddleWidth = this.levelConfig.paddleWidth;
        const paddleHeight = 15;
        
        this.paddle = this.add.rectangle(
            width / 2, 
            height - 30, 
            paddleWidth, 
            paddleHeight, 
            0x00f2ff
        );
        
        this.physics.add.existing(this.paddle);
        this.paddle.body.setImmovable(true);
        this.paddle.body.setCollideWorldBounds(true);
    }
    
    createBricks() {
        const layout = this.levelConfig.layout;
        const definitions = this.levelConfig.brickDefinitions;
        const brickWidth = 70;
        const brickHeight = 25;
        const padding = 5;
        const offsetX = 35;
        const offsetY = 80;
        
        for (let row = 0; row < layout.length; row++) {
            for (let col = 0; col < layout[row].length; col++) {
                const brickType = layout[row][col];
                
                if (brickType !== 0) {
                    const def = definitions[brickType.toString()];
                    if (def) {
                        const x = offsetX + col * (brickWidth + padding);
                        const y = offsetY + row * (brickHeight + padding);
                        
                        // Apply durability modifier
                        let durability = def.durability + this.levelConfig.brickDurabilityMod;
                        durability = Math.max(1, Math.min(5, durability));
                        
                        const brick = this.add.rectangle(x, y, brickWidth, brickHeight, def.color);
                        this.physics.add.existing(brick);
                        brick.body.setImmovable(true);
                        
                        brick.setData('durability', durability);
                        brick.setData('maxDurability', durability);
                        brick.setData('points', def.points);
                        brick.setData('color', def.color);
                        
                        this.bricks.add(brick);
                    }
                }
            }
        }
    }
    
    createBall(x, y, attachToPaddle = false) {
        const ball = this.add.circle(x, y, 8, 0xffffff);
        this.physics.add.existing(ball);
        
        ball.body.setCollideWorldBounds(true);
        ball.body.setBounce(1, 1);
        ball.body.setMaxSpeed(600);
        
        ball.setData('attached', attachToPaddle);
        ball.setData('speed', this.levelConfig.ballSpeed);
        
        if (!attachToPaddle) {
            const angle = Phaser.Math.Between(-45, 45);
            this.physics.velocityFromAngle(angle - 90, ball.getData('speed'), ball.body.velocity);
        }
        
        this.balls.add(ball);
        GameState.session.currentBalls = this.balls.getLength();
        GameState.stats.session.maxConcurrentBalls = Math.max(
            GameState.stats.session.maxConcurrentBalls,
            GameState.session.currentBalls
        );
        
        return ball;
    }
    
    setupInput() {
        // Keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.addKey('A');
        this.input.keyboard.addKey('D');
        
        // Pointer/Touch
        this.input.on('pointerdown', (pointer) => {
            this.activeControl = 'pointer';
            this.controlPointer = pointer;
            
            // Launch attached balls
            this.balls.children.entries.forEach(ball => {
                if (ball.getData('attached')) {
                    this.launchBall(ball);
                }
            });
        });
        
        this.input.on('pointerup', () => {
            this.activeControl = null;
            this.controlPointer = null;
        });
        
        this.input.on('pointerupoutside', () => {
            this.activeControl = null;
            this.controlPointer = null;
        });
        
        // Launch ball with spacebar
        this.input.keyboard.on('keydown-SPACE', () => {
            this.balls.children.entries.forEach(ball => {
                if (ball.getData('attached')) {
                    this.launchBall(ball);
                }
            });
        });
    }
    
    launchBall(ball) {
        ball.setData('attached', false);
        const angle = Phaser.Math.Between(-45, 45);
        this.physics.velocityFromAngle(angle - 90, ball.getData('speed'), ball.body.velocity);
        GameState.stats.session.ballsLaunched++;
    }
    
    setupCollisions() {
        // Ball vs Paddle
        this.physics.add.collider(this.balls, this.paddle, this.hitPaddle, null, this);
        
        // Ball vs Bricks
        this.physics.add.collider(this.balls, this.bricks, this.hitBrick, null, this);
        
        // Ball vs world bounds (check for bottom)
        this.physics.world.on('worldbounds', (body) => {
            if (this.balls.contains(body.gameObject) && body.bottom >= this.cameras.main.height) {
                this.loseBall(body.gameObject);
            }
        });
        
        // Paddle vs PowerUps
        this.physics.add.overlap(this.paddle, this.powerUps, this.collectPowerUp, null, this);
        
        // Bullets vs Bricks
        this.physics.add.collider(this.bullets, this.bricks, (bullet, brick) => {
            bullet.destroy();
            this.hitBrick(null, brick);
        }, null, this);
    }
    
    hitPaddle(ball, paddle) {
        // Record hit for stats
        GameState.stats.session.paddleHits++;
        GameState.recordHit();
        GameState.updatePrecision();
        
        // Calculate hit position for angle adjustment
        const diff = ball.x - paddle.x;
        const paddleWidth = paddle.width;
        const normalizedDiff = diff / (paddleWidth / 2); // -1 to 1
        
        // Adjust ball angle based on hit position
        const maxAngle = 60;
        const angle = normalizedDiff * maxAngle;
        
        const speed = ball.getData('speed');
        this.physics.velocityFromAngle(angle - 90, speed, ball.body.velocity);
        
        // Sticky paddle
        if (this.activePowerUps.stickyPaddle && !ball.getData('attached')) {
            ball.setData('attached', true);
        }
    }
    
    hitBrick(ball, brick) {
        const durability = brick.getData('durability') - 1;
        
        if (durability <= 0) {
            // Brick destroyed
            const points = brick.getData('points');
            GameState.progress.score += points;
            GameState.stats.session.bricksBroken++;
            
            // Particle effect
            if (!GameState.settings.reducedMotion) {
                this.particleEmitter.setTint(brick.getData('color'));
                this.particleEmitter.explode(12, brick.x, brick.y);
            }
            
            // Check for power-up drop
            const dropRate = this.levelConfig.powerUpDropRate;
            if (Math.random() < dropRate) {
                this.spawnPowerUp(brick.x, brick.y);
            }
            
            brick.destroy();
            
            // Check level complete
            if (this.bricks.getLength() === 0) {
                this.completeLevel();
            }
        } else {
            // Reduce durability
            brick.setData('durability', durability);
            
            // Visual feedback - darken brick
            const maxDur = brick.getData('maxDurability');
            const ratio = durability / maxDur;
            const baseColor = brick.getData('color');
            const darkenedColor = Phaser.Display.Color.IntegerToColor(baseColor);
            darkenedColor.darken(30 * (1 - ratio));
            brick.setFillStyle(darkenedColor.color);
        }
    }
    
    loseBall(ball) {
        ball.destroy();
        GameState.stats.session.ballsLost++;
        GameState.updatePrecision();
        GameState.session.currentBalls = this.balls.getLength();
        
        // Check if any balls remain
        if (this.balls.getLength() === 0) {
            this.loseLife();
        }
    }
    
    loseLife() {
        GameState.progress.lives--;
        GameState.stats.progression.failStreak++;
        GameState.stats.progression.successStreak = 0;
        
        // Evaluate adaptive difficulty
        AdaptiveDifficulty.evaluate({ type: 'life-loss' });
        
        if (GameState.progress.lives <= 0) {
            this.gameOver();
        } else {
            // Reset ball
            this.createBall(this.cameras.main.width / 2, this.cameras.main.height - 60, true);
            this.updateHUD();
        }
    }
    
    spawnPowerUp(x, y) {
        const types = ['multiBall', 'expandPaddle', 'shrinkPaddle', 'speedUp', 'speedDown', 'extraLife', 'stickyPaddle', 'laser'];
        const type = Phaser.Utils.Array.GetRandom(types);
        
        const colors = {
            multiBall: 0xff6b6b,
            expandPaddle: 0x4ecdc4,
            shrinkPaddle: 0xf9ca24,
            speedUp: 0xff9ff3,
            speedDown: 0x48dbfb,
            extraLife: 0x00d2d3,
            stickyPaddle: 0xfeca57,
            laser: 0xff6348
        };
        
        const powerUp = this.add.circle(x, y, 12, colors[type]);
        this.physics.add.existing(powerUp);
        powerUp.body.setVelocity(0, 100);
        powerUp.setData('type', type);
        
        this.powerUps.add(powerUp);
    }
    
    collectPowerUp(paddle, powerUp) {
        const type = powerUp.getData('type');
        GameState.stats.session.powerUpsCollected++;
        
        powerUp.destroy();
        this.activatePowerUp(type);
    }
    
    activatePowerUp(type) {
        const duration = 10000; // 10 seconds
        
        switch (type) {
            case 'multiBall':
                this.activateMultiBall();
                break;
                
            case 'expandPaddle':
                this.activateExpandPaddle(duration);
                break;
                
            case 'shrinkPaddle':
                this.activateShrinkPaddle(duration);
                break;
                
            case 'speedUp':
                this.activateSpeedChange(1.3, duration);
                break;
                
            case 'speedDown':
                this.activateSpeedChange(0.7, duration);
                break;
                
            case 'extraLife':
                GameState.progress.lives++;
                this.updateHUD();
                break;
                
            case 'stickyPaddle':
                this.activateStickyPaddle(duration);
                break;
                
            case 'laser':
                this.activateLaser(duration);
                break;
        }
    }
    
    activateMultiBall() {
        GameState.stats.session.multiBallEvents++;
        const ballCount = this.balls.getLength();
        
        if (ballCount < 12) {
            this.balls.children.entries.slice().forEach(ball => {
                if (!ball.getData('attached')) {
                    const newBall = this.createBall(ball.x, ball.y, false);
                    const angle = Phaser.Math.Between(0, 360);
                    this.physics.velocityFromAngle(angle, ball.getData('speed'), newBall.body.velocity);
                }
            });
        }
    }
    
    activateExpandPaddle(duration) {
        if (this.powerUpTimers.paddleSize) {
            this.powerUpTimers.paddleSize.remove();
        }
        
        this.paddle.setSize(this.paddle.width * 1.5, this.paddle.height);
        
        this.powerUpTimers.paddleSize = this.time.delayedCall(duration, () => {
            this.paddle.setSize(this.levelConfig.paddleWidth, this.paddle.height);
        });
    }
    
    activateShrinkPaddle(duration) {
        if (this.powerUpTimers.paddleSize) {
            this.powerUpTimers.paddleSize.remove();
        }
        
        this.paddle.setSize(Math.max(40, this.paddle.width * 0.7), this.paddle.height);
        
        this.powerUpTimers.paddleSize = this.time.delayedCall(duration, () => {
            this.paddle.setSize(this.levelConfig.paddleWidth, this.paddle.height);
        });
    }
    
    activateSpeedChange(multiplier, duration) {
        this.balls.children.entries.forEach(ball => {
            ball.body.velocity.scale(multiplier);
        });
        
        this.time.delayedCall(duration, () => {
            this.balls.children.entries.forEach(ball => {
                ball.body.velocity.scale(1 / multiplier);
            });
        });
    }
    
    activateStickyPaddle(duration) {
        this.activePowerUps.stickyPaddle = true;
        
        this.time.delayedCall(duration, () => {
            this.activePowerUps.stickyPaddle = false;
        });
    }
    
    activateLaser(duration) {
        this.activePowerUps.laser = true;
        
        const shootInterval = this.time.addEvent({
            delay: 300,
            callback: () => {
                if (this.activePowerUps.laser) {
                    this.shootLaser();
                }
            },
            loop: true
        });
        
        this.time.delayedCall(duration, () => {
            this.activePowerUps.laser = false;
            shootInterval.remove();
        });
    }
    
    shootLaser() {
        GameState.stats.session.laserShots++;
        
        const bullet = this.add.rectangle(this.paddle.x, this.paddle.y - 20, 4, 15, 0xff0000);
        this.physics.add.existing(bullet);
        bullet.body.setVelocity(0, -400);
        
        this.bullets.add(bullet);
        
        // Remove bullet if it goes off screen
        this.time.delayedCall(2000, () => {
            if (bullet.active) {
                bullet.destroy();
            }
        });
    }
    
    createHUD() {
        const { width } = this.cameras.main;
        
        this.scoreText = this.add.text(10, 10, `Score: ${GameState.progress.score}`, {
            fontSize: '20px',
            fill: '#ffffff'
        });
        
        this.livesText = this.add.text(10, 35, `Lives: ${GameState.progress.lives}`, {
            fontSize: '20px',
            fill: '#ffffff'
        });
        
        this.levelText = this.add.text(width - 10, 10, `Level: ${this.currentLevel}`, {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(1, 0);
        
        this.statsText = this.add.text(width - 10, 35, '', {
            fontSize: '16px',
            fill: '#aaaaaa'
        }).setOrigin(1, 0);
        
        this.adaptiveText = this.add.text(width / 2, 10, '', {
            fontSize: '14px',
            fill: '#ffdd00'
        }).setOrigin(0.5, 0);
        
        this.updateHUD();
    }
    
    updateHUD() {
        this.scoreText.setText(`Score: ${GameState.progress.score}`);
        this.livesText.setText(`Lives: ${GameState.progress.lives}`);
        this.levelText.setText(`Level: ${this.currentLevel}`);
        
        const precision = GameState.stats.performance.precisionRatio;
        this.statsText.setText(`Precision: ${precision}%`);
        
        const adjustments = AdaptiveDifficulty.getAdjustments();
        if (adjustments.length > 0) {
            this.adaptiveText.setText(`Active: ${adjustments.join(', ')}`);
        } else {
            this.adaptiveText.setText('');
        }
    }
    
    completeLevel() {
        GameState.stats.progression.successStreak++;
        GameState.stats.progression.failStreak = 0;
        GameState.progress.levelsCompleted++;
        
        // Update high score
        if (GameState.progress.score > GameState.progress.highScore) {
            GameState.progress.highScore = GameState.progress.score;
        }
        
        // Update unlocked level
        if (this.currentLevel >= GameState.progress.unlockedLevel) {
            GameState.progress.unlockedLevel = this.currentLevel + 1;
        }
        
        // Evaluate adaptive difficulty
        AdaptiveDifficulty.evaluate({ type: 'level-complete' });
        
        // Save progress
        Persistence.save();
        
        // Go to next level
        this.time.delayedCall(1000, () => {
            this.scene.restart({ level: this.currentLevel + 1 });
        });
    }
    
    gameOver() {
        // Save final stats
        Persistence.save(true);
        
        this.scene.start('GameOverScene', {
            score: GameState.progress.score,
            level: this.currentLevel,
            won: false
        });
    }
    
    pauseGame() {
        this.scene.pause();
        this.scene.launch('PauseScene');
    }
    
    update(time, delta) {
        // Update paddle position
        this.updatePaddle();
        
        // Update attached balls
        this.balls.children.entries.forEach(ball => {
            if (ball.getData('attached')) {
                ball.x = this.paddle.x;
                ball.y = this.paddle.y - 20;
            }
        });
        
        // Clean up off-screen power-ups
        this.powerUps.children.entries.forEach(powerUp => {
            if (powerUp.y > this.cameras.main.height) {
                powerUp.destroy();
            }
        });
        
        // Clean up off-screen bullets
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.y < 0) {
                bullet.destroy();
            }
        });
        
        // Update stats
        GameState.session.currentBalls = this.balls.getLength();
        
        // Periodic adaptive evaluation (every 5 seconds)
        if (time - GameState.adaptive.lastEvaluation > 5000) {
            const rallyTime = Date.now() - GameState.session.rallyStartTime;
            AdaptiveDifficulty.evaluate({
                type: 'periodic',
                rallyTime: rallyTime,
                bricksRemaining: this.bricks.getLength()
            });
        }
        
        // Update HUD
        this.updateHUD();
    }
    
    updatePaddle() {
        const speed = this.levelConfig.paddleSpeed;
        
        // Pointer control (higher priority)
        if (this.activeControl === 'pointer' && this.controlPointer) {
            const targetX = this.controlPointer.x;
            const currentX = this.paddle.x;
            
            // Smooth lerp
            this.paddle.x += (targetX - currentX) * 0.35;
            
            // Clamp to bounds
            const halfWidth = this.paddle.width / 2;
            this.paddle.x = Phaser.Math.Clamp(this.paddle.x, halfWidth, this.cameras.main.width - halfWidth);
        }
        // Keyboard control
        else {
            if (this.cursors.left.isDown || this.input.keyboard.addKey('A').isDown) {
                this.paddle.x -= speed * 0.016; // Approximate delta
            } else if (this.cursors.right.isDown || this.input.keyboard.addKey('D').isDown) {
                this.paddle.x += speed * 0.016;
            }
            
            // Clamp to bounds
            const halfWidth = this.paddle.width / 2;
            this.paddle.x = Phaser.Math.Clamp(this.paddle.x, halfWidth, this.cameras.main.width - halfWidth);
        }
        
        // Track paddle movement distance
        if (this.paddle.body.prevPosition) {
            const distance = Phaser.Math.Distance.Between(
                this.paddle.x, this.paddle.y,
                this.paddle.body.prevPosition.x, this.paddle.body.prevPosition.y
            );
            GameState.stats.performance.paddleMoveDistance += distance;
        }
    }
}
