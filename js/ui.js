import * as THREE from 'three';
import { state, MAX_BUILDINGS } from './state.js';
import { isTestFile } from './utils.js';

export async function discoverJsonFiles() {
    const knownFiles = ['google_gson.json'];
    const discovered = [];
    for (const file of knownFiles) {
        try {
            const response = await fetch(file, { method: 'HEAD' });
            if (response.ok) discovered.push(file);
        } catch (e) {}
    }
    try {
        const response = await fetch('files.json');
        if (response.ok) {
            const files = await response.json();
            files.forEach(f => { if (!discovered.includes(f)) discovered.push(f); });
        }
    } catch (e) {}
    return discovered;
}

export function populateFileSelector(files) {
    const selector = document.getElementById('file-selector');
    selector.innerHTML = '<option value="">Select a city...</option>';
    files.forEach(file => {
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file.replace('.json', '').replace('_', '/');
        selector.appendChild(option);
    });
}

export function updateInfo(data) {
    document.getElementById('repo-name').textContent = data.repo_url;
    let statsText = `${data.total_files} files | ${data.total_loc.toLocaleString()} LOC | ${data.total_commits || 0} changes`;
    if (data.total_files > MAX_BUILDINGS) {
        statsText += ` (showing top ${MAX_BUILDINGS})`;
    }
    document.getElementById('stats').textContent = statsText;
}

export function updateLegend(data) {
    const legend = document.getElementById('legend');
    const maxCommits = Math.max(...data.files.map(f => f.commits || 1));
    const codeFiles = data.files.filter(f => !isTestFile(f.path));
    const testFiles = data.files.filter(f => isTestFile(f.path));
    const totalBugs = data.files.reduce((sum, f) => sum + (f.bugs || 0), 0);
    legend.innerHTML = `<h4>Code City Legend</h4>
        <p><b>Height</b> = Git Commits (max ${maxCommits})</p>
        <p><b>Left Quarter</b>: ${codeFiles.length} code files</p>
        <p><b>Right Quarter</b>: ${testFiles.length} test files</p>
        <p><b>Bugs</b>: ${totalBugs} bug-related commits</p>
        <p style="color:#228b22">Green creatures = Bugs</p>`;
}

export function searchFile(query) {
    if (!state.currentData || !query) return [];
    const lowerQuery = query.toLowerCase();
    return state.currentData.files.filter(f => f.name.toLowerCase().includes(lowerQuery));
}

export function highlightBuilding(filePath) {
    clearHighlight();
    for (const group of state.buildingGroups) {
        const mainBuilding = group.children.find(child => child.userData && child.userData.path === filePath);
        if (mainBuilding) {
            state.highlightedBuilding = group;
            group.children.forEach(child => {
                if (child.material && !child.isSprite) {
                    if (Array.isArray(child.material)) {
                        state.originalMaterials.set(child, child.material.map(m => m.clone()));
                        child.material.forEach(m => { m.emissive = new THREE.Color(0xffff00); m.emissiveIntensity = 0.5; });
                    } else {
                        state.originalMaterials.set(child, child.material.clone());
                        child.material.emissive = new THREE.Color(0xffff00);
                        child.material.emissiveIntensity = 0.5;
                    }
                }
            });
            const pos = mainBuilding.position;
            state.camera.position.set(pos.x + 5, pos.y + 10, pos.z + 5);
            state.controls.target.set(pos.x, pos.y, pos.z);
            break;
        }
    }
}

export function clearHighlight() {
    if (state.highlightedBuilding) {
        state.highlightedBuilding.children.forEach(child => {
            if (state.originalMaterials.has(child)) {
                const origMat = state.originalMaterials.get(child);
                if (Array.isArray(child.material)) {
                    child.material.forEach((m, i) => { m.emissive = origMat[i].emissive; m.emissiveIntensity = origMat[i].emissiveIntensity; });
                } else {
                    child.material.emissive = origMat.emissive;
                    child.material.emissiveIntensity = origMat.emissiveIntensity;
                }
            }
        });
        state.highlightedBuilding = null;
        state.originalMaterials.clear();
    }
    document.getElementById('search-results').style.display = 'none';
}

export function setDayMode() {
    state.scene.background = new THREE.Color(0x87ceeb);
    state.ambientLight.intensity = 0.6;
    state.sunLight.intensity = 1.2;
    state.sunLight.color.setHex(0xfffacd);
    state.hemisphereLight.intensity = 0.4;
    state.clouds.forEach(cloud => {
        cloud.children.forEach(puff => {
            puff.material.opacity = 0.85;
        });
    });
}

export function setNightMode() {
    state.scene.background = new THREE.Color(0x0a0a1a);
    state.ambientLight.intensity = 0.15;
    state.sunLight.intensity = 0.3;
    state.sunLight.color.setHex(0x4444aa);
    state.hemisphereLight.intensity = 0.1;
    state.clouds.forEach(cloud => {
        cloud.children.forEach(puff => {
            puff.material.opacity = 0.3;
        });
    });
}
