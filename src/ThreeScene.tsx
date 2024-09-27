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
import TileBase from "./entities/tileBase/TileBase";
import City from "./entities/city/City";

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
      {/*  */}
      <ambientLight intensity={1} />
      <City />
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
      {displayObjects.map((obj, index) => (
        <GridPositioner key={index} gridX={obj.gridX} gridZ={obj.gridZ}>
          {obj.component}
          {/* <TileBase /> */}
        </GridPositioner>
      ))}
    </Canvas>
  );
}
