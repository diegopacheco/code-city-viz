import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { state } from './state.js';
import { createClouds } from './environment.js';
import { createRain, createSnow, animateWeather } from './weather.js';
import { loadCity } from './city.js';
import { discoverJsonFiles, populateFileSelector } from './ui.js';
import { setupControls, onWindowResize, onMouseMove, onDoubleClick } from './controls.js';

async function init() {
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x87ceeb);

    state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    state.camera.position.set(50, 40, 50);

    state.renderer = new THREE.WebGLRenderer({ antialias: true });
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    state.renderer.toneMappingExposure = 1.0;
    document.body.appendChild(state.renderer.domElement);

    state.controls = new OrbitControls(state.camera, state.renderer.domElement);
    state.controls.enableDamping = true;
    state.controls.dampingFactor = 0.05;
    state.controls.maxPolarAngle = Math.PI / 2.1;

    state.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    state.scene.add(state.ambientLight);

    state.sunLight = new THREE.DirectionalLight(0xfffacd, 1.2);
    state.sunLight.position.set(30, 50, 25);
    state.sunLight.castShadow = true;
    state.sunLight.shadow.mapSize.width = 2048;
    state.sunLight.shadow.mapSize.height = 2048;
    state.sunLight.shadow.camera.near = 5;
    state.sunLight.shadow.camera.far = 150;
    state.sunLight.shadow.camera.left = -50;
    state.sunLight.shadow.camera.right = 50;
    state.sunLight.shadow.camera.top = 50;
    state.sunLight.shadow.camera.bottom = -50;
    state.scene.add(state.sunLight);

    state.hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x98d982, 0.4);
    state.scene.add(state.hemisphereLight);

    const fillLight = new THREE.DirectionalLight(0xfff5e6, 0.3);
    fillLight.position.set(-20, 25, -20);
    state.scene.add(fillLight);

    state.raycaster = new THREE.Raycaster();
    state.mouse = new THREE.Vector2();

    createClouds();
    createRain();
    createSnow();

    state.availableFiles = await discoverJsonFiles();
    populateFileSelector(state.availableFiles);

    setupControls();

    if (state.availableFiles.length > 0) {
        document.getElementById('file-selector').value = state.availableFiles[0];
        loadCity(state.availableFiles[0]);
    } else {
        document.getElementById('repo-name').textContent = 'No JSON files found - Run analyze.py first';
    }

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('dblclick', onDoubleClick);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    state.frameCount++;
    const now = performance.now();
    if (now - state.lastFpsUpdate >= 1000) {
        state.currentFps = state.frameCount;
        state.frameCount = 0;
        state.lastFpsUpdate = now;
        document.getElementById('fps-counter').textContent = 'FPS: ' + state.currentFps;
    }
    state.labels.forEach(label => {
        label.quaternion.copy(state.camera.quaternion);
    });
    state.clouds.forEach(cloud => {
        cloud.position.x += cloud.userData.speed;
        if (cloud.position.x > 15) cloud.position.x = -15;
    });
    state.cars.forEach(car => {
        const data = car.userData;
        const bounds = 15;
        if (data.axis === 'x') {
            car.position.x += data.speed * data.direction;
            if (car.position.x > bounds) car.position.x = -bounds;
            if (car.position.x < -bounds) car.position.x = bounds;
        } else {
            car.position.z += data.speed * data.direction;
            if (car.position.z > bounds) car.position.z = -bounds;
            if (car.position.z < -bounds) car.position.z = bounds;
        }
    });
    state.bugs.forEach(bug => {
        if (bug.visible) {
            bug.userData.angle += bug.userData.orbitSpeed;
            bug.position.x = bug.userData.baseX + Math.cos(bug.userData.angle) * bug.userData.orbitRadius;
            bug.position.z = bug.userData.baseZ + Math.sin(bug.userData.angle) * bug.userData.orbitRadius;
            bug.position.y = bug.userData.baseY + Math.sin(bug.userData.angle * 2) * 0.1;
            bug.rotation.y = bug.userData.angle + Math.PI / 2;
        }
    });
    state.people.forEach(person => {
        if (!person.userData.arrived) {
            const dx = person.userData.targetX - person.position.x;
            const dz = person.userData.targetZ - person.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 0.15) {
                person.position.x += (dx / dist) * person.userData.speed;
                person.position.z += (dz / dist) * person.userData.speed;
                person.rotation.y = Math.atan2(dx, dz);
                person.position.y = Math.sin(Date.now() * 0.015) * 0.02;
            } else {
                person.userData.arrived = true;
                person.visible = false;
                setTimeout(() => {
                    const angle = Math.random() * Math.PI * 2;
                    const startDist = 2 + Math.random() * 2;
                    person.position.set(
                        person.userData.targetX + Math.cos(angle) * startDist,
                        0,
                        person.userData.targetZ + Math.sin(angle) * startDist
                    );
                    person.userData.arrived = false;
                    person.visible = true;
                }, 1000 + Math.random() * 3000);
            }
        }
    });
    animateWeather();
    state.controls.update();
    state.renderer.render(state.scene, state.camera);
}

init();
