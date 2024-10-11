import { useGLTF } from "@react-three/drei";

const HarrierCockpit = () => {
  const { scene } = useGLTF("./3d/HarrierPortfolioExport.glb");

  if (location.pathname !== "/combat") {
    return null;
  }

  return (
    <primitive
      object={scene}
      position={[0, 20, -40]}
      rotation={[0, Math.PI, 0]}
      scale={[10, 10, 10]}
    />
  );
};

export default HarrierCockpit;
