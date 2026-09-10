import {
  Color,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  Texture,
  VideoTexture,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

/** Main view: sharp screen + room. */
export const LAYER_MAIN = 0;
/** Mirror pass only: pre-blurred screen stand-in. */
export const LAYER_REFLECT = 1;

export type ViewingHallScene = {
  setScreenMap: (map: Texture | null) => void;
  setReflectMap: (map: Texture | null) => void;
  resize: (width: number, height: number) => void;
  render: () => void;
  dispose: () => void;
};

const SCREEN_WIDTH = 3.2;
const SCREEN_HEIGHT = 1.8;
const SCREEN_Y = SCREEN_HEIGHT * 0.5 + 0.05;
const ORBIT_TARGET_Y = SCREEN_Y * 0.72;

function reflectorSize(): number {
  if (typeof window === 'undefined') {
    return 512;
  }
  // Blur lives in the reflect video; RT just needs enough samples for the plate.
  return window.innerWidth < 768 ? 256 : 512;
}

function enableBothLayers(mesh: Mesh) {
  mesh.layers.enable(LAYER_MAIN);
  mesh.layers.enable(LAYER_REFLECT);
}

export function createViewingHallScene(
  canvas: HTMLCanvasElement
): ViewingHallScene {
  const scene = new Scene();
  scene.background = new Color(0x050508);

  const camera = new PerspectiveCamera(42, 1, 0.1, 100);
  camera.layers.set(LAYER_MAIN);
  // Standing in front of the screen, far enough to see floor reflection.
  camera.position.set(0, 1.35, 4.6);

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x050508, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, ORBIT_TARGET_Y, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 1.6;
  controls.maxDistance = 8;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.minPolarAngle = 0.15;
  controls.update();

  // Dark wall behind the screen so the room doesn't read as empty void.
  const wall = new Mesh(
    new PlaneGeometry(14, 8),
    new MeshBasicMaterial({ color: 0x0a0a0e })
  );
  wall.position.set(0, 2.2, -0.35);
  enableBothLayers(wall);
  scene.add(wall);

  const bezel = new Mesh(
    new PlaneGeometry(SCREEN_WIDTH + 0.08, SCREEN_HEIGHT + 0.08),
    new MeshBasicMaterial({ color: 0x15151a })
  );
  bezel.position.set(0, SCREEN_Y, 0.005);
  enableBothLayers(bezel);
  scene.add(bezel);

  const screenMaterial = new MeshBasicMaterial({
    color: 0xffffff,
    // Self-illuminating: unlit; the only bright thing in a dark room.
    toneMapped: false,
  });
  const screen = new Mesh(
    new PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT),
    screenMaterial
  );
  screen.position.set(0, SCREEN_Y, 0.02);
  screen.layers.set(LAYER_MAIN);
  scene.add(screen);

  // Same pose as the sharp screen; only the mirror camera sees this.
  const reflectMaterial = new MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
  });
  const reflectScreen = new Mesh(
    new PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT),
    reflectMaterial
  );
  reflectScreen.position.copy(screen.position);
  reflectScreen.layers.set(LAYER_REFLECT);
  scene.add(reflectScreen);

  const floorGeometry = new PlaneGeometry(12, 10);
  const reflector = new Reflector(floorGeometry, {
    clipBias: 0.003,
    textureWidth: reflectorSize(),
    textureHeight: reflectorSize(),
    color: 0x4a4a52,
  });
  reflector.rotation.x = -Math.PI / 2;
  reflector.position.set(0, 0, 2.2);
  // Floor is only drawn by the main camera; Reflector hides itself during its pass.
  reflector.layers.set(LAYER_MAIN);
  scene.add(reflector);

  // Ensure the virtual mirror camera only sees room + pre-blurred plate.
  const previousOnBeforeRender = reflector.onBeforeRender.bind(reflector);
  reflector.onBeforeRender = (
    renderer,
    sceneArg,
    cameraArg,
    geometry,
    material,
    group
  ) => {
    const reflectionCamera = reflector.getReflectionCamera(cameraArg);
    reflectionCamera.layers.set(LAYER_REFLECT);
    previousOnBeforeRender(
      renderer,
      sceneArg,
      cameraArg,
      geometry,
      material,
      group
    );
  };

  // Matte strip under the screen edge so the reflector doesn't fight the bezel contact.
  const kick = new Mesh(
    new PlaneGeometry(SCREEN_WIDTH + 0.4, 0.35),
    new MeshBasicMaterial({ color: 0x08080a })
  );
  kick.rotation.x = -Math.PI / 2;
  kick.position.set(0, 0.001, 0.15);
  enableBothLayers(kick);
  scene.add(kick);

  const swapMap = (material: MeshBasicMaterial, map: Texture | null): void => {
    const previous = material.map;
    if (previous && previous !== map) {
      previous.dispose();
    }
    material.map = map;
    material.needsUpdate = true;
  };

  const setScreenMap = (map: Texture | null) => {
    swapMap(screenMaterial, map);
  };

  const setReflectMap = (map: Texture | null) => {
    swapMap(reflectMaterial, map);
    reflectScreen.visible = map !== null;
  };

  const resize = (width: number, height: number) => {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  };

  const render = () => {
    controls.update();
    renderer.render(scene, camera);
  };

  const dispose = () => {
    setScreenMap(null);
    setReflectMap(null);
    controls.dispose();
    screen.geometry.dispose();
    screenMaterial.dispose();
    reflectScreen.geometry.dispose();
    reflectMaterial.dispose();
    bezel.geometry.dispose();
    (bezel.material as MeshBasicMaterial).dispose();
    wall.geometry.dispose();
    (wall.material as MeshBasicMaterial).dispose();
    kick.geometry.dispose();
    (kick.material as MeshBasicMaterial).dispose();
    floorGeometry.dispose();
    reflector.dispose();
    renderer.dispose();
  };

  return { setScreenMap, setReflectMap, resize, render, dispose };
}

export function createVideoTexture(video: HTMLVideoElement): VideoTexture {
  const texture = new VideoTexture(video);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  return texture;
}

export function createImageTexture(image: HTMLImageElement): Texture {
  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  return texture;
}
