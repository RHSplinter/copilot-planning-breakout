// GameOverScene - Game over screen with stats
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }
    
    init(data) {
        this.finalScore = data.score || 0;
        this.finalLevel = data.level || 1;
        this.won = data.won || false;
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);
        
        // Title
        const titleText = this.won ? 'VICTORY!' : 'GAME OVER';
        const titleColor = this.won ? '#00ff00' : '#ff0000';
        
        this.add.text(width / 2, height * 0.15, titleText, {
            fontSize: '64px',
            fill: titleColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Stats
        const stats = [
            `Final Score: ${this.finalScore}`,
            `Level Reached: ${this.finalLevel}`,
            ``,
            `High Score: ${GameState.progress.highScore}`,
            ``,
            `Bricks Broken: ${GameState.stats.session.bricksBroken}`,
            `Balls Launched: ${GameState.stats.session.ballsLaunched}`,
            `Balls Lost: ${GameState.stats.session.ballsLost}`,
            `Power-ups Collected: ${GameState.stats.session.powerUpsCollected}`,
            ``,
            `Precision: ${GameState.stats.performance.precisionRatio}%`,
            `Max Concurrent Balls: ${GameState.stats.session.maxConcurrentBalls}`
        ];
        
        this.add.text(width / 2, height * 0.35, stats.join('\n'), {
            fontSize: '18px',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5, 0);
        
        // New high score indicator
        if (this.finalScore === GameState.progress.highScore && this.finalScore > 0) {
            this.add.text(width / 2, height * 0.28, '🏆 NEW HIGH SCORE! 🏆', {
                fontSize: '24px',
                fill: '#ffdd00',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }
        
        // Buttons
        this.createButton(width / 2, height * 0.80, 'PLAY AGAIN', () => {
            this.playAgain();
        });
        
        this.createButton(width / 2, height * 0.88, 'MAIN MENU', () => {
            this.goToMenu();
        });
    }
    
    createButton(x, y, text, callback) {
        const button = this.add.text(x, y, text, {
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#4a4a6a',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        button.on('pointerover', () => {
            button.setStyle({ fill: '#00f2ff' });
        });
        
        button.on('pointerout', () => {
            button.setStyle({ fill: '#ffffff' });
        });
        
        button.on('pointerdown', callback);
        
        return button;
    }
    
    playAgain() {
        // Reset for new game
        GameState.resetSession();
        GameState.progress.currentLevel = 1;
        GameState.progress.score = 0;
        GameState.progress.lives = 3;
        
        this.scene.start('GameScene', { level: 1 });
    }
    
    goToMenu() {
        this.scene.start('MainMenuScene');
    }
}
