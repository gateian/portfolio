import { Canvas } from "@react-three/fiber";
import { Grass } from "./entities/grass/Grass";
import Landscape from "./entities/landscape/Landscape";

export default function ThreeScene() {
  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }} shadows>
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
      {/* <BoxGrid width={5} depth={5} /> */}
      <Landscape width={5} depth={5} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshPhongMaterial color="gray" />
      </mesh>
    </Canvas>
  );
}
