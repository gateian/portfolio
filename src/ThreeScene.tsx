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
import { useLocation } from "react-router-dom";

export default function ThreeScene() {
  const debug = isDebugMode();
  const location = useLocation();

  return (
    <Canvas shadows>
      <SceneCamera />
      {debug ? <Debug /> : null}
      <EnvironmentMapLoader />

      <ambientLight intensity={1} />

      {location.pathname == "/terrain" ? <Landscape /> : null}
      {location.pathname == "/combat" ? <HarrierCockpit /> : null}
      {location.pathname == "/queens" ? <QueensUniversity /> : null}
      {location.pathname == "/" ? <CityModel /> : null}

      <MarkerLayer />

      <DirectionalLightWithHelper />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  );
}
