import test, { mock } from 'node:test';
import assert from 'node:assert';
import { setupDom, resetState } from './helpers.js';

const THREE = await import('three');
const { createCity, clearCity } = await import('../src/city.js');
const { state } = await import('../src/state.js');

test('clearCity resets collections and keeps lights', () => {
  resetState();
  state.scene = new THREE.Scene();
  const keepCloud = {};
  state.clouds = [keepCloud];
  state.ambientLight = {};
  state.sunLight = {};
  state.hemisphereLight = {};
  state.rainParticles = {};
  state.snowParticles = {};
  state.scene.children = [state.ambientLight, state.sunLight, state.hemisphereLight, keepCloud, {}, {}];
  state.buildingGroups = [{}, {}];
  state.buildings = [{}, {}];
  state.labels = [{}, {}];
  state.testBuildings = [{}, {}];
  state.bugs = [{}, {}];
  state.cars = [{}, {}];
  state.people = [{}, {}];
  state.smokeParticles = [{}, {}];
  state.originalMaterials.set('a', 'b');
  clearCity();
  assert.strictEqual(state.buildings.length, 0);
  assert.strictEqual(state.bugs.length, 0);
  assert.strictEqual(state.scene.children.length, 4);
  assert.strictEqual(state.originalMaterials.size, 0);
});

test('createCity builds city layout', () => {
  setupDom();
  resetState();
  mock.method(Math, 'random', () => 0.1);
  state.scene = new THREE.Scene();
  state.camera = { position: { set: (...args) => { state.camera.position.setArgs = args; } } };
  state.controls = { target: { set: (...args) => { state.controls.target.setArgs = args; } } };
  const data = {
    repo_url: 'https://repo',
    total_files: 2,
    total_loc: 100,
    files: [
      { name: 'code.js', path: 'src/code.js', loc: 50, commits: 5, bugs: 2, smell_score: 50, smells: {}, extension: 'js' },
      { name: 'test.js', path: 'tests/code.test.js', loc: 20, commits: 2, bugs: 1, smell_score: 10, smells: {}, extension: 'js' }
    ]
  };
  createCity(data);
  assert.strictEqual(state.buildingGroups.length, 2);
  assert.strictEqual(state.testBuildings.length, 1);
  assert.ok(state.cars.length > 0);
  assert.ok(state.people.length > 0);
  assert.strictEqual(state.smokeParticles.length, 1);
  assert.ok(state.bugs.length > 0);
  assert.deepStrictEqual(state.controls.target.setArgs, [0, 1, 0]);
  mock.restoreAll();
});
