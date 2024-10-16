import { lazy } from "react";

const OrbitControls = lazy(() =>
  import("@react-three/drei").then((module) => ({
    default: module.OrbitControls,
  }))
);
const Stats = lazy(() =>
  import("@react-three/drei").then((module) => ({ default: module.Stats }))
);
import { AxesHelper } from "three";

const Debug = () => {
  return (
    <>
      <Stats />
      <primitive position={[0, 5, 0]} object={new AxesHelper(5)} />
      <OrbitControls
        enableRotate={true}
        screenSpacePanning={true}
        maxDistance={700}
        minDistance={50}
      />
    </>
  );
};

export default Debug;
