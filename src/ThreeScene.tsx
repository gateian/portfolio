import { Canvas } from "@react-three/fiber";
import Landscape from "./entities/landscape/Landscape";
import { OrbitControls } from "@react-three/drei";
import HarrierCockpit from "./entities/harrier/HarrierCockpit";
import { isDebugMode } from "./utils/generalUtils";
import MeshPositioner from "./MeshPositioner";
import Debug from "./debug/Debug";
import { useAppState } from "./hooks/useAppState";
import { useEffect } from "react";
import QueensUniversity from "./entities/queens/QueensUniversity";
import DirectionalLightWithHelper from "./entities/directionalLightWithHelper/DirectionalLightWithHelper";
import EnvironmentMapLoader from "./components/EnvironmentMapLoader";
import ReflectiveCube from "./entities/reflectiveCube/ReflectiveCube";
import MapMarker from "./entities/mapMarker/MapMarker";
import { Vector3 } from "three";

export default function ThreeScene() {
  const debug = isDebugMode();

  const setupObjects = () => {
    const objects = [<Landscape />, <HarrierCockpit />, <QueensUniversity />];
    const debugObjects = [<ReflectiveCube />];

    return [...objects, ...(debug ? debugObjects : [])];
  };

  const displayObjects = setupObjects();

  const { setObjectCount } = useAppState();

  useEffect(() => {
    console.log("Setting object count:", displayObjects.length);
    setObjectCount(displayObjects.length);
  }, [displayObjects.length, setObjectCount]);

  return (
    <Canvas camera={{ position: [-30, 30, 42], fov: 50 }} shadows>
      {debug ? <Debug /> : null}
      <EnvironmentMapLoader />
      <OrbitControls autoRotateSpeed={0} autoRotate />
      <ambientLight intensity={1} />
      {/* <directionalLight
        ref={lightRef}
        position={[-3, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      /> */}
      <DirectionalLightWithHelper />
      <pointLight position={[10, 10, 10]} />
      <MapMarker position={new Vector3(0, 10, 0)} />
      {displayObjects.map((obj, index) => (
        <MeshPositioner key={index} order={index}>
          {obj}
        </MeshPositioner>
      ))}
    </Canvas>
  );
}
