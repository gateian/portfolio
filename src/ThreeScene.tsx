import { Canvas } from "@react-three/fiber";
import Landscape from "./entities/landscape/Landscape";
import HarrierCockpit from "./entities/harrier/HarrierCockpit";
import { isDebugMode } from "./utils/generalUtils";
import Debug from "./debug/Debug";
import QueensUniversity from "./entities/queens/QueensUniversity";
import DirectionalLightWithHelper from "./entities/directionalLightWithHelper/DirectionalLightWithHelper";
import EnvironmentMapLoader from "./components/EnvironmentMapLoader";
import SceneCamera from "./components/SceneCamera";
import CityModel from "./entities/city/CityModel";
import MarkerLayer from "./entities/markerLayer/MarkerLayer";

export default function ThreeScene() {
  const debug = isDebugMode();

  return (
    <Canvas shadows>
      <SceneCamera />
      {debug ? <Debug /> : null}
      <EnvironmentMapLoader />

      <ambientLight intensity={1} />

      <Landscape />
      <HarrierCockpit />
      <QueensUniversity />
      <CityModel />

      <MarkerLayer />

      <DirectionalLightWithHelper />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  );
}
