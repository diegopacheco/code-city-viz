import test, { mock } from 'node:test';
import assert from 'node:assert';
import { setupDom, resetState } from './helpers.js';

const THREE = await import('three');
const ui = await import('../src/ui.js');
const { state, MAX_BUILDINGS } = await import('../src/state.js');

test('discoverJsonFiles falls back on default when fetch fails', async () => {
  setupDom();
  resetState();
  const errorMock = mock.method(console, 'error', () => {});
  global.fetch = () => Promise.reject(new Error('fail'));
  const files = await ui.discoverJsonFiles();
  assert.ok(files.includes('data/google_gson.json'));
  errorMock.mock.restore();
});

test('populateFileSelector fills options', () => {
  const { elements } = setupDom(['file-selector']);
  ui.populateFileSelector(['data/a.json', 'data/b.json']);
  const selector = elements.get('file-selector');
  assert.strictEqual(selector.children.length, 2);
});

test('updateInfo writes stats', () => {
  const { elements } = setupDom(['repo-name', 'stats']);
  ui.updateInfo({ repo_url: 'repo', total_files: MAX_BUILDINGS + 1, total_loc: 1000, total_commits: 5 });
  assert.ok(elements.get('repo-name').textContent.includes('repo'));
  assert.ok(elements.get('stats').textContent.includes('showing top'));
});

test('updateLegend summarizes data', () => {
  const { elements } = setupDom(['legend']);
  resetState();
  const files = [
    { name: 'code.js', path: 'src/code.js', commits: 2, bugs: 1, extension: 'js' },
    { name: 'test.js', path: 'tests/code.test.js', commits: 1, bugs: 0, extension: 'js' }
  ];
  ui.updateLegend({ files });
  assert.ok(elements.get('legend').innerHTML.includes('Code City Legend'));
});

test('searchFile filters by query', () => {
  resetState();
  state.currentData = { files: [{ name: 'alpha.js', path: 'a', loc: 1 }, { name: 'beta.js', path: 'b', loc: 1 }] };
  const results = ui.searchFile('alp');
  assert.deepStrictEqual(results[0].name, 'alpha.js');
});

test('highlightBuilding and clearHighlight manage materials', () => {
  setupDom(['search-results']);
  resetState();
  const baseColor = new THREE.Color(0x111111);
  const material = new THREE.MeshStandardMaterial({ color: baseColor });
  const building = { userData: { path: 'match' }, material, position: { x: 1, y: 2, z: 3 } };
  const group = {
    children: [building],
    position: new THREE.Vector3(),
    add() {}
  };
  state.buildingGroups = [group];
  state.camera = { position: { set: (...args) => { state.camera.position.setArgs = args; } } };
  state.controls = { target: { set: (...args) => { state.controls.target.setArgs = args; } } };
  ui.highlightBuilding('match');
  assert.strictEqual(state.highlightedBuilding, group);
  ui.clearHighlight();
  assert.strictEqual(state.highlightedBuilding, null);
});

test('setDayMode and setNightMode update lighting', () => {
  resetState();
  state.scene = new THREE.Scene();
  state.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  state.sunLight = new THREE.DirectionalLight(0xffffff, 1);
  state.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
  const puff = { material: { opacity: 1 } };
  const cloud = { children: [puff] };
  state.clouds = [cloud];
  ui.setNightMode();
  assert.strictEqual(state.ambientLight.intensity < 0.2, true);
  ui.setDayMode();
  assert.strictEqual(state.ambientLight.intensity > 0.5, true);
});
