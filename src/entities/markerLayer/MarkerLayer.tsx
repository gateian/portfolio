import { Vector3 } from "three";
import MapMarker from "../mapMarker/MapMarker";
import { useTexture } from "@react-three/drei";
import { useAppState } from "../../hooks/useAppState";

const MarkerLayer = () => {
  const queensImage = useTexture("/icons/queens.png");
  const { setCameraTarget } = useAppState();

  return (
    <>
      <group>
        <MapMarker
          position={new Vector3(-85, 10, 0)}
          image={queensImage}
          onClick={() => setCameraTarget(new Vector3(300, 0, 0))}
        />
      </group>
    </>
  );
};

export default MarkerLayer;
