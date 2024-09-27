import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppState } from "./hooks/useAppState";

type GridPositionerProps = {
  gridX: number;
  gridZ: number;
  spacing?: number;
  animationDuration?: number;
  children:
    | React.ReactNode
    | ((gridX: number, gridZ: number) => React.ReactNode);
};

const GridPositioner: React.FC<GridPositionerProps> = ({
  gridX = 0,
  gridZ = 0,
  spacing = 150,
  animationDuration = 30, // Duration of animation in seconds
  children,
}) => {
  const { selectedObject } = useAppState();
  const meshRef = useRef<THREE.Group>(null!);
  const [targetPosition, setTargetPosition] = useState(0);
  //const [currentPosition, setCurrentPosition] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(1); // 1 means animation is complete

  const positionX = gridX * spacing;
  const positionZ = gridZ * spacing;
  // Update target position when selectedObject changes
  //   useEffect(() => {
  //     const newTargetPosition = (order - selectedObject) * spacing;
  //     setTargetPosition(newTargetPosition);
  //     setAnimationProgress(0); // Start a new animation
  //   }, [selectedObject, order, spacing]);

  //   useFrame((_state, delta) => {
  //     if (animationProgress < 1) {
  //       // Continue animation
  //       setAnimationProgress(
  //         Math.min(animationProgress + delta / animationDuration, 1)
  //       );

  //       // Use an easing function for smooth animation (example: easeOutCubic)
  //       const t = 1 - Math.pow(1 - animationProgress, 3);
  //       const newPosition =
  //         currentPosition + (targetPosition - currentPosition) * t;

  //       setCurrentPosition(newPosition);

  //       if (meshRef.current) {
  //         meshRef.current.position.x = newPosition;
  //       }
  //     }
  //   });

  return (
    <group ref={meshRef} position={[positionX, 0, positionZ]}>
      {typeof children === "function"
        ? children(gridX, gridZ)
        : React.Children.map(children, (child) =>
            React.cloneElement(child as React.ReactElement, {
              position: new THREE.Vector3(positionX, 0, positionZ),
            })
          )}
    </group>
  );
};

export default GridPositioner;
