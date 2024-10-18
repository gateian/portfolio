import { lazy, useEffect } from "react";
import { useAppState } from "../hooks/useAppState";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

const OrbitControls = lazy(() =>
  import("@react-three/drei").then((module) => ({
    default: module.OrbitControls,
  }))
);

export interface OrbitCameraProps {
  autoRotate?: boolean;
  enableRotate?: boolean;
  screenSpacePanning?: boolean;
  maxDistance?: number;
  minDistance?: number;
  initialPosition?: Vector3;
  target?: Vector3;
}

const OrbitCamera = () => {
  const { orbitCameraSettings: props } = useAppState();

  const { camera } = useThree();

  useEffect(() => {
    if (props.initialPosition) {
      camera.position.set(
        props.initialPosition.x,
        props.initialPosition.y,
        props.initialPosition.z
      );
    }
  }, [camera, props.initialPosition]);

  useFrame(() => {
    //console.log("Camera position:", camera.position);
  });
  return (
    <OrbitControls
      autoRotate={props.autoRotate}
      enableRotate={props.enableRotate}
      screenSpacePanning={props.screenSpacePanning}
      maxDistance={props.maxDistance}
      minDistance={props.minDistance}
      target={props.target}
    />
  );
};

export default OrbitCamera;
