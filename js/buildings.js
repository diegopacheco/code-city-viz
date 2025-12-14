import * as THREE from 'three';
import { state } from './state.js';
import { createWindowTexture, createTextSprite } from './textures.js';

export function createBuilding(file, x, z, height, baseColor) {
    const group = new THREE.Group();
    const buildingWidth = 0.9;
    const buildingDepth = 0.9;
    const windowTexture = createWindowTexture(baseColor);
    windowTexture.repeat.set(1, Math.ceil(height / 4));
    const materials = [
        new THREE.MeshStandardMaterial({ map: windowTexture, metalness: 0.1, roughness: 0.7 }),
        new THREE.MeshStandardMaterial({ map: windowTexture, metalness: 0.1, roughness: 0.7 }),
        new THREE.MeshStandardMaterial({ color: baseColor.clone().multiplyScalar(1.1), metalness: 0.2, roughness: 0.5 }),
        new THREE.MeshStandardMaterial({ color: baseColor.clone().multiplyScalar(0.7), metalness: 0.1, roughness: 0.8 }),
        new THREE.MeshStandardMaterial({ map: windowTexture, metalness: 0.1, roughness: 0.7 }),
        new THREE.MeshStandardMaterial({ map: windowTexture, metalness: 0.1, roughness: 0.7 })
    ];
    const geometry = new THREE.BoxGeometry(buildingWidth, height, buildingDepth);
    const building = new THREE.Mesh(geometry, materials);
    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;
    building.userData = file;
    group.add(building);
    const roofColor = baseColor.clone().multiplyScalar(0.85);
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, metalness: 0.4, roughness: 0.3 });
    const tier1H = 0.15;
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth + 0.1, tier1H, buildingDepth + 0.1), roofMat);
    tier1.position.set(x, height + tier1H / 2, z);
    tier1.castShadow = true;
    tier1.userData = file;
    group.add(tier1);
    const tier2H = 0.12;
    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth * 0.7, tier2H, buildingDepth * 0.7), roofMat);
    tier2.position.set(x, height + tier1H + tier2H / 2, z);
    tier2.castShadow = true;
    tier2.userData = file;
    group.add(tier2);
    const domeRadius = buildingWidth * 0.35;
    const dome = new THREE.Mesh(
        new THREE.SphereGeometry(domeRadius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: roofColor.clone().multiplyScalar(1.2), metalness: 0.5, roughness: 0.2 })
    );
    dome.position.set(x, height + tier1H + tier2H, z);
    dome.castShadow = true;
    dome.userData = file;
    group.add(dome);
    const spireHeight = height * 0.08 + 0.3;
    const spire = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, spireHeight, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 })
    );
    spire.position.set(x, height + tier1H + tier2H + domeRadius + spireHeight / 2 - 0.05, z);
    spire.castShadow = true;
    group.add(spire);
    const baseHeight = 0.15;
    const baseGeometry = new THREE.BoxGeometry(buildingWidth + 0.2, baseHeight, buildingDepth + 0.2);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.1, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(x, baseHeight / 2, z);
    base.receiveShadow = true;
    base.userData = file;
    group.add(base);
    const displayName = file.name.length > 10 ? file.name.substring(0, 8) + '..' : file.name;
    const label = createTextSprite(displayName, new THREE.Vector3(x, height + 0.8, z));
    group.add(label);
    state.labels.push(label);
    return { group, building, meshes: [building, tier1, tier2, dome, base] };
}
