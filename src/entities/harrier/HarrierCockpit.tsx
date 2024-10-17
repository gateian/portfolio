import { useLocation } from "react-router-dom";
import GlbModel from "../glbModel/glbModel";

const HarrierCockpit = () => {
  const location = useLocation();
  return (
    <GlbModel
      url={"/3d/HarrierPortfolioExport.glb"}
      position={[0, 20, -40]}
      rotation={[0, Math.PI, 0]}
      scale={[10, 10, 10]}
      visible={location.pathname == "/combat"}
    />
  );
};

export default HarrierCockpit;
