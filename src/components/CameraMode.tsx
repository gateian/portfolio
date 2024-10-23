import { lazy, useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "../hooks/useAppState";
import {
  CubicBezierCurve3,
  Vector3,
  PerspectiveCamera as PerspectiveCameraType,
} from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, PerspectiveCamera } from "@react-three/drei";
import { isDebugMode } from "../utils/generalUtils";

const OrbitControls = lazy(() =>
  import("@react-three/drei").then((module) => ({
    default: module.OrbitControls,
  }))
);

export enum CameraModes {
  Static = "STATIC",
  Orbit = "ORBIT",
  MotionPath = "MOTION_PATH",
}

export interface OrbitCameraSettingsProps {
  mode: CameraModes;
  autoRotate?: boolean;
  enableRotate?: boolean;
  screenSpacePanning?: boolean;
  maxDistance?: number;
  minDistance?: number;
  initialPosition?: Vector3;
  target?: Vector3;
}

const OrbitCamera = () => {
  const { cameraSettings: props } = useAppState();

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

const path = [
  new CubicBezierCurve3(
    new Vector3(-2.7, 6.54, -4.5), // Start
    new Vector3(-5, 6.54, -2), // Control 1
    new Vector3(-6, 6.54, 11), // Control 2
    new Vector3(-2.7, 6.54, 14.5) // End
  ),
  new CubicBezierCurve3(
    new Vector3(-2.7, 6.54, 14.5),
    new Vector3(0, 6.54, 17),
    new Vector3(2, 6.54, 17),
    new Vector3(4.5, 6.54, 14.5)
  ),
  new CubicBezierCurve3(
    new Vector3(4.5, 6.54, 14.5),
    new Vector3(8, 6.54, 11),
    new Vector3(9, 6.54, 0),
    new Vector3(4.5, 6.54, -3.5)
  ),
  new CubicBezierCurve3(
    new Vector3(4.5, 6.54, -3.5),
    new Vector3(2, 6.54, -5),
    new Vector3(0, 6.54, -7),
    new Vector3(-2.7, 6.54, -4.5)
  ),
];

const MotionPathCamera = () => {
  const cameraRef = useRef<PerspectiveCameraType>(null);
  const [progress, setProgress] = useState(0);

  // Create the complete path

  useFrame((_state, delta) => {
    // Increment progress (adjust speed by changing the delta multiplier)
    setProgress((prev) => (prev + delta * 0.05) % 4); // 4 is the number of curves

    // Find which curve we're on and the local progress on that curve
    const curveIndex = Math.floor(progress);
    const localProgress = progress % 1;

    // Get position on the current curve
    const currentPosition = new Vector3();
    path[curveIndex].getPoint(localProgress, currentPosition);

    if (cameraRef.current) {
      cameraRef.current.position.copy(currentPosition);
      cameraRef.current.lookAt(0, 5, 0);
    }
  });

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[-2.7, 6.54, -4.5]}
        fov={75}
      />
    </>
  );
};

const CameraMode = () => {
  const { cameraSettings: props } = useAppState();

  const { camera } = useThree();

  useEffect(() => {
    if (props.initialPosition) {
      camera.position.set(
        props.initialPosition.x,
        props.initialPosition.y,
        props.initialPosition.z
      );
    }
  }, [camera, props.initialPosition, props.mode]);

  const GetCameraMode = () => {
    if (isDebugMode()) {
      return () => null;
    }

    switch (props.mode) {
      case CameraModes.Orbit:
        return OrbitCamera;
      case CameraModes.MotionPath:
        return MotionPathCamera;
      default:
        return () => null;
    }
  };

  const ActiveCameraMode = GetCameraMode();

  const points = useMemo(() => {
    const points: Vector3[] = [];
    const divisions = 50; // Points per curve (higher = smoother)

    path.forEach((curve) => {
      for (let i = 0; i <= divisions; i++) {
        const point = new Vector3();
        curve.getPoint(i / divisions, point);
        points.push(point);
      }
    });

    return points;
  }, []);

  return (
    <>
      <ActiveCameraMode />

      {/* Visualize the path */}
      <Line
        points={points}
        color="white"
        lineWidth={1} // Reduced from 10 as Three.js line width is limited
        transparent // Enable transparency
        opacity={0.5} // Make it slightly transparent
        dashed={false} // Optional: make it dashed
        renderOrder={1} // Ensure it renders on top
        depthTest={false}
      />

      {/* Optionally, visualize the control points */}
      {path.map((curve, i) => (
        <group key={i}>
          <mesh position={curve.v0}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="red" />
          </mesh>
          <mesh position={curve.v1}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="blue" />
          </mesh>
          <mesh position={curve.v2}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="blue" />
          </mesh>
          <mesh position={curve.v3}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="red" />
          </mesh>
        </group>
      ))}
    </>
  );
};

export default CameraMode;
