// 10 Predefined levels with progressive difficulty
const LEVELS = [
    // LEVEL 1 - Easy: Simple rows
    {
        id: 1,
        name: "Getting Started",
        difficulty: "easy",
        ballSpeed: 180,
        paddleSpeed: 450,
        paddleWidth: 100,
        powerUpDropRate: 0.25,
        layout: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        brickDefinitions: {
            "1": { durability: 1, points: 10, color: 0xFF6B6B },
            "2": { durability: 1, points: 15, color: 0x4ECDC4 }
        }
    },
    
    // LEVEL 2 - Easy: Pyramid
    {
        id: 2,
        name: "Pyramid",
        difficulty: "easy",
        ballSpeed: 190,
        paddleSpeed: 450,
        paddleWidth: 100,
        powerUpDropRate: 0.23,
        layout: [
            [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 1, 2, 2, 1, 0, 0, 0],
            [0, 0, 1, 2, 3, 3, 2, 1, 0, 0],
            [0, 1, 2, 3, 1, 1, 3, 2, 1, 0],
            [1, 2, 3, 1, 2, 2, 1, 3, 2, 1]
        ],
        brickDefinitions: {
            "1": { durability: 1, points: 10, color: 0xFFE66D },
            "2": { durability: 1, points: 15, color: 0xFF6B6B },
            "3": { durability: 2, points: 25, color: 0xC44569 }
        }
    },
    
    // LEVEL 3 - Easy: Checkerboard
    {
        id: 3,
        name: "Checkerboard",
        difficulty: "easy",
        ballSpeed: 200,
        paddleSpeed: 450,
        paddleWidth: 95,
        powerUpDropRate: 0.22,
        layout: [
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
        ],
        brickDefinitions: {
            "1": { durability: 1, points: 10, color: 0x4ECDC4 },
            "2": { durability: 1, points: 15, color: 0x556270 }
        }
    },
    
    // LEVEL 4 - Easy: Diamond
    {
        id: 4,
        name: "Diamond",
        difficulty: "easy",
        ballSpeed: 210,
        paddleSpeed: 450,
        paddleWidth: 95,
        powerUpDropRate: 0.20,
        layout: [
            [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 2, 1, 1, 2, 0, 0, 0],
            [0, 0, 3, 2, 1, 1, 2, 3, 0, 0],
            [0, 0, 0, 2, 1, 1, 2, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 0, 0, 0, 0]
        ],
        brickDefinitions: {
            "1": { durability: 1, points: 10, color: 0xF38181 },
            "2": { durability: 2, points: 20, color: 0xAA96DA },
            "3": { durability: 2, points: 30, color: 0xFCBAD3 }
        }
    },
    
    // LEVEL 5 - Easy: Side channels
    {
        id: 5,
        name: "Side Channels",
        difficulty: "easy",
        ballSpeed: 220,
        paddleSpeed: 450,
        paddleWidth: 90,
        powerUpDropRate: 0.20,
        layout: [
            [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
            [2, 2, 0, 0, 0, 0, 0, 0, 2, 2],
            [1, 1, 0, 3, 3, 3, 3, 0, 1, 1],
            [2, 2, 0, 3, 3, 3, 3, 0, 2, 2],
            [1, 1, 0, 0, 0, 0, 0, 0, 1, 1]
        ],
        brickDefinitions: {
            "1": { durability: 1, points: 10, color: 0x95E1D3 },
            "2": { durability: 2, points: 20, color: 0xF38181 },
            "3": { durability: 1, points: 15, color: 0xEAFAFA }
        }
    },
    
    // LEVEL 6 - Medium: Fortress
    {
        id: 6,
        name: "Fortress",
        difficulty: "medium",
        ballSpeed: 240,
        paddleSpeed: 450,
        paddleWidth: 90,
        powerUpDropRate: 0.18,
        layout: [
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
            [3, 0, 2, 2, 2, 2, 2, 2, 0, 3],
            [3, 0, 2, 1, 1, 1, 1, 2, 0, 3],
            [3, 0, 2, 1, 0, 0, 1, 2, 0, 3],
            [3, 0, 2, 2, 2, 2, 2, 2, 0, 3]
        ],
        brickDefinitions: {
            "1": { durability: 1, points: 15, color: 0xFFE66D },
            "2": { durability: 2, points: 25, color: 0xFF6B6B },
            "3": { durability: 3, points: 40, color: 0x8B4789 }
        }
    },
    
    // LEVEL 7 - Medium: Maze
    {
        id: 7,
        name: "Maze",
        difficulty: "medium",
        ballSpeed: 255,
        paddleSpeed: 450,
        paddleWidth: 85,
        powerUpDropRate: 0.17,
        layout: [
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
            [3, 0, 3, 0, 3, 0, 3, 0, 3, 0],
            [3, 2, 3, 2, 3, 2, 3, 2, 3, 2],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
        ],
        brickDefinitions: {
            "1": { durability: 2, points: 20, color: 0x4ECDC4 },
            "2": { durability: 1, points: 10, color: 0xC7ECEE },
            "3": { durability: 3, points: 35, color: 0x222831 }
        }
    },
    
    // LEVEL 8 - Medium: Stripes
    {
        id: 8,
        name: "Stripes",
        difficulty: "medium",
        ballSpeed: 265,
        paddleSpeed: 450,
        paddleWidth: 85,
        powerUpDropRate: 0.16,
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
        ],
        brickDefinitions: {
            "1": { durability: 1, points: 15, color: 0xFD7272 },
            "2": { durability: 2, points: 25, color: 0xF9B5AC },
            "3": { durability: 3, points: 40, color: 0xEE6A5F }
        }
    },
    
    // LEVEL 9 - Medium: Concentric
    {
        id: 9,
        name: "Concentric",
        difficulty: "medium",
        ballSpeed: 275,
        paddleSpeed: 450,
        paddleWidth: 80,
        powerUpDropRate: 0.15,
        layout: [
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 2, 2, 2, 2, 2, 2, 2, 2, 3],
            [3, 2, 1, 1, 1, 1, 1, 1, 2, 3],
            [3, 2, 1, 0, 0, 0, 0, 1, 2, 3],
            [3, 2, 1, 1, 1, 1, 1, 1, 2, 3],
            [3, 2, 2, 2, 2, 2, 2, 2, 2, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
        ],
        brickDefinitions: {
            "1": { durability: 1, points: 15, color: 0xF7DC6F },
            "2": { durability: 2, points: 30, color: 0xF39C12 },
            "3": { durability: 3, points: 50, color: 0xD68910 }
        }
    },
    
    // LEVEL 10 - Medium: Cross Pattern
    {
        id: 10,
        name: "The Cross",
        difficulty: "medium",
        ballSpeed: 280,
        paddleSpeed: 450,
        paddleWidth: 80,
        powerUpDropRate: 0.15,
        layout: [
            [0, 0, 0, 3, 3, 3, 3, 0, 0, 0],
            [0, 0, 0, 2, 2, 2, 2, 0, 0, 0],
            [3, 2, 1, 1, 1, 1, 1, 1, 2, 3],
            [3, 2, 1, 1, 1, 1, 1, 1, 2, 3],
            [3, 2, 1, 1, 1, 1, 1, 1, 2, 3],
            [3, 2, 1, 1, 1, 1, 1, 1, 2, 3],
            [0, 0, 0, 2, 2, 2, 2, 0, 0, 0],
            [0, 0, 0, 3, 3, 3, 3, 0, 0, 0]
        ],
        brickDefinitions: {
            "1": { durability: 2, points: 25, color: 0x85C1E2 },
            "2": { durability: 3, points: 40, color: 0x3498DB },
            "3": { durability: 3, points: 60, color: 0x1B4F72 }
        }
    }
];
