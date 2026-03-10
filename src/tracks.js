export const CHALLENGE_TRACKS = [
    {
        id: 'beginner-slope',
        name: 'The Gentle Slope',
        description: 'A simple downward slope to get you started. Can you reach the end?',
        startPos: { x: 100, y: 100 },
        lines: [
            { x1: 50, y1: 150, x2: 400, y2: 300 },
            { x1: 400, y1: 300, x2: 800, y2: 400 },
            { x1: 800, y1: 400, x2: 1500, y2: 450 }
        ],
        targetDistance: 1200
    },
    {
        id: 'the-jump',
        name: 'The Leap of Faith',
        description: 'Gain speed and clear the gap. Watch out for the landing!',
        startPos: { x: 100, y: 50 },
        lines: [
            { x1: 0, y1: 200, x2: 500, y2: 500 }, // Ramp
            // Gap from 500 to 800
            { x1: 800, y1: 600, x2: 1500, y2: 650 } // Landing
        ],
        targetDistance: 1300
    },
    {
        id: 'roller-coaster',
        name: 'Roller Coaster',
        description: 'Ups and downs. Keep your momentum or you will stall!',
        startPos: { x: 50, y: 300 },
        lines: [
            { x1: 0, y1: 400, x2: 300, y2: 600 },
            { x1: 300, y1: 600, x2: 600, y2: 300 },
            { x1: 600, y1: 300, x2: 900, y2: 600 },
            { x1: 900, y1: 600, x2: 1200, y2: 300 },
            { x1: 1200, y1: 300, x2: 2000, y2: 800 }
        ],
        targetDistance: 1800
    }
];
