import { Billboard, useTexture } from "@react-three/drei";
import { Texture, Vector3 } from "three";

interface MarkerProps {
  position: Vector3;
  image?: Texture;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}
const Marker = (props: MarkerProps) => {
  const texture = useTexture("/icons/mapMarker.png");
  const { position, image, onClick } = props;

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
        onClick={onClick}
        onPointerEnter={mouseEnterHandler}
        onPointerLeave={mouseLeaveHandler}
      >
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial map={texture} transparent={true} depthTest={false} />
      </mesh>
      <mesh position={new Vector3(position.x, position.y + 0.72, position.z)}>
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial map={image} transparent={true} depthTest={false} />
      </mesh>
    </Billboard>
  );
};

export default Marker;
