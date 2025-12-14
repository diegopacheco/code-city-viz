import test from 'node:test';
import assert from 'node:assert';
import { setupDom } from './helpers.js';
import { mock } from 'node:test';

const textures = await import('../src/textures.js');
const { Vector3 } = await import('three');

test('createWindowTexture sets repeat and flags', () => {
  setupDom();
  const texture = textures.createWindowTexture(0xff0000);
  assert.strictEqual(texture.needsUpdate, true);
  assert.ok(texture.repeat);
  assert.strictEqual(texture.wrapS, 'RepeatWrapping');
  assert.strictEqual(texture.wrapT, 'RepeatWrapping');
});

test('createTextSprite copies position and scale', () => {
  setupDom();
  const position = new Vector3(1, 2, 3);
  const sprite = textures.createTextSprite('Label', position);
  assert.strictEqual(sprite.position.x, 1);
  assert.strictEqual(sprite.scale.x, 2.5);
});

test('createCobblestoneTexture returns repeating texture', () => {
  const random = mock.method(Math, 'random', () => 0);
  setupDom();
  const texture = textures.createCobblestoneTexture();
  assert.strictEqual(texture.wrapS, 'RepeatWrapping');
  assert.strictEqual(texture.wrapT, 'RepeatWrapping');
  random.mock.restore();
});
