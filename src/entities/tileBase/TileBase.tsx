import { Canvas } from "@react-three/fiber";
import { Mesh } from "three";

type BoxProps = {
  position: [number, number, number];
  scale: [number, number, number];
};

const Box = ({ position, scale }: BoxProps) => {
  return (
    <mesh position={position}>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={0x333333} />
    </mesh>
  );
};

const TileBase: React.FC = () => {
  return (
    <>
      {/* Base Box */}
      <Box position={[0, 0.5, 0]} scale={[130, 1, 130]} />

      {/* Middle Box (smaller in x and z) */}
      <Box position={[0, 1.5, 0]} scale={[125, 1, 125]} />

      {/* Top Box (smallest in x and z) */}
      <Box position={[0, 2.5, 0]} scale={[120, 1, 120]} />
    </>
  );
};

export default TileBase;
