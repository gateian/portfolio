import { useMemo, useRef } from "react";
import { Canvas, extend } from "@react-three/fiber";
import * as THREE from "three";
import { ColorShiftMaterial } from "./materials/ColorShiftMaterial";
import { Grass } from "./entities/grass/Grass";

extend({ ColorShiftMaterial });

interface BoxGridProps {
  width: number;
  depth: number;
}

function BoxGrid({ width, depth }: BoxGridProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const count = width * depth;

  const positions = new Float32Array(count * 3);

  const yScales = useMemo(() => {
    return Array.from({ length: count }, () => Math.random() * 2 + 0.5); // Random height between 0.5 and 2.5
  }, [count]);

  /*
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
*/

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
      <meshPhongMaterial
        color="purple"
        onBeforeCompile={(shader: THREE.WebGLProgramParametersWithUniforms) =>
          console.log(
            "shader compiling",
            shader.fragmentShader,
            shader.vertexShader
          )
        }
      />
    </instancedMesh>
  );
}

export default function ThreeScene() {
  extend({ ColorShiftMaterial });
  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }} shadows>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[-3, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[10, 10, 10]} />
      {/* <BoxGrid width={5} depth={5} /> */}
      <Grass />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <colorShiftMaterial color="grey" time={1} />
      </mesh>
    </Canvas>
  );
}
