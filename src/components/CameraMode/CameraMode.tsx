import { lazy, useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "../../hooks/useAppState";
import {
  CubicBezierCurve3,
  Vector3,
  PerspectiveCamera as PerspectiveCameraType,
} from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, PerspectiveCamera } from "@react-three/drei";
import { isDebugMode } from "../../utils/generalUtils";
import { CameraModes } from "./CameraMode.types";

const OrbitControls = lazy(() =>
  import("@react-three/drei").then((module) => ({
    default: module.OrbitControls,
  }))
);

const OrbitCamera = () => {
  const { cameraSettings: props } = useAppState();
  const cameraRef = useRef<PerspectiveCameraType>(null);

  useEffect(() => {
    if (props.initialPosition && cameraRef.current) {
      cameraRef.current.position.set(
        props.initialPosition.x,
        props.initialPosition.y,
        props.initialPosition.z
      );
    }
  }, [props.initialPosition]);

  useEffect(() => {
    if (props.fov && cameraRef.current) {
      cameraRef.current.fov = props.fov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [props.fov]);

  return (
    <>
      <OrbitControls
        autoRotate={props.autoRotate}
        autoRotateSpeed={props.autoRotateSpeed}
        enableRotate={props.enableRotate}
        screenSpacePanning={props.screenSpacePanning}
        maxDistance={props.maxDistance}
        minDistance={props.minDistance}
        target={props.target}
      />
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={props.initialPosition}
      />
    </>
  );
};

interface PathPoint {
  position: Vector3;
  tangent: Vector3; // Direction vector for the tangent
  intensity?: number; // Optional: control how far the control points extend (default = 1)
}

// Function to convert path points to cubic bezier curves
const createBezierPath = (points: PathPoint[]): CubicBezierCurve3[] => {
  const curves: CubicBezierCurve3[] = [];

  for (let i = 0; i < points.length; i++) {
    const currentPoint = points[i];
    const nextPoint = points[(i + 1) % points.length];
    const controlPointDistance = 4; // Base distance for control points
    const currentIntensity = currentPoint.intensity ?? 1;
    const nextIntensity = nextPoint.intensity ?? 1;

    // Calculate control points
    const control1 = new Vector3()
      .copy(currentPoint.tangent)
      .normalize()
      .multiplyScalar(controlPointDistance * currentIntensity)
      .add(currentPoint.position);

    const control2 = new Vector3()
      .copy(nextPoint.tangent)
      .normalize()
      .multiplyScalar(controlPointDistance * nextIntensity)
      .negate()
      .add(nextPoint.position);

    curves.push(
      new CubicBezierCurve3(
        currentPoint.position,
        control1,
        control2,
        nextPoint.position
      )
    );
  }

  return curves;
};

const pathPoints: PathPoint[] = [
  {
    position: new Vector3(-2.7, 6.54, -4.5),
    tangent: new Vector3(0.5, 0, -0.3),
    intensity: 0.9,
  },
  {
    position: new Vector3(4.5, 6.54, -3.5),
    tangent: new Vector3(0.5, 0, 1),
    intensity: 0.8,
  },
  {
    position: new Vector3(0, 0, 40),
    tangent: new Vector3(-1, 0, 0),
    intensity: 4,
  },
];

const path = createBezierPath(pathPoints);

const MotionPathCamera = () => {
  const cameraRef = useRef<PerspectiveCameraType>(null);
  const [progress, setProgress] = useState(0);

  // Create the complete path

  useFrame((_state, delta) => {
    // Increment progress (adjust speed by changing the delta multiplier)
    setProgress((prev) => (prev + delta * 0.05) % 3); // 4 is the number of curves

    // Find which curve we're on and the local progress on that curve
    const curveIndex = Math.floor(progress);
    const localProgress = progress % 1;

    // Get position on the current curve
    const currentPosition = new Vector3();
    path[curveIndex].getPoint(localProgress, currentPosition);

    if (cameraRef.current) {
      cameraRef.current.position.copy(currentPosition);
      cameraRef.current.lookAt(0, 3.5, 0);
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

      {
        /* Visualize the path */
        isDebugMode() ? (
          <Line
            points={points}
            color="white"
            lineWidth={1}
            transparent
            opacity={0.5}
            dashed={false}
            renderOrder={1}
            depthTest={false}
          />
        ) : null
      }

      {isDebugMode()
        ? path.map((curve, i) => (
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
          ))
        : null}
    </>
  );
};

export default CameraMode;
