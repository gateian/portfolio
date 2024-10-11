import { Canvas, useThree } from "@react-three/fiber";
import Landscape from "./entities/landscape/Landscape";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import HarrierCockpit from "./entities/harrier/HarrierCockpit";
import { isDebugMode } from "./utils/generalUtils";
import MeshPositioner from "./MeshPositioner";
import Debug from "./debug/Debug";
import { useAppState } from "./hooks/useAppState";
import { Component, useEffect } from "react";
import QueensUniversity from "./entities/queens/QueensUniversity";
import DirectionalLightWithHelper from "./entities/directionalLightWithHelper/DirectionalLightWithHelper";
import EnvironmentMapLoader from "./components/EnvironmentMapLoader";
import ReflectiveCube from "./entities/reflectiveCube/ReflectiveCube";
import SceneCamera from "./components/SceneCamera";
import GridPositioner from "./GridPositioner";
import City from "./entities/city/City";
import River from "./entities/city/River";
import Roads from "./entities/city/Roads";
import { useLocation } from "react-router-dom";
import CityModel from "./entities/city/CityModel";

export default function ThreeScene() {
  const debug = isDebugMode();

  const initialiseObjects = () => {
    const objects = [
      // {
      //   gridX: 0,

      //   gridZ: 0,
      //   component: <Landscape />,
      // },
      {
        gridX: 1,
        gridZ: 0,
        component: <HarrierCockpit />,
      },
      // {
      //   gridX: 0,
      //   gridZ: -1,
      //   component: <QueensUniversity />,
      // },
      // {
      //   gridX: 1,
      //   gridZ: 0,
      //   component: <TileBase />,
      // },
    ];
    const debugObjects = [
      {
        gridX: 0,
        gridZ: 1,
        component: <ReflectiveCube />,
      },
    ];

    return [...objects, ...(debug ? debugObjects : [])];
  };

  const displayObjects = initialiseObjects();

  const { setObjectCount } = useAppState();
  const location = useLocation();

  useEffect(() => {
    console.log("Setting object count:", displayObjects.length);
    setObjectCount(displayObjects.length);
  }, [displayObjects.length, setObjectCount]);

  return (
    // <Canvas camera={{ position: [-500, 500, 500], fov: 20 }} shadows>
    <Canvas shadows>
      <SceneCamera />
      {debug ? <Debug /> : null}
      <EnvironmentMapLoader />

      <ambientLight intensity={1} />

      {(() => {
        switch (location.pathname) {
          case "/terrain":
            return <Landscape />;
          case "/combat":
            return <HarrierCockpit />;
          case "/queens":
            return <QueensUniversity />;
          default:
            return <CityModel />;
        }
      })()}

      <DirectionalLightWithHelper />
      <pointLight position={[10, 10, 10]} />
      {/* {displayObjects.map((obj, index) => (
        <GridPositioner key={index} gridX={obj.gridX} gridZ={obj.gridZ}>
          {obj.component}
          {/* <TileBase />}
        </GridPositioner>
      ))} */}
    </Canvas>
  );
}
