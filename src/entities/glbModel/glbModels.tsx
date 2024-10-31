import { useLocation } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import GlbModelPrimitive from "./glbModelPrimitive";
import useGlbModelLoading from "./useGlbModelLoading";

const MODEL_URLS = {
  "/combat": "/3d/HarrierPortfolioExport.glb",
  "/queens": "/3d/QueensUniversity.glb",
};

const GlbModels = () => {
  const { glbModels } = useAppState();
  const location = useLocation();
  useGlbModelLoading({ modelUrls: MODEL_URLS });

  const glbModelProps = glbModels.get(location.pathname) || {};
  const {
    glbModel,
    position,
    scale,
    rotation,
    castShadow,
    receiveShadow,
    onMaterialReady,
    visible,
  } = glbModelProps;

  if (!glbModel) {
    return null;
  }

  return (
    <GlbModelPrimitive
      glbModel={glbModel}
      position={position}
      scale={scale}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      onMaterialReady={onMaterialReady}
      visible={visible}
    />
  );
};

export default GlbModels;
