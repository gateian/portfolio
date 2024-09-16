import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppState } from "./StateProvider";

type MeshPositionerProps = {
  order: number;
  spacing?: number;
  speed?: number;
  children: React.ReactNode;
};

const MeshPositioner: React.FC<MeshPositionerProps> = ({
  order,
  spacing = 100,
  speed = 0.01,
  children,
}) => {
  const { selectedObject } = useAppState();

  const meshRef = useRef<THREE.Group>(null!);

  // Initial X position is based on order and spacing
  const initialXPosition = (order - selectedObject) * spacing;

  // useFrame will run every frame, and here we could update the X position for animation.
  useFrame(() => {
    if (meshRef.current) {
      //meshRef.current.position.x =
      // initialXPosition + Math.sin(order + Date.now() * speed) * 0.5; // Example animation
    }
  });

  return (
    <group ref={meshRef} position={[initialXPosition, 0, 0]}>
      {children}
    </group>
  );
};

export default MeshPositioner;
