import { extend, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import {
  LANDSCAPE_GRID_WIDTH,
  LANDSCAPE_GRID_DEPTH,
  LandscapeMaterial,
} from "./LandscapeMaterial";
import { useTexture } from "@react-three/drei";

extend({ LandscapeMaterial });

function Landscape() {
  const heightmap = useTexture("/heightmap.png");
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const [initialized, setInitialized] = useState(false);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const GRID_SIZE = LANDSCAPE_GRID_WIDTH * LANDSCAPE_GRID_DEPTH;

  const dataTexture = useMemo(() => {
    if (!heightmap) return undefined;

    console.log("Creating data texture");
    const canvas = document.createElement("canvas");
    canvas.width = heightmap.image.width;
    canvas.height = heightmap.image.height;
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Could not get 2d context");
      return undefined;
    }

    context.drawImage(heightmap.image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Create a new array with only the red channel data
    const redChannelData = new Uint8Array(imageData.width * imageData.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      redChannelData[i / 4] = imageData.data[i];
    }

    const texture = new THREE.DataTexture(
      redChannelData,
      imageData.width,
      imageData.height,
      THREE.RedFormat,
      THREE.UnsignedByteType
    );

    texture.needsUpdate = true;

    return texture;
  }, [heightmap]);

  const sampleHeight = (x: number, z: number) => {
    if (!dataTexture) return 0;

    const pixelX = Math.floor(x * (dataTexture.image.width - 1));
    const pixelZ = Math.floor(z * (dataTexture.image.height - 1));

    const index = (pixelZ * dataTexture.image.width + pixelX) * 4;
    const height = dataTexture.image.data[index]; // Assuming grayscale image

    return height;
  };

  const colors = useMemo(() => {
    const temp = new Float32Array(GRID_SIZE * 3);

    let i = 0;

    for (let x = 0; x < LANDSCAPE_GRID_WIDTH; x++) {
      for (let z = 0; z < LANDSCAPE_GRID_DEPTH; z++) {
        const normalizedX = x / (LANDSCAPE_GRID_WIDTH * 4 - 1);
        const normalizedZ = z / (LANDSCAPE_GRID_DEPTH * 4 - 1);
        const height = sampleHeight(normalizedX, normalizedZ) * 0.01;
        temp.set([height, height, height], i * 3);
        i++;
      }
    }

    return temp;
  }, [GRID_SIZE, sampleHeight]);

  useFrame(() => {
    if (!initialized && instancedMeshRef.current) {
      console.log("Initializing landscape");
      let i = 0;
      for (let x = 0; x < LANDSCAPE_GRID_WIDTH; x++) {
        for (let z = 0; z < LANDSCAPE_GRID_DEPTH; z++) {
          // const normalizedX = x / (LANDSCAPE_GRID_WIDTH * 4 - 1);
          // const normalizedZ = z / (LANDSCAPE_GRID_DEPTH * 4 - 1);
          // const height = sampleHeight(normalizedX, normalizedZ) * 0.1;

          const id = i++;
          tempObject.position.set(
            x - LANDSCAPE_GRID_WIDTH / 2 + 0.5,
            0,
            z - LANDSCAPE_GRID_DEPTH / 2 + 0.5
          );

          // tempObject.scale.set(1, height, 1);
          tempObject.updateMatrix();
          instancedMeshRef.current.setMatrixAt(id, tempObject.matrix);
          (
            instancedMeshRef.current.material as THREE.ShaderMaterial
          ).uniforms.heightMap.value = dataTexture;
        }
      }
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;

      setInitialized(true);
    }
  });

  return (
    <>
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, GRID_SIZE]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <landscapeMaterial heightmap={dataTexture} />
      </instancedMesh>
    </>
  );
}

export default Landscape;
