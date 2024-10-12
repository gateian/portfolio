import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Group, Object3DEventMap, Texture, Vector3 } from "three";

interface MarkerProps {
  position: Vector3;
  image?: Texture;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  pointMode?: boolean;
}
const Marker = (props: MarkerProps) => {
  const markerRef = useRef<Group<Object3DEventMap>>(null);
  const mapMarkerTex = useTexture("/icons/mapMarker.png");
  const poiMarkerTex = useTexture("/icons/poiMarker.png");
  const { position, image, onClick } = props;
  const [scale, setScale] = useState(1);
  const meshRef = useRef<Group>(null);

  const mouseEnterHandler = () => {
    document.body.style.cursor = "pointer";
    setScale(1.2);
  };

  const mouseLeaveHandler = () => {
    document.body.style.cursor = "default";
    setScale(1);
  };

  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  useEffect(() => {
    if (markerRef.current) {
      (markerRef.current.position as Vector3).set(position.x, 20, position.z);
    }
  }, [position]);

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerEnter={mouseEnterHandler}
      onPointerLeave={mouseLeaveHandler}
      scale={[scale, scale, scale]}
    >
      {props.pointMode ? (
        <mesh renderOrder={100}>
          <planeGeometry args={[15, 15]} />
          <meshBasicMaterial
            depthTest={false}
            map={poiMarkerTex}
            transparent={true}
          />
        </mesh>
      ) : (
        <>
          <mesh renderOrder={100}>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial
              depthTest={false}
              map={mapMarkerTex}
              transparent={true}
            />
          </mesh>
          <mesh renderOrder={101} position={new Vector3(0, 3, 0)}>
            <circleGeometry args={[6, 32]} />
            <meshBasicMaterial
              map={image}
              transparent={true}
              depthTest={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
};

export default Marker;
