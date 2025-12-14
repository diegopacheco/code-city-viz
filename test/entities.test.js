import test, { mock } from 'node:test';
import assert from 'node:assert';

const { createPerson, createCar, createBug } = await import('../src/entities.js');

test('createPerson sets starting position and metadata', () => {
  const random = mock.method(Math, 'random', () => 0);
  const person = createPerson(1, 2, 3);
  assert.strictEqual(person.position.x, 3);
  assert.strictEqual(person.userData.targetZ, 2);
  assert.strictEqual(person.userData.arrived, false);
  random.mock.restore();
});

test('createCar aligns rotation by axis', () => {
  const random = mock.method(Math, 'random', () => 0);
  const carX = createCar(0, 0, 1, 'x');
  const carZ = createCar(0, 0, -1, 'z');
  assert.strictEqual(carX.rotation.y, Math.PI / 2);
  assert.strictEqual(carZ.rotation.y, Math.PI);
  assert.strictEqual(carZ.userData.axis, 'z');
  random.mock.restore();
});

test('createBug tracks orbit data', () => {
  const random = mock.method(Math, 'random', () => 0);
  const bug = createBug(1, 1, 1);
  assert.strictEqual(bug.userData.baseX, 1);
  assert.strictEqual(bug.userData.orbitRadius, 0.15);
  assert.strictEqual(bug.userData.orbitSpeed, 0.02);
  random.mock.restore();
});
