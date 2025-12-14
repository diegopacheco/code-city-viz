import * as THREE from 'three';

export function createWindowTexture(baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const color = new THREE.Color(baseColor);
    ctx.fillStyle = color.getStyle();
    ctx.fillRect(0, 0, 128, 512);
    const windowWidth = 16;
    const windowHeight = 24;
    const spacingX = 28;
    const spacingY = 40;
    const offsetX = 10;
    const offsetY = 20;
    for (let y = offsetY; y < 480; y += spacingY) {
        for (let x = offsetX; x < 110; x += spacingX) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillRect(x, y, windowWidth, windowHeight);
            ctx.fillStyle = 'rgba(135,206,235,0.4)';
            ctx.fillRect(x + 2, y + 2, windowWidth - 4, windowHeight - 4);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
}

export function createTextSprite(text, position) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 64;
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 64);
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(text, 258, 34);
    ctx.fillStyle = '#1a365d';
    ctx.fillText(text, 256, 32);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(2.5, 0.35, 1);
    return sprite;
}

export function createCobblestoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(0, 0, 256, 256);
    const stoneColors = ['#a08060', '#9a7a5a', '#8b7355', '#7d6548', '#6b5740'];
    for (let y = 0; y < 256; y += 32) {
        for (let x = 0; x < 256; x += 32) {
            const offsetX = (y % 64 === 0) ? 0 : 16;
            ctx.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)];
            ctx.beginPath();
            ctx.roundRect(x + offsetX + 2, y + 2, 28, 28, 4);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(x + offsetX + 3, y + 3, 26, 2);
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(x + offsetX + 3, y + 26, 26, 2);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}
