// BootScene - Initialize game and load saved data
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    preload() {
        // Create loading text
        const { width, height } = this.cameras.main;
        const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Generate particle texture for brick destruction
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
        
        // Note: Audio would be loaded here if we had audio files
        // For now, we'll use empty sound placeholders
        // this.load.audio('sfx-paddle', ['assets/audio/paddle.ogg', 'assets/audio/paddle.mp3']);
        // this.load.audio('sfx-brick', ['assets/audio/brick.ogg', 'assets/audio/brick.mp3']);
        // etc.
    }
    
    create() {
        // Load saved data
        const savedData = Persistence.load();
        
        // Apply to GameState
        GameState.progress = savedData.progress;
        GameState.settings = savedData.settings;
        GameState.stats = savedData.stats;
        GameState.adaptive = savedData.adaptive;
        
        // Apply audio settings
        this.sound.volume = GameState.settings.volume;
        this.sound.mute = GameState.settings.muted;
        
        // Create placeholder sounds (would be real audio files in production)
        this.game.registry.set('sounds', {
            paddle: null,
            brick: null,
            wall: null,
            powerup: null,
            lose: null,
            win: null
        });
        
        // Setup auto-pause on visibility change
        this.game.events.on('hidden', () => {
            if (this.scene.isActive('GameScene')) {
                this.scene.pause('GameScene');
                this.scene.launch('PauseScene', { auto: true });
            }
        });
        
        // Start main menu
        this.scene.start('MainMenuScene');
    }
}
