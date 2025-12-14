import * as THREE from 'three';
import { state, MAX_BUILDINGS } from './state.js';
import { generateVibrantColor, isTestFile, generateSpiralPositions } from './utils.js';
import { createCobblestoneTexture } from './textures.js';
import { createBuilding } from './buildings.js';
import { createTree, createFountain } from './environment.js';
import { createPerson, createCar, createBug } from './entities.js';
import { createSmoke } from './weather.js';

export function clearCity() {
    state.buildingGroups.forEach(group => state.scene.remove(group));
    state.buildingGroups = [];
    state.buildings = [];
    state.labels = [];
    state.testBuildings = [];
    state.bugs.forEach(bug => state.scene.remove(bug));
    state.bugs = [];
    state.cars.forEach(car => state.scene.remove(car));
    state.cars = [];
    state.people.forEach(person => state.scene.remove(person));
    state.people = [];
    state.smokeParticles.forEach(smoke => state.scene.remove(smoke));
    state.smokeParticles = [];
    state.highlightedBuilding = null;
    state.originalMaterials.clear();
    state.scene.children = state.scene.children.filter(child =>
        child === state.ambientLight || child === state.sunLight || child === state.hemisphereLight ||
        child.type === 'DirectionalLight' || state.clouds.includes(child) ||
        child === state.rainParticles || child === state.snowParticles
    );
}

export function createCity(data) {
    const files = data.files;
    if (!files.length) return;

    let codeFiles = files.filter(f => !isTestFile(f.path)).sort((a, b) => (b.commits || 1) - (a.commits || 1));
    let testFiles = files.filter(f => isTestFile(f.path)).sort((a, b) => (b.commits || 1) - (a.commits || 1));
    const totalFiles = codeFiles.length + testFiles.length;
    if (totalFiles > MAX_BUILDINGS) {
        const codeRatio = codeFiles.length / totalFiles;
        const maxCode = Math.floor(MAX_BUILDINGS * codeRatio);
        const maxTest = MAX_BUILDINGS - maxCode;
        codeFiles = codeFiles.slice(0, maxCode);
        testFiles = testFiles.slice(0, maxTest);
        console.log(`Limited to ${MAX_BUILDINGS} buildings (${codeFiles.length} code, ${testFiles.length} test) from ${totalFiles} total files`);
    }
    const maxCommits = Math.max(...files.map(f => f.commits || 1));
    const maxBugs = Math.max(...files.map(f => f.bugs || 0), 1);
    const spacing = 1.5;
    const maxHeight = 8;

    const codeGridSize = Math.ceil(Math.sqrt(codeFiles.length)) || 1;
    const testGridSize = Math.ceil(Math.sqrt(testFiles.length)) || 1;
    const codeQuarterSize = codeGridSize * spacing + 4;
    const testQuarterSize = testGridSize * spacing + 4;

    const codeSpiralPositions = generateSpiralPositions(codeFiles.length, codeGridSize);
    const testSpiralPositions = generateSpiralPositions(testFiles.length, testGridSize);
    const gap = 3;
    const groundWidth = codeQuarterSize + testQuarterSize + gap;
    const groundHeight = Math.max(codeQuarterSize, testQuarterSize);

    const waterGeo = new THREE.PlaneGeometry(groundWidth + 10, groundHeight + 10);
    const waterMat = new THREE.MeshStandardMaterial({
        color: 0x2a6099, metalness: 0.4, roughness: 0.2, transparent: true, opacity: 0.9
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.15;
    state.scene.add(water);

    const cobbleTexture = createCobblestoneTexture();
    cobbleTexture.repeat.set(groundWidth / 4, groundHeight / 4);
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(groundWidth, groundHeight),
        new THREE.MeshStandardMaterial({ map: cobbleTexture, metalness: 0.1, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    state.scene.add(ground);

    const codeOffsetX = -groundWidth / 2 + codeQuarterSize / 2;
    const testOffsetX = groundWidth / 2 - testQuarterSize / 2;

    const signMat = new THREE.MeshStandardMaterial({ color: 0x2c5282 });
    const codeSign = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 0.1), signMat);
    codeSign.position.set(codeOffsetX, 0.5, -groundHeight / 2 + 0.5);
    state.scene.add(codeSign);
    const testSign = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 0.1), new THREE.MeshStandardMaterial({ color: 0x9333ea }));
    testSign.position.set(testOffsetX, 0.5, -groundHeight / 2 + 0.5);
    state.scene.add(testSign);

    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.95 });
    const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(1, groundHeight), roadMaterial);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.01, 0);
    state.scene.add(mainRoad);

    codeFiles.forEach((file, index) => {
        const pos = codeSpiralPositions[index];
        const commits = file.commits || 1;
        const height = Math.max(1, (commits / maxCommits) * maxHeight);
        const baseColor = generateVibrantColor(index, codeFiles.length);
        const x = codeOffsetX + (pos.col - codeGridSize / 2) * spacing;
        const z = (pos.row - codeGridSize / 2) * spacing;
        const { group, meshes } = createBuilding(file, x, z, height, baseColor);
        state.scene.add(group);
        state.buildings.push(...meshes);
        state.buildingGroups.push(group);
        const smellScore = file.smell_score || 0;
        if (smellScore >= 20) {
            const smoke = createSmoke(x, z, height, smellScore);
            if (smoke) {
                state.scene.add(smoke);
                state.smokeParticles.push(smoke);
            }
        }
        const bugCount = file.bugs || 0;
        if (bugCount > 0) {
            const numBugs = Math.min(5, Math.ceil((bugCount / maxBugs) * 5));
            for (let b = 0; b < numBugs; b++) {
                const bugY = height * 0.3 + Math.random() * height * 0.5;
                const bug = createBug(x, bugY, z);
                state.scene.add(bug);
                state.bugs.push(bug);
            }
        }
    });

    testFiles.forEach((file, index) => {
        const pos = testSpiralPositions[index];
        const commits = file.commits || 1;
        const height = Math.max(1, (commits / maxCommits) * maxHeight);
        const baseColor = new THREE.Color().setHSL(0.75 + (index / testFiles.length) * 0.15, 0.7, 0.5);
        const x = testOffsetX + (pos.col - testGridSize / 2) * spacing;
        const z = (pos.row - testGridSize / 2) * spacing;
        const { group, meshes } = createBuilding(file, x, z, height, baseColor);
        state.scene.add(group);
        state.buildings.push(...meshes);
        state.buildingGroups.push(group);
        state.testBuildings.push(group);
        const smellScore = file.smell_score || 0;
        if (smellScore >= 20) {
            const smoke = createSmoke(x, z, height, smellScore);
            if (smoke) {
                state.scene.add(smoke);
                state.smokeParticles.push(smoke);
            }
        }
        const bugCount = file.bugs || 0;
        if (bugCount > 0) {
            const numBugs = Math.min(3, Math.ceil((bugCount / maxBugs) * 3));
            for (let b = 0; b < numBugs; b++) {
                const bugY = height * 0.3 + Math.random() * height * 0.5;
                const bug = createBug(x, bugY, z);
                state.scene.add(bug);
                state.bugs.push(bug);
            }
        }
    });

    const roadBounds = groundWidth / 2 - 2;
    for (let i = 0; i < 4; i++) {
        const roadZ = (i - 1.5) * spacing * 2;
        const car1 = createCar(-roadBounds, roadZ + 0.1, 1, 'x');
        state.scene.add(car1);
        state.cars.push(car1);
        const car2 = createCar(roadBounds, roadZ - 0.1, -1, 'x');
        state.scene.add(car2);
        state.cars.push(car2);
    }

    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const radiusX = groundWidth / 2 - 1;
        const radiusZ = groundHeight / 2 - 1;
        state.scene.add(createTree(Math.cos(angle) * radiusX, Math.sin(angle) * radiusZ));
    }
    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const radiusX = groundWidth / 2 - 3;
        const radiusZ = groundHeight / 2 - 3;
        state.scene.add(createTree(Math.cos(angle) * radiusX, Math.sin(angle) * radiusZ));
    }
    for (let i = 0; i < 6; i++) {
        state.scene.add(createTree(-groundWidth / 2 + 0.5 + i * 0.8, -groundHeight / 2 + 0.5));
        state.scene.add(createTree(-groundWidth / 2 + 0.5 + i * 0.8, groundHeight / 2 - 0.5));
    }

    state.scene.add(createFountain(0, 0));

    codeFiles.forEach((file, index) => {
        const pos = codeSpiralPositions[index];
        const x = codeOffsetX + (pos.col - codeGridSize / 2) * spacing;
        const z = (pos.row - codeGridSize / 2) * spacing;
        const commits = file.commits || 1;
        const numPeople = Math.min(3, Math.ceil((commits / maxCommits) * 3));
        for (let p = 0; p < numPeople; p++) {
            const person = createPerson(x, z, 1);
            state.scene.add(person);
            state.people.push(person);
        }
    });

    state.camera.position.set(groundWidth * 0.7, groundHeight * 0.6, groundHeight * 0.7);
    state.controls.target.set(0, 1, 0);
}

export async function loadCity(filename) {
    if (!filename) return;
    clearCity();
    try {
        const response = await fetch(filename);
        const data = await response.json();
        state.currentData = data;
        createCity(data);
        const { updateInfo, updateLegend } = await import('./ui.js');
        updateInfo(data);
        updateLegend(data);
    } catch (error) {
        document.getElementById('repo-name').textContent = 'Error loading ' + filename;
    }
}
