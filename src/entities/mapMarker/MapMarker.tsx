import { Billboard, useTexture } from "@react-three/drei";
import { useState } from "react";
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
  const [scale, setScale] = useState(1);

  const mouseEnterHandler = () => {
    document.body.style.cursor = "pointer";
    setScale(1.2);
  };

  const mouseLeaveHandler = () => {
    document.body.style.cursor = "default";
    setScale(1);
  };

  return (
    <Billboard>
      <mesh
        scale={[scale, scale, scale]}
        position={position}
        onClick={onClick}
        onPointerEnter={mouseEnterHandler}
        onPointerLeave={mouseLeaveHandler}
      >
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial map={texture} transparent={true} depthTest={false} />
      </mesh>
      <mesh
        scale={[scale, scale, scale]}
        position={new Vector3(position.x, position.y + 0.72, position.z)}
      >
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial map={image} transparent={true} depthTest={false} />
      </mesh>
    </Billboard>
  );
};

export default Marker;
