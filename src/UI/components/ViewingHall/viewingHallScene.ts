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
import { Reflector } from 'three/addons/objects/Reflector.js';

export type ViewingHallScene = {
  setScreenMap: (map: Texture | null) => void;
  resize: (width: number, height: number) => void;
  render: () => void;
  dispose: () => void;
};

const SCREEN_WIDTH = 3.2;
const SCREEN_HEIGHT = 1.8;
const SCREEN_Y = SCREEN_HEIGHT * 0.5 + 0.05;

function reflectorSize(): number {
  if (typeof window === 'undefined') {
    return 512;
  }
  // Low-res RT on purpose: downsampling softens the floor reflection without a blur pass.
  return window.innerWidth < 768 ? 64 : 64;
}

export function createViewingHallScene(
  canvas: HTMLCanvasElement
): ViewingHallScene {
  const scene = new Scene();
  scene.background = new Color(0x050508);

  const camera = new PerspectiveCamera(42, 1, 0.1, 100);
  // Standing in front of the screen, far enough to see floor reflection.
  camera.position.set(0, 1.35, 4.6);
  camera.lookAt(0, SCREEN_Y * 0.72, 0);

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x050508, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;

  // Dark wall behind the screen so the room doesn't read as empty void.
  const wall = new Mesh(
    new PlaneGeometry(14, 8),
    new MeshBasicMaterial({ color: 0x0a0a0e })
  );
  wall.position.set(0, 2.2, -0.35);
  scene.add(wall);

  const bezel = new Mesh(
    new PlaneGeometry(SCREEN_WIDTH + 0.08, SCREEN_HEIGHT + 0.08),
    new MeshBasicMaterial({ color: 0x15151a })
  );
  bezel.position.set(0, SCREEN_Y, 0.005);
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
  scene.add(screen);

  const floorGeometry = new PlaneGeometry(12, 10);
  const reflector = new Reflector(floorGeometry, {
    clipBias: 0.003,
    textureWidth: reflectorSize(),
    textureHeight: reflectorSize(),
    color: 0x4a4a52,
  });
  reflector.rotation.x = -Math.PI / 2;
  reflector.position.set(0, 0, 2.2);
  scene.add(reflector);

  // Matte strip under the screen edge so the reflector doesn't fight the bezel contact.
  const kick = new Mesh(
    new PlaneGeometry(SCREEN_WIDTH + 0.4, 0.35),
    new MeshBasicMaterial({ color: 0x08080a })
  );
  kick.rotation.x = -Math.PI / 2;
  kick.position.set(0, 0.001, 0.15);
  scene.add(kick);

  const setScreenMap = (map: Texture | null) => {
    const previous = screenMaterial.map;
    if (previous && previous !== map) {
      previous.dispose();
    }
    screenMaterial.map = map;
    screenMaterial.needsUpdate = true;
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
    renderer.render(scene, camera);
  };

  const dispose = () => {
    setScreenMap(null);
    screen.geometry.dispose();
    screenMaterial.dispose();
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

  return { setScreenMap, resize, render, dispose };
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
