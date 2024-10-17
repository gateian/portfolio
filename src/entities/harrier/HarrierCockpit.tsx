import GlbModel from "../glbModel/glbModel";

const HarrierCockpit = () => {
  return (
    <GlbModel
      url={"/3d/HarrierPortfolioExport.glb"}
      position={[0, 20, -40]}
      rotation={[0, Math.PI, 0]}
      scale={[10, 10, 10]}
    />
  );
};

export default HarrierCockpit;
