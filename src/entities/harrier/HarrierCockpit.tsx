import { useGLTF } from "@react-three/drei";

const HarrierCockpit = () => {
  const { scene } = useGLTF("./3d/HarrierPortfolioExport.glb");

  return (
    <primitive
      object={scene}
      position={[0, 5, -40]}
      rotation={[0, Math.PI, 0]}
      scale={[10, 10, 10]}
    />
  );
};

export default HarrierCockpit;
