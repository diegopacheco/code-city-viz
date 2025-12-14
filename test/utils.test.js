import test, { mock } from 'node:test';
import assert from 'node:assert';

const utils = await import('../src/utils.js');

test('generateVibrantColor uses hue and random components', () => {
  const random = mock.method(Math, 'random', () => 0.5);
  const color = utils.generateVibrantColor(1, 4);
  assert.ok(color.getStyle().includes('hsl'));
  assert.ok(color.getStyle().includes('90'));
  random.mock.restore();
});

test('isTestFile matches common patterns', () => {
  assert.ok(utils.isTestFile('src/__tests__/file.js'));
  assert.ok(utils.isTestFile('component.test.js'));
  assert.ok(utils.isTestFile('spec/helper_spec.ts'));
  assert.ok(!utils.isTestFile('src/app.js'));
});

test('generateSpiralPositions builds ordered spiral', () => {
  const positions = utils.generateSpiralPositions(5, 3);
  assert.deepStrictEqual(positions, [
    { row: 1, col: 1 },
    { row: 1, col: 2 },
    { row: 2, col: 2 },
    { row: 3, col: 2 },
    { row: 3, col: 1 }
  ]);
});
