// PauseScene - Pause overlay with volume control and restart
class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
        this.volumeSlider = null;
        this.volumeKnob = null;
        this.isDragging = false;
    }
    
    create(data) {
        const { width, height } = this.cameras.main;
        
        // Semi-transparent background
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0).setInteractive();
        
        // Pause title
        this.add.text(width / 2, height * 0.25, 'PAUSED', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Resume button
        this.createButton(width / 2, height * 0.4, 'RESUME', () => {
            this.resumeGame();
        });
        
        // Restart level button
        this.createButton(width / 2, height * 0.5, 'RESTART LEVEL', () => {
            this.restartLevel();
        });
        
        // Main menu button
        this.createButton(width / 2, height * 0.6, 'MAIN MENU', () => {
            this.goToMenu();
        });
        
        // Volume control
        this.add.text(width / 2, height * 0.72, 'Volume', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.createVolumeSlider(width / 2, height * 0.78);
        
        // Mute toggle
        const muteText = GameState.settings.muted ? 'UNMUTE' : 'MUTE';
        this.muteButton = this.createButton(width / 2, height * 0.88, muteText, () => {
            this.toggleMute();
        });
        
        // Controls reminder
        if (!data?.auto) {
            this.add.text(width / 2, height - 20, 'Press ESC to resume', {
                fontSize: '14px',
                fill: '#aaaaaa'
            }).setOrigin(0.5, 1);
        }
        
        // Setup ESC key
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeGame();
        });
    }
    
    createButton(x, y, text, callback) {
        const button = this.add.text(x, y, text, {
            fontSize: '24px',
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
    
    createVolumeSlider(centerX, centerY) {
        const sliderWidth = 200;
        const sliderHeight = 10;
        const knobRadius = 12;
        
        // Track
        this.volumeSlider = this.add.rectangle(
            centerX, centerY, 
            sliderWidth, sliderHeight, 
            0x555555
        );
        
        // Filled portion
        const fillWidth = sliderWidth * GameState.settings.volume;
        this.volumeFill = this.add.rectangle(
            centerX - sliderWidth / 2 + fillWidth / 2, centerY,
            fillWidth, sliderHeight,
            0x00f2ff
        );
        
        // Knob
        const knobX = centerX - sliderWidth / 2 + sliderWidth * GameState.settings.volume;
        this.volumeKnob = this.add.circle(knobX, centerY, knobRadius, 0xffffff)
            .setInteractive({ draggable: true });
        
        // Drag events
        this.volumeKnob.on('drag', (pointer, dragX, dragY) => {
            const minX = centerX - sliderWidth / 2;
            const maxX = centerX + sliderWidth / 2;
            const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
            
            this.volumeKnob.x = clampedX;
            
            // Update volume
            const volume = (clampedX - minX) / sliderWidth;
            GameState.settings.volume = Phaser.Math.Clamp(volume, 0, 1);
            this.sound.volume = GameState.settings.volume;
            
            // Update fill
            const fillWidth = sliderWidth * GameState.settings.volume;
            this.volumeFill.setSize(fillWidth, sliderHeight);
            this.volumeFill.x = centerX - sliderWidth / 2 + fillWidth / 2;
            
            this.isDragging = true;
        });
        
        this.volumeKnob.on('dragend', () => {
            if (this.isDragging) {
                // Save settings
                Persistence.save();
                this.isDragging = false;
            }
        });
        
        // Volume percentage display
        this.volumeText = this.add.text(centerX + sliderWidth / 2 + 20, centerY, 
            `${Math.round(GameState.settings.volume * 100)}%`, {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        
        // Update text on drag
        this.volumeKnob.on('drag', () => {
            this.volumeText.setText(`${Math.round(GameState.settings.volume * 100)}%`);
        });
    }
    
    toggleMute() {
        GameState.settings.muted = !GameState.settings.muted;
        this.sound.mute = GameState.settings.muted;
        
        const muteText = GameState.settings.muted ? 'UNMUTE' : 'MUTE';
        this.muteButton.setText(muteText);
        
        Persistence.save();
    }
    
    resumeGame() {
        this.scene.stop();
        this.scene.resume('GameScene');
        
        const gameScene = this.scene.get('GameScene');
        if (gameScene.physics) {
            gameScene.physics.world.resume();
        }
    }
    
    restartLevel() {
        // Reset lives for level restart
        const currentLevel = GameState.progress.currentLevel;
        
        this.scene.stop();
        this.scene.stop('GameScene');
        this.scene.start('GameScene', { level: currentLevel });
    }
    
    goToMenu() {
        // Save before going to menu
        Persistence.save(true);
        
        this.scene.stop();
        this.scene.stop('GameScene');
        this.scene.start('MainMenuScene');
    }
}
