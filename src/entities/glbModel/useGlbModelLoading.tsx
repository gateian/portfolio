import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";

interface ModelUrls {
  [key: string]: string;
}

interface glbModelLoadingProps {
  modelUrls: ModelUrls;
}

const useGlbModelLoading = (props: glbModelLoadingProps) => {
  const location = useLocation();
  const url = props.modelUrls[location.pathname];
  const { scene: glbModel, materials } = useGLTF(url);

  const { glbModels, setGlbModels } = useAppState();

  useEffect(() => {
    if (glbModel) {
      Object.values(props.modelUrls)
        .filter((modelUrl) => modelUrl !== url)
        .forEach((modelUrl) => useGLTF.preload(modelUrl));
    }
  }, [props.modelUrls, url, glbModel]);

  useEffect(() => {
    if (glbModel && materials) {
      const existingGlbModel = glbModels.get(location.pathname);

      if (existingGlbModel) {
        existingGlbModel.glbModel = glbModel;
        existingGlbModel.materials = materials;
        setGlbModels(
          new Map(glbModels).set(location.pathname, existingGlbModel)
        );
        existingGlbModel.onGlbLoadedData?.({ glbModel, materials });
      } else {
        const newGlbModel = { glbModel, materials };
        setGlbModels(new Map(glbModels).set(location.pathname, newGlbModel));
      }
    }
  }, [glbModel, materials, , location.pathname, setGlbModels]);

  return { isLoading: !glbModel };
};

export default useGlbModelLoading;
