import { useAppState } from "../../hooks/useAppState";
import GlbModelPrimitive from "./glbModelPrimitive";
import useGlbModelLoading from "./useGlbModelLoading";

const MODEL_URLS = {
  "/combat": "/3d/HarrierPortfolioExport.glb",
  "/queens": "/3d/QueensUniversity.glb",
};

const GlbModels = () => {
  const { glbModels } = useAppState();

  useGlbModelLoading({ modelUrls: MODEL_URLS });

  return (
    <>
      {Array.from(glbModels.entries()).map(([key, value]) => {
        return (
          <GlbModelPrimitive
            key={key}
            name={key}
            position={value.position}
            scale={value.scale}
            rotation={value.rotation}
            castShadow={value.castShadow}
            receiveShadow={value.receiveShadow}
            onMaterialReady={value.onMaterialReady}
            visible={value.visible}
          />
        );
      })}
    </>
  );
};

export default GlbModels;
