import test, { mock } from 'node:test';
import assert from 'node:assert';
import { setupDom, resetState } from './helpers.js';

const THREE = await import('three');
const weather = await import('../src/weather.js');
const { state } = await import('../src/state.js');

test('createRain populates state and geometry', () => {
  resetState();
  state.scene = new THREE.Scene();
  weather.createRain();
  assert.ok(state.rainParticles);
  assert.ok(state.rainParticles.geometry.userData.velocities.length > 0);
  assert.strictEqual(state.rainParticles.visible, false);
});

test('createSnow populates state and geometry', () => {
  resetState();
  state.scene = new THREE.Scene();
  weather.createSnow();
  assert.ok(state.snowParticles);
  assert.ok(state.snowParticles.geometry.userData.velocities.length > 0);
  assert.strictEqual(state.snowParticles.visible, false);
});

test('createSmoke returns null for low scores and smoke for high scores', () => {
  resetState();
  setupDom();
  const none = weather.createSmoke(0, 0, 1, 10);
  const some = weather.createSmoke(0, 0, 1, 60);
  assert.strictEqual(none, null);
  assert.ok(some);
  assert.ok(some.geometry.userData.velocities.length > 0);
});

test('animateWeather updates particles', () => {
  resetState();
  state.scene = new THREE.Scene();
  weather.createRain();
  weather.createSnow();
  state.rainVisible = true;
  state.snowVisible = true;
  const smoke = weather.createSmoke(0, 0, 1, 60);
  smoke.visible = true;
  state.smokeParticles = [smoke];
  state.smokeVisible = true;
  const random = mock.method(Math, 'random', () => 0.5);
  weather.animateWeather();
  assert.strictEqual(state.rainParticles.geometry.attributes.position.needsUpdate, true);
  assert.strictEqual(state.snowParticles.geometry.attributes.position.needsUpdate, true);
  assert.strictEqual(smoke.geometry.attributes.position.needsUpdate, true);
  random.mock.restore();
});
