import { Canvas } from "@react-three/fiber";
import Landscape from "./entities/landscape/Landscape";
import { OrbitControls, Stats } from "@react-three/drei";

export default function ThreeScene() {
  return (
    <Canvas camera={{ position: [10, 3, 7], fov: 50 }} shadows>
      <OrbitControls autoRotateSpeed={0.1} autoRotate />
      <Stats />
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
      <Landscape />
      <Landscape />
    </Canvas>
  );
}
