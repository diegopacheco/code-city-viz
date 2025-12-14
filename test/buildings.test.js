import test from 'node:test';
import assert from 'node:assert';
import { setupDom, resetState } from './helpers.js';

const THREE = await import('three');
const { createBuilding } = await import('../src/buildings.js');
const { state } = await import('../src/state.js');

test('createBuilding constructs meshes and label', () => {
  setupDom();
  resetState();
  const color = new THREE.Color(0x123456);
  const file = { name: 'file.js', path: 'src/file.js' };
  const { group, building, meshes } = createBuilding(file, 1, 2, 3, color);
  assert.strictEqual(group.children.length, 7);
  assert.strictEqual(building.position.y, 1.5);
  assert.ok(meshes.length >= 5);
  assert.strictEqual(state.labels.length, 1);
});
