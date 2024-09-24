import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppState } from "../../StateProvider";

interface ReflectiveCubeProps {
  position?: [number, number, number];
  size?: number;
}

const ReflectiveCube: React.FC<ReflectiveCubeProps> = ({
  position = [0, 0, 0],
  size = 20,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { environmentMap } = useAppState();

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshPhysicalMaterial
        envMap={environmentMap}
        color={0x444444}
        metalness={0.3}
        roughness={1}
        envMapIntensity={1}
        reflectivity={1}
      />
    </mesh>
  );
};

export default ReflectiveCube;
