import { extend, useFrame } from "@react-three/fiber";
import { GrassMaterial } from "./GrassMaterial";
import { useRef, useState } from "react";
import * as THREE from "three";

export const Grass = () => {
  extend({ GrassMaterial });

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = new THREE.Object3D();

  const [clock, setClock] = useState(new THREE.Clock());

  useFrame((state, delta) => {
    for (let i = 0; i < 5000; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 10,
        0,
        (Math.random() - 0.5) * 10
      );

      dummy.scale.setScalar(0.5 + Math.random() * 0.5);

      dummy.rotation.y = Math.random() * Math.PI;

      dummy.updateMatrix();
      instancedMeshRef.current?.setMatrixAt(i, dummy.matrix);
    }
  });

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[undefined, undefined, 5000]}
      castShadow
      receiveShadow
    >
      <planeGeometry args={[0.1, 1, 1, 4]} />
      <grassMaterial time={clock.getElapsedTime()} />
    </instancedMesh>
  );
};
