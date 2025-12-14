import * as THREE from 'three';
import { state } from './state.js';

export function createClouds() {
    const cloudGeometry = new THREE.SphereGeometry(1, 8, 8);
    const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
        roughness: 1
    });
    for (let i = 0; i < 20; i++) {
        const cloudGroup = new THREE.Group();
        cloudGroup.userData = { speed: 0.002 + Math.random() * 0.003 };
        const numPuffs = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numPuffs; j++) {
            const puff = new THREE.Mesh(cloudGeometry, cloudMaterial.clone());
            const scale = 0.3 + Math.random() * 0.4;
            puff.scale.set(scale * 1.5, scale * 0.6, scale * 1.2);
            puff.position.set(j * 0.6 - numPuffs * 0.3, Math.random() * 0.2, Math.random() * 0.3);
            cloudGroup.add(puff);
        }
        cloudGroup.position.set(
            (Math.random() - 0.5) * 20,
            4 + Math.random() * 5,
            (Math.random() - 0.5) * 20
        );
        state.scene.add(cloudGroup);
        state.clouds.push(cloudGroup);
    }
}

export function createTree(x, z) {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.3, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 0.15, z);
    trunk.castShadow = true;
    group.add(trunk);
    const foliageColors = [0x2d5a27, 0x3a7233, 0x4a8a43];
    for (let i = 0; i < 3; i++) {
        const size = 0.25 - i * 0.06;
        const foliageGeo = new THREE.ConeGeometry(size, 0.3, 8);
        const foliageMat = new THREE.MeshStandardMaterial({
            color: foliageColors[i],
            roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.set(x, 0.3 + i * 0.22, z);
        foliage.castShadow = true;
        group.add(foliage);
    }
    return group;
}

export function createFountain(x, z) {
    const group = new THREE.Group();
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.1, 16);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.set(x, 0.05, z);
    base.receiveShadow = true;
    group.add(base);
    const poolGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.06, 16);
    const waterMat = new THREE.MeshStandardMaterial({
        color: 0x4a90d9,
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.8
    });
    const pool = new THREE.Mesh(poolGeo, waterMat);
    pool.position.set(x, 0.13, z);
    group.add(pool);
    const pillarGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.35, 8);
    const pillar = new THREE.Mesh(pillarGeo, stoneMat);
    pillar.position.set(x, 0.28, z);
    pillar.castShadow = true;
    group.add(pillar);
    const topGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const top = new THREE.Mesh(topGeo, stoneMat);
    top.position.set(x, 0.5, z);
    top.castShadow = true;
    group.add(top);
    return group;
}

export function createLampPost(x, z) {
    const group = new THREE.Group();
    const postGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.6, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8, roughness: 0.3 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(x, 0.3, z);
    post.castShadow = true;
    group.add(post);
    const lampGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(x, 0.65, z);
    group.add(lamp);
    return group;
}
