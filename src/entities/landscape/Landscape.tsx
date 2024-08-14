import { extend, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import {
  LANDSCAPE_GRID_WIDTH,
  LANDSCAPE_GRID_DEPTH,
  LandscapeMaterial,
} from "./LandscapeMaterial";
import { useTexture } from "@react-three/drei";

const MAX_HEIGHT = 1000;

extend({ LandscapeMaterial });

function Landscape() {
  const heightmap = useTexture("/heightmap.png");
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const [initialized, setInitialized] = useState(false);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const GRID_SIZE = LANDSCAPE_GRID_WIDTH * LANDSCAPE_GRID_DEPTH;

  const dataTexture = useMemo(() => {
    if (!heightmap) return null;

    const canvas = document.createElement("canvas");
    canvas.width = heightmap.image.width;
    canvas.height = heightmap.image.height;
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Could not get 2d context");
      return null;
    }

    context.drawImage(heightmap.image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    return new THREE.DataTexture(
      imageData.data,
      imageData.width,
      imageData.height,
      THREE.RGBAFormat
    );
  }, [heightmap]);

  const sampleHeight = (x: number, z: number) => {
    if (!dataTexture) return 0;

    const pixelX = Math.floor(x * (dataTexture.image.width - 1));
    const pixelZ = Math.floor(z * (dataTexture.image.height - 1));

    const index = (pixelZ * dataTexture.image.width + pixelX) * 4;
    const height = dataTexture.image.data[index] / 255.0; // Assuming grayscale image

    return height;
  };

  const positions = new Float32Array(GRID_SIZE * 3);

  const yScales = useMemo(() => {
    return Array.from({ length: GRID_SIZE }, () => Math.random() * 2 + 0.5); // Random height between 0.5 and 2.5
  }, [GRID_SIZE]);

  const colors = useMemo(() => {
    const temp = new Float32Array(GRID_SIZE * 3);
    for (let i = 0; i < GRID_SIZE; i++) {
      temp.set([Math.random(), Math.random(), Math.random()], i * 3);
    }
    return temp;
  }, [GRID_SIZE]);

  useFrame(() => {
    if (!initialized && instancedMeshRef.current) {
      console.log("Initializing landscape");
      let i = 0;
      for (let x = 0; x < LANDSCAPE_GRID_WIDTH; x++) {
        for (let z = 0; z < LANDSCAPE_GRID_DEPTH; z++) {
          const normalizedX = x / (GRID_SIZE - 1);
          const normalizedZ = z / (GRID_SIZE - 1);
          const height = sampleHeight(normalizedX, normalizedZ) * MAX_HEIGHT;

          const id = i++;
          tempObject.position.set(
            x - LANDSCAPE_GRID_WIDTH / 2 + 0.5,
            0,
            z - LANDSCAPE_GRID_DEPTH / 2 + 0.5
          );

          tempObject.scale.set(1, height, 1);
          tempObject.updateMatrix();
          instancedMeshRef.current.setMatrixAt(id, tempObject.matrix);
        }
      }
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;

      setInitialized(true);
    }
  });

  let i = 0;
  for (let x = 0; x < LANDSCAPE_GRID_WIDTH; x++) {
    for (let z = 0; z < LANDSCAPE_GRID_DEPTH; z++) {
      const id = i++;
      positions.set(
        [
          x - LANDSCAPE_GRID_WIDTH / 2 + 0.5,
          yScales[id] / 2,
          z - LANDSCAPE_GRID_DEPTH / 2 + 0.5,
        ],
        id
      );
    }
  }

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[undefined, undefined, GRID_SIZE]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <landscapeMaterial colors={colors} />
    </instancedMesh>
  );
}

export default Landscape;
