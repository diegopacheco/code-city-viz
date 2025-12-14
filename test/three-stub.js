export function createThreeStub() {
  class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    set(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    copy(vec) {
      this.x = vec.x;
      this.y = vec.y;
      this.z = vec.z;
    }
  }
  class Vector2 {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
  }
  class Color {
    constructor(value = 0) {
      this.value = value;
    }
    getStyle() {
      return typeof this.value === 'string' ? this.value : `#${this.value.toString(16)}`;
    }
    multiplyScalar(num) {
      return new Color(this.value * num);
    }
    clone() {
      return new Color(this.value);
    }
    setHex(hex) {
      this.value = hex;
      return this;
    }
    setHSL(h, s, l) {
      this.value = `hsl(${h},${s * 100}%,${l * 100}%)`;
      return this;
    }
  }
  class Object3D {
    constructor() {
      this.children = [];
      this.position = new Vector3();
      this.rotation = new Vector3();
      this.scale = new Vector3(1, 1, 1);
      this.userData = {};
      this.visible = true;
      this.quaternion = { copy: () => {} };
    }
    add(child) {
      this.children.push(child);
    }
    remove(child) {
      this.children = this.children.filter(c => c !== child);
    }
  }
  class Group extends Object3D {}
  class Mesh extends Object3D {
    constructor(geometry, material) {
      super();
      this.geometry = geometry;
      this.material = material;
      this.castShadow = false;
      this.receiveShadow = false;
      this.isSprite = false;
    }
  }
  class GeometryBase {
    constructor(...args) {
      this.args = args;
    }
  }
  class BoxGeometry extends GeometryBase {}
  class CylinderGeometry extends GeometryBase {}
  class ConeGeometry extends GeometryBase {}
  class SphereGeometry extends GeometryBase {}
  class PlaneGeometry extends GeometryBase {}
  class CapsuleGeometry extends GeometryBase {}
  class BufferAttribute {
    constructor(array, itemSize) {
      this.array = array;
      this.itemSize = itemSize;
      this.needsUpdate = false;
    }
  }
  class BufferGeometry {
    constructor() {
      this.attributes = {};
      this.userData = {};
    }
    setAttribute(name, attribute) {
      this.attributes[name] = attribute;
    }
  }
  class MaterialBase {
    constructor(opts = {}) {
      Object.assign(this, opts);
      this.emissive = opts.emissive || null;
      this.emissiveIntensity = opts.emissiveIntensity || 0;
    }
    clone() {
      return new this.constructor({ ...this });
    }
  }
  class MeshStandardMaterial extends MaterialBase {}
  class MeshBasicMaterial extends MaterialBase {}
  class PointsMaterial extends MaterialBase {}
  class CanvasTexture {
    constructor(canvas) {
      this.canvas = canvas;
      this.wrapS = null;
      this.wrapT = null;
      this.needsUpdate = false;
      const repeatTarget = { x: 0, y: 0 };
      repeatTarget.set = (x, y) => {
        repeatTarget.x = x;
        repeatTarget.y = y;
      };
      this.repeat = repeatTarget;
    }
  }
  class Points extends Object3D {
    constructor(geometry, material) {
      super();
      this.geometry = geometry;
      this.material = material;
    }
  }
  class Scene extends Group {
    constructor() {
      super();
      this.background = null;
    }
  }
  class SpriteMaterial extends MaterialBase {
    constructor(opts = {}) {
      super(opts);
      this.map = opts.map;
      this.transparent = opts.transparent;
      this.depthTest = opts.depthTest;
    }
  }
  class Sprite extends Object3D {
    constructor(material) {
      super();
      this.material = material;
      this.isSprite = true;
    }
  }
  class AmbientLight extends Object3D {
    constructor(color, intensity) {
      super();
      this.color = new Color(color);
      this.intensity = intensity;
    }
  }
  class DirectionalLight extends Object3D {
    constructor(color, intensity) {
      super();
      this.color = new Color(color);
      this.intensity = intensity;
      this.shadow = { mapSize: {}, camera: {} };
    }
  }
  class HemisphereLight extends Object3D {
    constructor(color, groundColor, intensity) {
      super();
      this.color = new Color(color);
      this.groundColor = new Color(groundColor);
      this.intensity = intensity;
    }
  }
  class Raycaster {
    constructor() {
      this.intersections = [];
    }
    setFromCamera() {}
    intersectObjects() {
      return this.intersections;
    }
  }
  class WebGLRenderer {
    constructor() {
      this.domElement = {};
      this.shadowMap = {};
      this.toneMapping = null;
      this.toneMappingExposure = null;
    }
    setSize(width, height) {
      this.size = { width, height };
    }
    render() {}
  }
  class PerspectiveCamera extends Object3D {
    constructor(fov, aspect, near, far) {
      super();
      this.fov = fov;
      this.aspect = aspect;
      this.near = near;
      this.far = far;
    }
    updateProjectionMatrix() {}
  }
  return {
    Group,
    Mesh,
    BoxGeometry,
    CylinderGeometry,
    ConeGeometry,
    SphereGeometry,
    PlaneGeometry,
    CapsuleGeometry,
    BufferGeometry,
    BufferAttribute,
    MeshStandardMaterial,
    MeshBasicMaterial,
    PointsMaterial,
    CanvasTexture,
    Points,
    Scene,
    SpriteMaterial,
    Sprite,
    AmbientLight,
    DirectionalLight,
    HemisphereLight,
    Raycaster,
    WebGLRenderer,
    PerspectiveCamera,
    Color,
    Vector2,
    Vector3,
    RepeatWrapping: 'RepeatWrapping',
    PCFSoftShadowMap: 'PCFSoftShadowMap',
    ACESFilmicToneMapping: 'ACESFilmicToneMapping'
  };
}
