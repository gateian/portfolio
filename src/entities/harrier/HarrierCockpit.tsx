import { useGLTF } from "@react-three/drei";
import { useLocation } from "react-router-dom";

const HarrierCockpit = () => {
  const { scene } = useGLTF("./3d/HarrierPortfolioExport.glb");

  const location = useLocation();

  if (location.pathname !== "/combat") {
    console.log("Not rendering Harrier Cockpit");
    return null;
  }

  console.log("Rendering Harrier Cockpit");
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
