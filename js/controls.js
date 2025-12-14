import { state } from './state.js';
import { loadCity } from './city.js';
import { searchFile, highlightBuilding, clearHighlight, setDayMode, setNightMode } from './ui.js';
import { isTestFile } from './utils.js';

export function setupControls() {
    document.getElementById('file-selector').addEventListener('change', (e) => {
        loadCity(e.target.value);
    });

    document.getElementById('search-btn').addEventListener('click', () => {
        const query = document.getElementById('search-input').value;
        const results = searchFile(query);
        const resultsDiv = document.getElementById('search-results');
        if (results.length > 0) {
            resultsDiv.innerHTML = results.slice(0, 10).map(f =>
                `<div data-path="${f.path}">${f.name} (${f.loc} LOC)</div>`
            ).join('');
            resultsDiv.style.display = 'block';
            resultsDiv.querySelectorAll('div').forEach(div => {
                div.addEventListener('click', () => {
                    highlightBuilding(div.dataset.path);
                    resultsDiv.style.display = 'none';
                });
            });
        } else {
            resultsDiv.innerHTML = '<div>No results found</div>';
            resultsDiv.style.display = 'block';
        }
    });

    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('search-btn').click();
    });

    document.getElementById('clear-btn').addEventListener('click', clearHighlight);

    document.getElementById('scaleSlider').addEventListener('input', (e) => {
        state.currentScale = parseFloat(e.target.value);
        document.getElementById('scaleValue').textContent = state.currentScale.toFixed(1) + 'x';
        state.buildingGroups.forEach(group => {
            group.scale.y = state.currentScale;
            group.position.y = 0;
        });
    });

    document.getElementById('dayBtn').addEventListener('click', () => {
        if (state.isNightMode) {
            state.isNightMode = false;
            setDayMode();
            document.getElementById('dayBtn').classList.add('active');
            document.getElementById('nightBtn').classList.remove('active');
        }
    });

    document.getElementById('nightBtn').addEventListener('click', () => {
        if (!state.isNightMode) {
            state.isNightMode = true;
            setNightMode();
            document.getElementById('nightBtn').classList.add('active');
            document.getElementById('dayBtn').classList.remove('active');
        }
    });

    document.getElementById('bugsOnBtn').addEventListener('click', () => {
        if (!state.bugsVisible) {
            state.bugsVisible = true;
            state.bugs.forEach(bug => bug.visible = true);
            document.getElementById('bugsOnBtn').classList.add('active');
            document.getElementById('bugsOffBtn').classList.remove('active');
        }
    });

    document.getElementById('bugsOffBtn').addEventListener('click', () => {
        if (state.bugsVisible) {
            state.bugsVisible = false;
            state.bugs.forEach(bug => bug.visible = false);
            document.getElementById('bugsOffBtn').classList.add('active');
            document.getElementById('bugsOnBtn').classList.remove('active');
        }
    });

    document.getElementById('testsOnBtn').addEventListener('click', () => {
        if (!state.testsVisible) {
            state.testsVisible = true;
            state.testBuildings.forEach(b => b.visible = true);
            document.getElementById('testsOnBtn').classList.add('active');
            document.getElementById('testsOffBtn').classList.remove('active');
        }
    });

    document.getElementById('testsOffBtn').addEventListener('click', () => {
        if (state.testsVisible) {
            state.testsVisible = false;
            state.testBuildings.forEach(b => b.visible = false);
            document.getElementById('testsOffBtn').classList.add('active');
            document.getElementById('testsOnBtn').classList.remove('active');
        }
    });

    document.getElementById('rainOnBtn').addEventListener('click', () => {
        if (!state.rainVisible) {
            state.rainVisible = true;
            if (state.rainParticles) state.rainParticles.visible = true;
            document.getElementById('rainOnBtn').classList.add('active');
            document.getElementById('rainOffBtn').classList.remove('active');
        }
    });

    document.getElementById('rainOffBtn').addEventListener('click', () => {
        if (state.rainVisible) {
            state.rainVisible = false;
            if (state.rainParticles) state.rainParticles.visible = false;
            document.getElementById('rainOffBtn').classList.add('active');
            document.getElementById('rainOnBtn').classList.remove('active');
        }
    });

    document.getElementById('snowOnBtn').addEventListener('click', () => {
        if (!state.snowVisible) {
            state.snowVisible = true;
            if (state.snowParticles) state.snowParticles.visible = true;
            document.getElementById('snowOnBtn').classList.add('active');
            document.getElementById('snowOffBtn').classList.remove('active');
        }
    });

    document.getElementById('snowOffBtn').addEventListener('click', () => {
        if (state.snowVisible) {
            state.snowVisible = false;
            if (state.snowParticles) state.snowParticles.visible = false;
            document.getElementById('snowOffBtn').classList.add('active');
            document.getElementById('snowOnBtn').classList.remove('active');
        }
    });

    document.getElementById('smokeOnBtn').addEventListener('click', () => {
        if (!state.smokeVisible) {
            state.smokeVisible = true;
            state.smokeParticles.forEach(smoke => smoke.visible = true);
            document.getElementById('smokeOnBtn').classList.add('active');
            document.getElementById('smokeOffBtn').classList.remove('active');
        }
    });

    document.getElementById('smokeOffBtn').addEventListener('click', () => {
        if (state.smokeVisible) {
            state.smokeVisible = false;
            state.smokeParticles.forEach(smoke => smoke.visible = false);
            document.getElementById('smokeOffBtn').classList.add('active');
            document.getElementById('smokeOnBtn').classList.remove('active');
        }
    });
}

export function onWindowResize() {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
}

export function onMouseMove(event) {
    state.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    state.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    state.raycaster.setFromCamera(state.mouse, state.camera);
    const intersects = state.raycaster.intersectObjects(state.buildings);
    const tooltip = document.getElementById('tooltip');
    if (intersects.length > 0) {
        const file = intersects[0].object.userData;
        if (file && file.name) {
            const fileType = isTestFile(file.path) ? 'Test' : 'Code';
            const bugCount = file.bugs || 0;
            const smellScore = file.smell_score || 0;
            let smellList = [];
            if (file.smells) {
                if (file.smells.long_file) smellList.push('Long file');
                if (file.smells.long_functions > 0) smellList.push(`${file.smells.long_functions} long functions`);
                if (file.smells.deep_nesting > 0) smellList.push(`Deep nesting (${file.smells.deep_nesting}+)`);
                if (file.smells.long_lines > 0) smellList.push(`${file.smells.long_lines} long lines`);
                if (file.smells.low_comments) smellList.push('Low comments');
            }
            const smellInfo = smellList.length > 0 ? smellList.join(', ') : 'Clean';
            tooltip.innerHTML = `<strong>${file.name}</strong><br>Path: ${file.path}<br>Lines: ${file.loc.toLocaleString()}<br>Commits: ${file.commits || 1}<br>Bugs: ${bugCount}<br>Type: ${file.extension}<br>Category: ${fileType}<br>Smell Score: ${smellScore}/100<br>Smells: ${smellInfo}`;
            tooltip.style.display = 'block';
            tooltip.style.left = event.clientX + 15 + 'px';
            tooltip.style.top = event.clientY + 15 + 'px';
        }
    } else {
        tooltip.style.display = 'none';
    }
}

export function onDoubleClick(event) {
    state.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    state.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    state.raycaster.setFromCamera(state.mouse, state.camera);
    const intersects = state.raycaster.intersectObjects(state.buildings);
    if (intersects.length > 0 && state.currentData) {
        const file = intersects[0].object.userData;
        if (file && file.path) {
            let repoUrl = state.currentData.repo_url;
            if (repoUrl.endsWith('.git')) repoUrl = repoUrl.slice(0, -4);
            const fileUrl = repoUrl + '/blob/main/' + file.path;
            window.open(fileUrl, '_blank');
        }
    }
}
