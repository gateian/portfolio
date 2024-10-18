import { useLocation } from "react-router-dom";
import GlbModel, { GlbOnLoadedData } from "../glbModel/glbModel";

const HarrierCockpit = () => {
  const location = useLocation();

  const onLoadedHandler = (data: GlbOnLoadedData) => {
    console.log(data.materials);
  };

  return (
    <GlbModel
      url={"/3d/HarrierPortfolioExport.glb"}
      position={[0, 0, -40]}
      rotation={[0, Math.PI, 0]}
      scale={[10, 10, 10]}
      visible={location.pathname == "/combat"}
      onloaded={onLoadedHandler}
    />
  );
};

export default HarrierCockpit;
