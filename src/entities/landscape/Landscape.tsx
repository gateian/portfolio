import { extend, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { LandscapeMaterial } from "./LandscapeMaterial";

interface BoxGridProps {
  width: number;
  depth: number;
}

extend({ LandscapeMaterial });

function Landscape({ width, depth }: BoxGridProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const count = width * depth;

  const positions = new Float32Array(count * 3);

  const yScales = useMemo(() => {
    return Array.from({ length: count }, () => Math.random() * 2 + 0.5); // Random height between 0.5 and 2.5
  }, [count]);

  const colors = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp.set([Math.random(), Math.random(), Math.random()], i * 3);
    }
    return temp;
  }, [count]);

  useFrame(() => {
    let i = 0;
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const id = i++;
        tempObject.position.set(
          x - width / 2 + 0.5,
          yScales[id] / 2,
          z - depth / 2 + 0.5
        );
        tempObject.scale.set(1, yScales[id], 1);
        tempObject.updateMatrix();
        instancedMeshRef.current.setMatrixAt(id, tempObject.matrix);
      }
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  let i = 0;
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      const id = i++;
      // tempObject.position.set(
      positions.set(
        [x - width / 2 + 0.5, yScales[id] / 2, z - depth / 2 + 0.5],
        id
      );
    }
  }

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      {/* <meshPhongMaterial
        color="purple"
        onBeforeCompile={(shader: THREE.WebGLProgramParametersWithUniforms) =>
          console.log(
            "shader compiling",
            shader.fragmentShader,
            shader.vertexShader
          )
        }
      /> */}
      <landscapeMaterial colors={colors} />
    </instancedMesh>
  );
}

export default Landscape;
