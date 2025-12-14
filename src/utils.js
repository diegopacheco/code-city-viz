import * as THREE from 'three';

export function generateVibrantColor(index, total) {
    const hue = (index / total) * 360;
    const saturation = 70 + Math.random() * 20;
    const lightness = 45 + Math.random() * 15;
    return new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
}

export function isTestFile(filePath) {
    const path = filePath.toLowerCase();
    const testPatterns = [
        /test/, /spec/, /_test\./, /\.test\./, /tests\//, /spec\//,
        /__tests__/, /testing/, /\.spec\./, /_spec\./
    ];
    return testPatterns.some(pattern => pattern.test(path));
}

export function generateSpiralPositions(count, gridSize) {
    const positions = [];
    const centerX = Math.floor(gridSize / 2);
    const centerZ = Math.floor(gridSize / 2);
    let x = centerX, z = centerZ;
    let dx = 0, dz = -1;
    let stepsInDir = 1, stepsTaken = 0, dirChanges = 0;
    for (let i = 0; i < count; i++) {
        positions.push({ row: z, col: x });
        stepsTaken++;
        if (stepsTaken === stepsInDir) {
            stepsTaken = 0;
            const temp = dx;
            dx = -dz;
            dz = temp;
            dirChanges++;
            if (dirChanges % 2 === 0) stepsInDir++;
        }
        x += dx;
        z += dz;
    }
    return positions;
}
