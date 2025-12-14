import test from 'node:test';
import assert from 'node:assert';
import { state, MAX_BUILDINGS } from '../src/state.js';
import { resetState } from './helpers.js';

test('state defaults are reset correctly', () => {
  resetState();
  assert.strictEqual(state.buildings.length, 0);
  assert.strictEqual(state.labels.length, 0);
  assert.strictEqual(state.bugsVisible, true);
  assert.strictEqual(state.testsVisible, true);
  assert.strictEqual(state.currentScale, 1);
  assert.strictEqual(state.currentData, null);
});

test('max buildings constant is set', () => {
  assert.strictEqual(MAX_BUILDINGS, 500);
});
