# Breakout Game

A feature-rich breakout game built with Phaser.js featuring adaptive difficulty, procedural level generation, power-ups, and comprehensive progress tracking.

## Features

### Core Gameplay
- **Paddle Controls**: Keyboard (Arrow Keys, A/D) + Mouse/Touch support
- **Physics-based Ball**: Realistic bounce mechanics with angle adjustment based on paddle hit position
- **Brick System**: Multi-durability bricks with visual feedback

### Levels
- **10 Predefined Levels**: 
  - Levels 1-5: Easy difficulty
  - Levels 6-10: Medium difficulty
- **Infinite Procedural Levels**: Level 11+ with hard difficulty
  - Hybrid template/noise generation algorithm
  - Progressive difficulty scaling
  - Playability validation

### Power-ups
- **Multi-ball**: Clone all active balls (max 12 concurrent)
- **Expand Paddle**: Increase paddle width by 50%
- **Shrink Paddle**: Decrease paddle width by 30%
- **Speed Up**: Increase ball speed by 30%
- **Speed Down**: Decrease ball speed by 30%
- **Extra Life**: Gain an additional life
- **Sticky Paddle**: Catch and release balls
- **Laser**: Shoot bricks from paddle

### Adaptive Difficulty System
- **Fail Assist**: After 3 consecutive deaths:
  - Wider paddle (+20%)
  - Slower ball (-15%)
  - More power-ups (+12%)
  - Weaker bricks (-1 durability)
  
- **Success Challenge**: After 3 levels without death:
  - Faster ball (+10%)
  - Narrower paddle (-12%)
  - Harder bricks (+1 durability)
  - Fewer power-ups (-6%)

- **Precision-based Adjustments**:
  - Low precision (<60%): Assistance provided
  - High precision (>90%): Challenge increased

- **Decay System**: Adjustments gradually revert over time/levels

### Extended Stats Tracking
- **Session Stats**: Play time, balls launched/lost, bricks broken, power-ups collected
- **Performance Metrics**: Precision ratio, hit intervals, paddle movement
- **Progression Tracking**: Fail/success streaks, adaptive adjustments applied

### Persistence
- **localStorage v2**: Saves progress, settings, stats, and adaptive state
- **Migration Support**: Handles schema upgrades from v1
- **Checksum Validation**: Detects corrupted saves
- **Graceful Degradation**: Works without localStorage (private mode)

### UI Features
- **Pause Menu**: 
  - Volume slider with draggable control
  - Mute toggle
  - Restart level
  - Return to main menu
- **HUD**: Score, lives, level, precision, active adjustments
- **Particle Effects**: Brick destruction explosions (can be disabled)

## How to Play

### Controls
- **Keyboard**: Arrow Keys or A/D to move paddle
- **Mouse/Touch**: Follow pointer position (higher priority)
- **Space**: Launch ball
- **ESC**: Pause game

### Objective
- Break all bricks to complete the level
- Catch power-ups for special abilities
- Survive with limited lives
- Achieve the highest score possible

## Installation & Running

### Option 1: Simple Web Server
```powershell
# Navigate to the breakout-v1 directory
cd breakout-v1

# Python 3
python -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Then open http://localhost:8000 in your browser
```

### Option 2: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option 3: Direct File Opening
Simply open `index.html` in a modern web browser (may have limitations with some browsers due to CORS).

## Project Structure

```
breakout-v1/
├── index.html                 # Main HTML entry point
├── src/
│   ├── game.js               # Phaser configuration
│   ├── state.js              # GameState singleton
│   ├── persistence.js        # localStorage service
│   ├── levels.js             # 10 predefined levels
│   ├── proceduralGenerator.js # Infinite level generator
│   ├── adaptiveDifficulty.js # Adaptive difficulty engine
│   └── scenes/
│       ├── BootScene.js      # Initialization & loading
│       ├── MainMenuScene.js  # Main menu
│       ├── GameScene.js      # Main gameplay
│       ├── PauseScene.js     # Pause overlay
│       └── GameOverScene.js  # Game over screen
└── README.md                 # This file
```

## Technical Details

### Technologies
- **Phaser 3.70.0**: Game framework (loaded via CDN)
- **Vanilla JavaScript**: No build tools required
- **localStorage API**: Progress persistence

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires ES6 support

### Performance
- Target: 60 FPS
- Max 12 concurrent balls
- Max 100 particles
- Debounced saves (400ms)

## Customization

### Adjusting Difficulty
Edit values in `src/adaptiveDifficulty.js`:
- `failStreak` threshold (default: 3)
- `successStreak` threshold (default: 3)
- Modifier percentages
- Decay timers

### Creating Custom Levels
Add to `LEVELS` array in `src/levels.js`:
```javascript
{
    id: 11,
    name: "Custom Level",
    difficulty: "medium",
    ballSpeed: 250,
    paddleSpeed: 450,
    paddleWidth: 90,
    powerUpDropRate: 0.18,
    layout: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // ... more rows
    ],
    brickDefinitions: {
        "1": { durability: 2, points: 20, color: 0xFF6B6B }
    }
}
```

### Procedural Generation
Modify `ProceduralGenerator.generate()` in `src/proceduralGenerator.js` to adjust:
- Pattern types
- Density calculations
- Durability scaling
- Validation rules

## Known Limitations

1. **Audio**: Placeholder audio system (no actual sound files included)
2. **Mobile Orientation**: No forced landscape mode
3. **Touch Feedback**: No haptic feedback
4. **Reduced Motion**: Particles can be disabled but no comprehensive accessibility mode

## Future Enhancements

- [ ] Add sound effects and background music
- [ ] Implement daily challenge mode with seeded levels
- [ ] Add tutorial overlay
- [ ] Leaderboard system
- [ ] More power-up types
- [ ] Boss levels with special mechanics
- [ ] Achievements system
- [ ] Screen shake effects
- [ ] Combo multipliers

## License

See LICENSE file in the root directory.

## Credits

Built with Phaser.js (https://phaser.io/)
