import test from 'node:test';
import assert from 'node:assert';
import { setupDom, resetState } from './helpers.js';
import { state } from '../src/state.js';
import { setupControls, onMouseMove, onDoubleClick } from '../src/controls.js';

test('setupControls wires UI toggles', () => {
  const { elements } = setupDom([
    'file-selector',
    'search-btn',
    'search-input',
    'search-results',
    'clear-btn',
    'scaleSlider',
    'scaleValue',
    'dayBtn',
    'nightBtn',
    'bugsOnBtn',
    'bugsOffBtn',
    'testsOnBtn',
    'testsOffBtn',
    'rainOnBtn',
    'rainOffBtn',
    'snowOnBtn',
    'snowOffBtn',
    'smokeOnBtn',
    'smokeOffBtn',
    'tooltip'
  ]);
  resetState();
  state.buildingGroups = [{ scale: { y: 1 }, position: { y: 0 } }];
  state.raycaster = { setFromCamera() {}, intersectObjects: () => [] };
  state.mouse = {};
  state.bugs = [{ visible: false }];
  state.testBuildings = [{ visible: true }];
  state.smokeParticles = [{ visible: false }];
  setupControls();
  const scaleSlider = elements.get('scaleSlider');
  scaleSlider.trigger('input', { target: { value: '1.5' } });
  assert.strictEqual(state.currentScale, 1.5);
  elements.get('bugsOnBtn').trigger('click');
  assert.strictEqual(state.bugsVisible, true);
  elements.get('testsOffBtn').trigger('click');
  assert.strictEqual(state.testsVisible, false);
  elements.get('rainOnBtn').trigger('click');
  assert.strictEqual(state.rainVisible, true);
  elements.get('snowOnBtn').trigger('click');
  assert.strictEqual(state.snowVisible, true);
  elements.get('smokeOnBtn').trigger('click');
  assert.strictEqual(state.smokeVisible, true);
});

test('onMouseMove shows tooltip when hit', () => {
  setupDom(['tooltip']);
  resetState();
  const fileData = {
    name: 'file.js',
    path: 'tests/file.js',
    loc: 10,
    commits: 2,
    bugs: 1,
    extension: 'js',
    smell_score: 30,
    smells: { long_file: true, long_functions: 1, deep_nesting: 0, long_lines: 0, low_comments: true }
  };
  state.raycaster = {
    setFromCamera() {},
    intersectObjects: () => [{ object: { userData: fileData } }]
  };
  state.mouse = {};
  state.buildings = [];
  state.camera = { quaternion: {} };
  onMouseMove({ clientX: 10, clientY: 20 });
  const tooltip = global.document.getElementById('tooltip');
  assert.strictEqual(tooltip.style.display, 'block');
});

test('onDoubleClick opens file link', () => {
  setupDom();
  resetState();
  let opened = '';
  global.window.open = url => {
    opened = url;
  };
  state.raycaster = {
    setFromCamera() {},
    intersectObjects: () => [{ object: { userData: { path: 'src/index.js' } } }]
  };
  state.mouse = {};
  state.buildings = [];
  state.currentData = { repo_url: 'https://github.com/org/repo.git' };
  onDoubleClick({ clientX: 0, clientY: 0 });
  assert.strictEqual(opened, 'https://github.com/org/repo/blob/main/src/index.js');
});
