import test, { mock } from 'node:test';
import assert from 'node:assert';
import { resetState } from './helpers.js';

const { createClouds, createTree, createFountain } = await import('../src/environment.js');
const { state } = await import('../src/state.js');

test('createClouds populates scene and state', () => {
  resetState();
  const added = [];
  state.scene = { add: obj => added.push(obj) };
  state.clouds = [];
  const random = mock.method(Math, 'random', () => 0);
  createClouds();
  assert.strictEqual(state.clouds.length, 20);
  assert.strictEqual(added.length, 20);
  random.mock.restore();
});

test('createTree builds layered group', () => {
  const tree = createTree(1, 2);
  assert.strictEqual(tree.children.length, 4);
  assert.strictEqual(tree.children[0].position.y, 0.15);
});

test('createFountain builds fountain group', () => {
  const fountain = createFountain(0, 0);
  assert.ok(fountain.children.length > 0);
  assert.ok(fountain.children[0].receiveShadow);
});
