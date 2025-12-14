import * as THREE from 'three';

export function createPerson(targetX, targetZ, buildingHeight) {
    const group = new THREE.Group();
    const bodyColors = [0x2563eb, 0xdc2626, 0x16a34a, 0x9333ea, 0xea580c, 0x0891b2];
    const bodyColor = bodyColors[Math.floor(Math.random() * bodyColors.length)];
    const bodyGeo = new THREE.CapsuleGeometry(0.03, 0.08, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.07;
    group.add(body);
    const headGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfdbf6f });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.14;
    group.add(head);
    const angle = Math.random() * Math.PI * 2;
    const startDist = 2 + Math.random() * 2;
    group.position.set(
        targetX + Math.cos(angle) * startDist,
        0,
        targetZ + Math.sin(angle) * startDist
    );
    group.userData = {
        targetX: targetX,
        targetZ: targetZ,
        speed: 0.005 + Math.random() * 0.01,
        arrived: false
    };
    return group;
}

export function createCar(startX, startZ, direction, roadAxis) {
    const group = new THREE.Group();
    const carColors = [0xe53935, 0x1e88e5, 0x43a047, 0xfdd835, 0x8e24aa, 0xff6f00, 0x00acc1];
    const carColor = carColors[Math.floor(Math.random() * carColors.length)];
    const bodyGeo = new THREE.BoxGeometry(0.25, 0.08, 0.12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: carColor, metalness: 0.6, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.06;
    group.add(body);
    const topGeo = new THREE.BoxGeometry(0.12, 0.06, 0.1);
    const top = new THREE.Mesh(topGeo, bodyMat);
    top.position.set(-0.02, 0.11, 0);
    group.add(top);
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, metalness: 0.3, roughness: 0.2 });
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.04, 0.08), windowMat);
    windshield.position.set(0.05, 0.1, 0);
    group.add(windshield);
    const wheelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const wheelPositions = [[0.07, 0.025, 0.06], [0.07, 0.025, -0.06], [-0.07, 0.025, 0.06], [-0.07, 0.025, -0.06]];
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(...pos);
        group.add(wheel);
    });
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, 0.02), headlightMat);
    hl1.position.set(0.13, 0.05, 0.04);
    group.add(hl1);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, 0.02), headlightMat);
    hl2.position.set(0.13, 0.05, -0.04);
    group.add(hl2);
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, 0.02), taillightMat);
    tl1.position.set(-0.13, 0.05, 0.04);
    group.add(tl1);
    const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, 0.02), taillightMat);
    tl2.position.set(-0.13, 0.05, -0.04);
    group.add(tl2);
    group.position.set(startX, 0, startZ);
    if (roadAxis === 'z') {
        group.rotation.y = direction > 0 ? 0 : Math.PI;
    } else {
        group.rotation.y = direction > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    group.userData = {
        direction: direction,
        axis: roadAxis,
        speed: 0.015 + Math.random() * 0.01,
        startPos: roadAxis === 'x' ? startX : startZ
    };
    return group;
}

export function createBug(x, y, z) {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x228b22, metalness: 0.3, roughness: 0.7 });
    const bodyGeo = new THREE.SphereGeometry(0.06, 8, 6);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1.2, 0.7, 1);
    group.add(body);
    const headGeo = new THREE.SphereGeometry(0.035, 8, 6);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0.07, 0.01, 0);
    group.add(head);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const eyeGeo = new THREE.SphereGeometry(0.012, 6, 6);
    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(0.09, 0.02, 0.02);
    group.add(eye1);
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye2.position.set(0.09, 0.02, -0.02);
    group.add(eye2);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a5f1a });
    const legGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 4);
    const legPositions = [
        [0.03, -0.02, 0.06, 0.4], [0.03, -0.02, -0.06, -0.4],
        [0, -0.02, 0.07, 0.5], [0, -0.02, -0.07, -0.5],
        [-0.03, -0.02, 0.06, 0.4], [-0.03, -0.02, -0.06, -0.4]
    ];
    legPositions.forEach(([lx, ly, lz, rot]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        leg.rotation.x = rot;
        group.add(leg);
    });
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x1a5f1a });
    const antennaGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.05, 4);
    const ant1 = new THREE.Mesh(antennaGeo, antennaMat);
    ant1.position.set(0.1, 0.04, 0.015);
    ant1.rotation.z = -0.5;
    ant1.rotation.x = 0.3;
    group.add(ant1);
    const ant2 = new THREE.Mesh(antennaGeo, antennaMat);
    ant2.position.set(0.1, 0.04, -0.015);
    ant2.rotation.z = -0.5;
    ant2.rotation.x = -0.3;
    group.add(ant2);
    group.position.set(x, y, z);
    group.userData = {
        baseY: y,
        angle: Math.random() * Math.PI * 2,
        orbitRadius: 0.15 + Math.random() * 0.1,
        orbitSpeed: 0.02 + Math.random() * 0.02,
        baseX: x,
        baseZ: z
    };
    return group;
}
