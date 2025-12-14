import test, { mock } from 'node:test';
import assert from 'node:assert';
import { setupDom, resetState } from './helpers.js';

test('main initializes scene and loads city data', async () => {
  const ids = [
    'file-selector',
    'repo-name',
    'fps-counter',
    'stats',
    'legend',
    'search-results',
    'tooltip',
    'search-btn',
    'search-input',
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
    'smokeOffBtn'
  ];
  setupDom(ids);
  resetState();
  const cityData = {
    repo_url: 'https://github.com/org/repo',
    total_files: 1,
    total_loc: 10,
    total_commits: 1,
    files: [{ name: 'a.js', path: 'src/a.js', loc: 10, commits: 1, bugs: 0, smell_score: 0, smells: {}, extension: 'js' }]
  };
  global.fetch = url => {
    if (url.includes('files.json')) {
      return Promise.resolve({ ok: true, json: async () => ['mock.json'] });
    }
    return Promise.resolve({ ok: true, json: async () => cityData });
  };
  await import('../src/main.js');
  await new Promise(resolve => setTimeout(resolve, 0));
  const { state } = await import('../src/state.js');
  assert.ok(state.scene);
  assert.ok(state.camera);
  assert.ok(state.renderer);
  assert.strictEqual(state.availableFiles[0], 'data/mock.json');
  assert.strictEqual(state.currentData.repo_url, cityData.repo_url);
  const fileSelector = global.document.getElementById('file-selector');
  assert.strictEqual(fileSelector.value, 'data/mock.json');
});
