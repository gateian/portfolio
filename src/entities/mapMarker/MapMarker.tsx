import { Billboard, useTexture } from "@react-three/drei";
import { Vector3 } from "three";

interface MarkerProps {
  position: Vector3;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}
const Marker = ({ position }: { position: Vector3 }) => {
  const texture = useTexture("/icons/mapMarker.png");

  const mouseEnterHandler = () => {
    console.log("Marker mouse enter");
  };

  const mouseLeaveHandler = () => {
    console.log("Marker mouse leave");
  };

  return (
    <Billboard>
      <mesh
        position={position}
        onClick={() => console.log("Billboard clicked!")}
        onPointerEnter={mouseEnterHandler}
        onPointerLeave={mouseLeaveHandler}
      >
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial map={texture} transparent={true} depthTest={false} />
      </mesh>
    </Billboard>
  );
};

export default Marker;
