import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type MeshPositionerProps = {
  order: number;
  spacing?: number; // Optional, to control spacing between the meshes.
  speed?: number; // Optional, to control movement speed over time.
  children: React.ReactNode; // The child mesh to render.
};

const MeshPositioner: React.FC<MeshPositionerProps> = ({
  order,
  spacing = 100,
  speed = 0.01,
  children,
}) => {
  const meshRef = useRef<THREE.Group>(null!);

  // Initial X position is based on order and spacing
  const initialXPosition = order * spacing;

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
