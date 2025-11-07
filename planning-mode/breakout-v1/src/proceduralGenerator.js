// Procedural level generator for infinite hard mode (level 11+)
const ProceduralGenerator = {
    
    // Generate a procedural level for hard difficulty
    generate(levelNumber) {
        const difficulty = this.calculateDifficulty(levelNumber);
        const layout = this.generateLayout(levelNumber, difficulty);
        
        return {
            id: levelNumber,
            name: `Hard Level ${levelNumber - 10}`,
            difficulty: "hard",
            ballSpeed: difficulty.ballSpeed,
            paddleSpeed: 450,
            paddleWidth: difficulty.paddleWidth,
            powerUpDropRate: difficulty.powerUpDropRate,
            layout: layout.grid,
            brickDefinitions: layout.definitions
        };
    },
    
    // Calculate difficulty parameters based on level number
    calculateDifficulty(levelNumber) {
        const level = levelNumber;
        
        return {
            ballSpeed: Math.min(800, 400 + ((level - 10) * 20)),
            paddleWidth: Math.max(60, 80 - ((level - 10) * 1.5)),
            brickDensity: Math.min(0.85, 0.65 + ((level - 10) * 0.015)),
            averageDurability: Math.min(5, 2 + Math.floor((level - 10) / 4)),
            powerUpDropRate: Math.max(0.05, 0.12 - ((level - 10) * 0.003)),
            rows: Math.min(12, 8 + Math.floor((level - 10) / 3))
        };
    },
    
    // Generate layout using hybrid template/noise approach
    generateLayout(levelNumber, difficulty) {
        const cols = 10;
        const rows = difficulty.rows;
        
        // Choose pattern type based on level
        const patternType = levelNumber % 5;
        
        let grid;
        switch (patternType) {
            case 0:
                grid = this.generateBossPattern(rows, cols, difficulty);
                break;
            case 1:
                grid = this.generateNoisePattern(rows, cols, difficulty);
                break;
            case 2:
                grid = this.generateSymmetricPattern(rows, cols, difficulty);
                break;
            case 3:
                grid = this.generateLayeredPattern(rows, cols, difficulty);
                break;
            default:
                grid = this.generateMixedPattern(rows, cols, difficulty);
        }
        
        // Validate and adjust if needed
        if (!this.validateLayout(grid, difficulty)) {
            grid = this.generateSafePattern(rows, cols, difficulty);
        }
        
        // Create brick definitions based on difficulty
        const definitions = this.createBrickDefinitions(difficulty);
        
        return { grid, definitions };
    },
    
    // Boss pattern - dense fortress-like layout
    generateBossPattern(rows, cols, difficulty) {
        const grid = [];
        const avgDur = difficulty.averageDurability;
        
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                // Create fortress walls
                if (c === 0 || c === cols - 1 || r === 0) {
                    row.push(Math.min(5, avgDur + 1));
                } else if (r < rows / 2) {
                    row.push(Math.random() < 0.8 ? avgDur : 0);
                } else {
                    row.push(Math.random() < difficulty.brickDensity ? avgDur - 1 : 0);
                }
            }
            grid.push(row);
        }
        
        return grid;
    },
    
    // Noise-based pattern
    generateNoisePattern(rows, cols, difficulty) {
        const grid = [];
        const avgDur = difficulty.averageDurability;
        
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                const noise = this.simpleNoise(r * 0.3, c * 0.3);
                
                if (noise > (1 - difficulty.brickDensity)) {
                    const durability = Math.max(1, Math.min(5, 
                        avgDur + Math.floor((noise - 0.5) * 3)
                    ));
                    row.push(durability);
                } else {
                    row.push(0);
                }
            }
            grid.push(row);
        }
        
        return grid;
    },
    
    // Symmetric mirrored pattern
    generateSymmetricPattern(rows, cols, difficulty) {
        const grid = [];
        const avgDur = difficulty.averageDurability;
        const halfCols = Math.floor(cols / 2);
        
        for (let r = 0; r < rows; r++) {
            const row = [];
            
            // Generate left half
            for (let c = 0; c < halfCols; c++) {
                if (Math.random() < difficulty.brickDensity) {
                    row.push(Math.max(1, avgDur + Math.floor(Math.random() * 3 - 1)));
                } else {
                    row.push(0);
                }
            }
            
            // Mirror to right half
            for (let c = halfCols; c < cols; c++) {
                const mirrorIndex = cols - 1 - c;
                row.push(row[mirrorIndex]);
            }
            
            grid.push(row);
        }
        
        return grid;
    },
    
    // Layered pattern with increasing difficulty
    generateLayeredPattern(rows, cols, difficulty) {
        const grid = [];
        const avgDur = difficulty.averageDurability;
        
        for (let r = 0; r < rows; r++) {
            const row = [];
            const layerDurability = Math.max(1, Math.min(5, 
                Math.floor(avgDur + (r / rows) * 2)
            ));
            
            for (let c = 0; c < cols; c++) {
                const density = difficulty.brickDensity - (r / rows) * 0.2;
                row.push(Math.random() < density ? layerDurability : 0);
            }
            grid.push(row);
        }
        
        return grid;
    },
    
    // Mixed pattern combining techniques
    generateMixedPattern(rows, cols, difficulty) {
        const grid = [];
        const avgDur = difficulty.averageDurability;
        
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                // Checkerboard base
                const isCheckerSquare = (r + c) % 2 === 0;
                const baseDensity = isCheckerSquare ? difficulty.brickDensity : difficulty.brickDensity * 0.6;
                
                if (Math.random() < baseDensity) {
                    row.push(Math.max(1, Math.min(5, 
                        avgDur + Math.floor(Math.random() * 3 - 1)
                    )));
                } else {
                    row.push(0);
                }
            }
            grid.push(row);
        }
        
        return grid;
    },
    
    // Safe fallback pattern
    generateSafePattern(rows, cols, difficulty) {
        const grid = [];
        const avgDur = difficulty.averageDurability;
        
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                // Simple rows with gaps
                if (r % 2 === 0) {
                    row.push(Math.random() < 0.7 ? avgDur : 0);
                } else {
                    row.push(Math.random() < 0.5 ? avgDur - 1 : 0);
                }
            }
            grid.push(row);
        }
        
        return grid;
    },
    
    // Simple noise function (pseudo-random)
    simpleNoise(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
        return n - Math.floor(n);
    },
    
    // Validate layout for playability
    validateLayout(grid, difficulty) {
        let totalCells = 0;
        let filledCells = 0;
        
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                totalCells++;
                if (grid[r][c] > 0) filledCells++;
            }
        }
        
        const actualDensity = filledCells / totalCells;
        
        // Check density is within reasonable range
        if (actualDensity < 0.3 || actualDensity > 0.9) {
            return false;
        }
        
        // Check bottom rows aren't too dense (allow ball escape)
        const bottomRows = 2;
        let bottomDensity = 0;
        let bottomCells = 0;
        
        for (let r = grid.length - bottomRows; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                bottomCells++;
                if (grid[r][c] > 0) bottomDensity++;
            }
        }
        
        if (bottomDensity / bottomCells > 0.5) {
            return false;
        }
        
        return true;
    },
    
    // Create brick definitions with appropriate colors
    createBrickDefinitions(difficulty) {
        const definitions = {};
        const maxDur = Math.min(5, difficulty.averageDurability + 2);
        
        const colors = [
            0xFF6B6B, // red
            0xF9A826, // orange
            0xF7DC6F, // yellow
            0x52C41A, // green
            0x4ECDC4, // cyan
            0x3498DB, // blue
            0x9B59B6, // purple
            0xE91E63, // pink
            0x795548  // brown
        ];
        
        for (let dur = 1; dur <= maxDur; dur++) {
            definitions[dur.toString()] = {
                durability: dur,
                points: dur * 20,
                color: colors[Math.min(dur - 1, colors.length - 1)]
            };
        }
        
        return definitions;
    }
};
