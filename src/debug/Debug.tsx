import { OrbitControls, Stats } from "@react-three/drei";
import { AxesHelper, MOUSE } from "three";

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
