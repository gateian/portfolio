import { Canvas } from "@react-three/fiber";
import { lazy } from "react";
const Terrain = lazy(() => import("./entities/terrain/Terrain"));
const HarrierCockpit = lazy(() => import("./entities/harrier/HarrierCockpit"));
import { isDebugMode } from "./utils/generalUtils";
const Debug3D = lazy(() => import("./debug/Debug3D"));
const QueensUniversity = lazy(
  () => import("./entities/queens/QueensUniversity")
);
import DirectionalLightWithHelper from "./entities/directionalLightWithHelper/DirectionalLightWithHelper";
import EnvironmentMapLoader from "./components/EnvironmentMapLoader";
import CityModel from "./entities/city/CityModel";
import MarkerLayer from "./entities/markerLayer/MarkerLayer";
import { useLocation } from "react-router-dom";
import CameraMode from "./components/CameraMode/CameraMode";
// import { EffectComposer, Vignette, Bloom } from "@react-three/postprocessing";

export default function ThreeScene() {
  const debug = isDebugMode();
  const location = useLocation();

  return (
    <Canvas shadows>
      <CameraMode />
      {debug ? <Debug3D /> : null}
      <EnvironmentMapLoader />

      <ambientLight intensity={1} />

      {location.pathname == "/terrain" ? <Terrain /> : null}
      <HarrierCockpit />
      <QueensUniversity />
      {location.pathname == "/" ? <CityModel /> : null}

      <MarkerLayer />

      <DirectionalLightWithHelper />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  );
}
