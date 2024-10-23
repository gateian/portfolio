import { Canvas } from "@react-three/fiber";
import { lazy } from "react";
const Landscape = lazy(() => import("./entities/landscape/Landscape"));
const HarrierCockpit = lazy(() => import("./entities/harrier/HarrierCockpit"));
import { isDebugMode } from "./utils/generalUtils";
const Debug = lazy(() => import("./debug/Debug"));
const QueensUniversity = lazy(
  () => import("./entities/queens/QueensUniversity")
);
import DirectionalLightWithHelper from "./entities/directionalLightWithHelper/DirectionalLightWithHelper";
import EnvironmentMapLoader from "./components/EnvironmentMapLoader";
import CityModel from "./entities/city/CityModel";
import MarkerLayer from "./entities/markerLayer/MarkerLayer";
import { useLocation } from "react-router-dom";
import CameraMode from "./components/CameraMode";
import { useAppState } from "./hooks/useAppState";

export default function ThreeScene() {
  const debug = isDebugMode();
  const location = useLocation();
  const { cameraSettings: orbitCameraSettings } = useAppState();

  return (
    <Canvas shadows>
      <CameraMode />
      {debug ? <Debug /> : null}
      <EnvironmentMapLoader />

      <ambientLight intensity={1} />

      {location.pathname == "/terrain" ? <Landscape /> : null}
      <HarrierCockpit />
      <QueensUniversity />
      {location.pathname == "/" ? <CityModel /> : null}

      <MarkerLayer />

      <DirectionalLightWithHelper />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  );
}
