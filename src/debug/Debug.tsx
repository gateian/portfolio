import { Stats } from "@react-three/drei";
import { AxesHelper } from "three";

const Debug = () => {
  return (
    <>
      <Stats />
      <primitive position={[0, 5, 0]} object={new AxesHelper(5)} />
    </>
  );
};

export default Debug;
