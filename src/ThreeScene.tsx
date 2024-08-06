import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FlyControls, Stats } from "@react-three/drei";

interface BoxGridProps {
  width: number;
  depth: number;
}

function BoxGrid({ width, depth }: BoxGridProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const count = width * depth;

  const yScales = useMemo(() => {
    return Array.from({ length: count }, () => Math.random() * 2 + 0.5); // Random height between 0.5 and 2.5
  }, [count]);

  useFrame((state, delta) => {
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

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshPhongMaterial color="purple" />
    </instancedMesh>
  );
}

export default function ThreeScene() {
  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[-5, 5, 5]}
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
      <BoxGrid width={5} depth={5} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
      <gridHelper args={[10, 10]} />
      <axesHelper args={[5]} />
      <FlyControls movementSpeed={10} rollSpeed={0.5} dragToLook={true} />
      <Stats />
    </Canvas>
  );
}
