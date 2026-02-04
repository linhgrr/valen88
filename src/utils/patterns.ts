// Love words pattern for background
const loveWords = [
    "LOVE",
    "TRUE",
    "FOREVER",
    "ADORE",
    "YOU",
    "MORE",
    "in love",
    "Love you",
    "♡",
    "BE MY FOREVER",
];

export function generateLoveTextPattern() {
    let pattern = "";
    for (let i = 0; i < 50; i++) {
        const shuffled = [...loveWords].sort(() => Math.random() - 0.5);
        pattern += shuffled.join("   ") + "   ";
        if (i % 3 === 0) pattern += "\n";
    }
    return pattern;
}
