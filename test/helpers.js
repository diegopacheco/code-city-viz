import { state } from '../src/state.js';
import { createThreeStub as createThreeStubBase } from './three-stub.js';

function createCanvasContext() {
  return {
    fillStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
    fillRect() {},
    beginPath() {},
    roundRect() {},
    fill() {},
    fillText() {}
  };
}

function createElementStub(tag) {
  const listeners = {};
  const el = {
    tag,
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    children: [],
    dataset: {},
    classList: {
      classes: new Set(),
      add(...names) {
        names.forEach(n => this.classes.add(n));
      },
      remove(...names) {
        names.forEach(n => this.classes.delete(n));
      }
    },
    appendChild(child) {
      this.children.push(child);
    },
    addEventListener(type, handler) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(handler);
    },
    trigger(type, event) {
      (listeners[type] || []).forEach(fn => fn(event));
    },
    querySelectorAll() {
      return [];
    }
  };
  if (tag === 'canvas') {
    el.width = 0;
    el.height = 0;
    el.getContext = () => createCanvasContext();
  }
  return el;
}

export function setupDom(ids = []) {
  const elements = new Map();
  ids.forEach(id => elements.set(id, createElementStub('div')));
  const bodyChildren = [];
  const documentStub = {
    body: {
      children: bodyChildren,
      appendChild(child) {
        bodyChildren.push(child);
      }
    },
    createElement(tag) {
      return createElementStub(tag);
    },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, createElementStub('div'));
      return elements.get(id);
    }
  };
  const windowListeners = {};
  const windowStub = {
    innerWidth: 800,
    innerHeight: 600,
    addEventListener(type, handler) {
      windowListeners[type] = handler;
    },
    open() {}
  };
  global.document = documentStub;
  global.window = windowStub;
  global.performance = { now: () => 0 };
  global.requestAnimationFrame = () => {};
  return { elements, windowListeners };
}

export function createThreeStub() {
  return createThreeStubBase();
}

export function resetState() {
  state.scene = null;
  state.camera = null;
  state.renderer = null;
  state.controls = null;
  state.buildings = [];
  state.labels = [];
  state.raycaster = null;
  state.mouse = null;
  state.buildingGroups = [];
  state.cars = [];
  state.clouds = [];
  state.bugs = [];
  state.bugsVisible = true;
  state.testBuildings = [];
  state.testsVisible = true;
  state.isNightMode = false;
  state.sunLight = null;
  state.ambientLight = null;
  state.hemisphereLight = null;
  state.currentScale = 1.0;
  state.currentData = null;
  state.availableFiles = [];
  state.highlightedBuilding = null;
  state.originalMaterials = new Map();
  state.frameCount = 0;
  state.lastFpsUpdate = 0;
  state.currentFps = 0;
  state.rainParticles = null;
  state.snowParticles = null;
  state.rainVisible = false;
  state.snowVisible = false;
  state.smokeParticles = [];
  state.smokeVisible = false;
  state.people = [];
}
