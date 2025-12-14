import * as THREE from 'three';
import { state } from './state.js';

export function createRain() {
    const rainCount = 5000;
    const rainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    const velocities = new Float32Array(rainCount);
    for (let i = 0; i < rainCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 1] = Math.random() * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        velocities[i] = 0.3 + Math.random() * 0.2;
    }
    rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    rainGeometry.userData = { velocities: velocities };
    const rainMaterial = new THREE.PointsMaterial({
        color: 0x6699cc,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });
    state.rainParticles = new THREE.Points(rainGeometry, rainMaterial);
    state.rainParticles.visible = false;
    state.scene.add(state.rainParticles);
}

export function createSnow() {
    const snowCount = 3000;
    const snowGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(snowCount * 3);
    const velocities = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 1] = Math.random() * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        velocities[i * 3] = (Math.random() - 0.5) * 0.01;
        velocities[i * 3 + 1] = 0.02 + Math.random() * 0.02;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    snowGeometry.userData = { velocities: velocities };
    const snowMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        transparent: true,
        opacity: 0.8
    });
    state.snowParticles = new THREE.Points(snowGeometry, snowMaterial);
    state.snowParticles.visible = false;
    state.scene.add(state.snowParticles);
}

export function createSmoke(x, z, height, smellScore) {
    if (smellScore < 20) return null;
    const particleCount = Math.floor(smellScore / 2);
    const smokeGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = x + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = height + Math.random() * 2;
        positions[i * 3 + 2] = z + (Math.random() - 0.5) * 0.5;
        velocities[i * 3] = (Math.random() - 0.5) * 0.005;
        velocities[i * 3 + 1] = 0.01 + Math.random() * 0.02;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    smokeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    smokeGeometry.userData = { velocities, baseX: x, baseZ: z, baseHeight: height };
    let smokeColor;
    if (smellScore < 40) smokeColor = 0xaaaaaa;
    else if (smellScore < 70) smokeColor = 0x666666;
    else smokeColor = 0x332211;
    const smokeMaterial = new THREE.PointsMaterial({
        color: smokeColor,
        size: 0.15,
        transparent: true,
        opacity: Math.min(0.3 + smellScore / 200, 0.7)
    });
    const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
    smoke.visible = false;
    return smoke;
}

export function animateWeather() {
    if (state.rainParticles && state.rainVisible) {
        const positions = state.rainParticles.geometry.attributes.position.array;
        const velocities = state.rainParticles.geometry.userData.velocities;
        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3 + 1] -= velocities[i];
            if (positions[i * 3 + 1] < 0) {
                positions[i * 3 + 1] = 20;
                positions[i * 3] = (Math.random() - 0.5) * 60;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
            }
        }
        state.rainParticles.geometry.attributes.position.needsUpdate = true;
    }
    if (state.snowParticles && state.snowVisible) {
        const positions = state.snowParticles.geometry.attributes.position.array;
        const velocities = state.snowParticles.geometry.userData.velocities;
        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3] += velocities[i * 3];
            positions[i * 3 + 1] -= velocities[i * 3 + 1];
            positions[i * 3 + 2] += velocities[i * 3 + 2];
            if (positions[i * 3 + 1] < 0) {
                positions[i * 3 + 1] = 20;
                positions[i * 3] = (Math.random() - 0.5) * 60;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
            }
        }
        state.snowParticles.geometry.attributes.position.needsUpdate = true;
    }
    if (state.smokeVisible) {
        state.smokeParticles.forEach(smoke => {
            if (smoke.visible) {
                const positions = smoke.geometry.attributes.position.array;
                const userData = smoke.geometry.userData;
                const velocities = userData.velocities;
                for (let i = 0; i < positions.length / 3; i++) {
                    positions[i * 3] += velocities[i * 3];
                    positions[i * 3 + 1] += velocities[i * 3 + 1];
                    positions[i * 3 + 2] += velocities[i * 3 + 2];
                    if (positions[i * 3 + 1] > userData.baseHeight + 4) {
                        positions[i * 3] = userData.baseX + (Math.random() - 0.5) * 0.5;
                        positions[i * 3 + 1] = userData.baseHeight;
                        positions[i * 3 + 2] = userData.baseZ + (Math.random() - 0.5) * 0.5;
                    }
                }
                smoke.geometry.attributes.position.needsUpdate = true;
            }
        });
    }
}
