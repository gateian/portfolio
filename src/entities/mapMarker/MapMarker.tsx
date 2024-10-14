import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Group, Object3DEventMap, Vector3 } from "three";
import { useAppState } from "../../hooks/useAppState";
import { MapMarkerDefinition, MapMarkerImageType } from "./MapMarker.types";

interface MarkerProps extends MapMarkerDefinition {
  id: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const Marker = (props: MarkerProps) => {
  const markerRef = useRef<Group<Object3DEventMap>>(null);
  const mapMarkerTex = useTexture("/icons/mapMarker.png");
  const poiMarkerTex = useTexture("/icons/poiMarker.png");
  const queensImage = useTexture("/icons/queens.png");
  const terrainImage = useTexture("/icons/terrainIcon.png");
  const combatImage = useTexture("/icons/combat.png");

  const { id, position, image, onClick } = props;
  const [scale, setScale] = useState(1);
  const meshRef = useRef<Group>(null);

  const { setSubPageDialogId } = useAppState();

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
      const cameraReverseDirection = camera
        .getWorldDirection(new Vector3())
        .negate();
      meshRef.current.lookAt(
        meshRef.current.position.clone().add(cameraReverseDirection)
      );
    }
  });

  const onClickHandler = () => {
    if (onClick) {
      onClick();
    } else if (onClick == undefined && props.type === "dialog") {
      setSubPageDialogId(id);
    }
  };

  const setCorrectImage = (imageType: MapMarkerImageType | undefined) => {
    switch (imageType) {
      case MapMarkerImageType.Queens:
        return queensImage;
      case MapMarkerImageType.Terrain:
        return terrainImage;
      case MapMarkerImageType.Combat:
        return combatImage;
      default:
        return null;
    }
  };

  const customImageTex = setCorrectImage(image);

  useEffect(() => {
    if (markerRef.current) {
      (markerRef.current.position as Vector3).set(position.x, 20, position.z);
    }
  }, [position]);

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={onClickHandler}
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
              map={customImageTex}
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
