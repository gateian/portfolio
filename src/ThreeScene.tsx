import { Canvas } from "@react-three/fiber";
import Landscape from "./entities/landscape/Landscape";
import { OrbitControls } from "@react-three/drei";
import HarrierCockpit from "./entities/harrier/HarrierCockpit";
import { isDebugMode } from "./utils/generalUtils";
import MeshPositioner from "./MeshPositioner";
import Debug from "./debug/Debug";
import { useAppState } from "./StateProvider";
import { useEffect } from "react";

export default function ThreeScene() {
  const debug = isDebugMode();

  const displayObjects = [<Landscape />, <HarrierCockpit />];

  const { setObjectCount } = useAppState();

  useEffect(() => {
    setObjectCount(displayObjects.length);
  }, [displayObjects.length, setObjectCount]);

  return (
    <Canvas camera={{ position: [0, 40, 42], fov: 50 }} shadows>
      {debug ? <Debug /> : null}
      <OrbitControls autoRotateSpeed={0} autoRotate />
      <ambientLight intensity={0.8} />
      <directionalLight
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
      />
      <pointLight position={[10, 10, 10]} />
      {displayObjects.map((obj, index) => (
        <MeshPositioner key={index} order={index}>
          {obj}
        </MeshPositioner>
      ))}
    </Canvas>
  );
}
