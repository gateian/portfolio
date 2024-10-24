import { useThree } from "@react-three/fiber";
import { lazy, useEffect } from "react";

const OrbitControls = lazy(() =>
  import("@react-three/drei").then((module) => ({
    default: module.OrbitControls,
  }))
);
const Stats = lazy(() =>
  import("@react-three/drei").then((module) => ({ default: module.Stats }))
);
import { AxesHelper, Vector3 } from "three";
import { useDebugState } from "./useDebugState";

const Debug3D = () => {
  const { camera } = useThree();

  const { setCameraPosition } = useDebugState();

  useEffect(() => {
    setCameraPosition(camera.position.clone());
  }, [camera.position, setCameraPosition]);

  const updateCameraPosition = (currentPosition: Vector3 | undefined) => {
    if (!currentPosition) return;

    setCameraPosition((prevPosition) => {
      if (prevPosition != undefined) {
        const xChanged = currentPosition.x !== prevPosition.x;
        const yChanged = currentPosition.y !== prevPosition.y;
        const zChanged = currentPosition.z !== prevPosition.z;

        if (xChanged || yChanged || zChanged) {
          return currentPosition;
        }
      }
      return prevPosition;
    });
  };

  return (
    <>
      <Stats />
      <primitive position={[0, 5, 0]} object={new AxesHelper(5)} />
      <OrbitControls
        makeDefault
        enableRotate={true}
        screenSpacePanning={true}
        onChange={(self) => {
          updateCameraPosition(self?.target.object.position.clone());
        }}
        maxDistance={700}
        minDistance={1}
      />
    </>
  );
};

export default Debug3D;
