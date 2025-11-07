// MainMenuScene - Main menu with start game and options
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);
        
        // Title
        this.add.text(width / 2, height * 0.2, 'BREAKOUT', {
            fontSize: '72px',
            fill: '#00f2ff',
            fontStyle: 'bold',
            stroke: '#0066ff',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(width / 2, height * 0.32, 'Classic Brick Breaking', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // High Score
        if (GameState.progress.highScore > 0) {
            this.add.text(width / 2, height * 0.42, `High Score: ${GameState.progress.highScore}`, {
                fontSize: '20px',
                fill: '#ffdd00'
            }).setOrigin(0.5);
        }
        
        // Start button
        const startBtn = this.createButton(width / 2, height * 0.55, 'START GAME', () => {
            this.startGame();
        });
        
        // Continue button (if progress exists)
        if (GameState.progress.currentLevel > 1) {
            const continueBtn = this.createButton(width / 2, height * 0.65, 
                `CONTINUE (Level ${GameState.progress.currentLevel})`, () => {
                this.continueGame();
            });
        }
        
        // Instructions
        const instructions = [
            'Controls:',
            'Keyboard: Arrow Keys or A/D',
            'Mouse/Touch: Follow pointer',
            '',
            'Press ESC to pause'
        ];
        
        this.add.text(width / 2, height * 0.8, instructions.join('\n'), {
            fontSize: '14px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        // Version
        this.add.text(10, height - 10, 'v2.0', {
            fontSize: '12px',
            fill: '#666666'
        }).setOrigin(0, 1);
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
    
    startGame() {
        // Reset for new game
        GameState.resetSession();
        GameState.progress.currentLevel = 1;
        GameState.progress.score = 0;
        GameState.progress.lives = 3;
        
        this.scene.start('GameScene', { level: 1 });
    }
    
    continueGame() {
        // Continue from saved level
        GameState.resetSession();
        GameState.progress.score = 0;
        GameState.progress.lives = 3;
        
        this.scene.start('GameScene', { level: GameState.progress.currentLevel });
    }
}
