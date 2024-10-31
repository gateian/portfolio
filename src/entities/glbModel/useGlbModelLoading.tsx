import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Group, Material, Object3D } from "three";
import { GlbModelProps, GlbOnLoadedData } from "./glbModelPrimitive";

interface ModelUrls {
  [key: string]: string;
}

interface glbModelLoadingProps {
  modelUrls: ModelUrls;
}

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
);
dracoLoader.setDecoderConfig({ type: "js" });

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const useGlbModelLoading = (props: glbModelLoadingProps) => {
  const location = useLocation();
  const [modelsLoading, setModelsLoading] = useState(false);
  const { glbModels, setGlbModels } = useAppState();
  const [loadedModels, setLoadedModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState<string[]>([]);

  const processAndStoreModel = useCallback(
    (path: string, model: Group, existingGlbModel: GlbModelProps) => {
      const preloadedMaterials: { [key: string]: Material } = {};
      model.traverse((object: Object3D) => {
        if ("material" in object && object.material instanceof Material) {
          preloadedMaterials[object.material.name] = object.material;
        }
      });

      existingGlbModel.glbModel = model;
      existingGlbModel.materials = preloadedMaterials;

      const modelData: GlbOnLoadedData = {
        glbModel: model,
        materials: preloadedMaterials,
        loading: false,
      };

      setGlbModels(new Map(glbModels).set(path, existingGlbModel));
      existingGlbModel.onGlbLoadedData?.(modelData);
    },
    [glbModels, setGlbModels]
  );

  const loadingModel = useCallback(
    (path: string, preLoad: boolean, onCompleteCallback?: () => void) => {
      if (loadedModels.includes(path) || loadingModels.includes(path)) {
        return;
      }

      setLoadingModels((prev) => [...prev, path]);

      let existingGlbModel = glbModels.get(path);
      // if (existingGlbModel?.loading || existingGlbModel?.glbModel) {
      //   return;
      // }

      if (!preLoad) {
        setModelsLoading(true);
      }

      if (existingGlbModel === undefined) {
        existingGlbModel = {
          glbModel: undefined,
          materials: {},
          loading: false,
        };
      }

      existingGlbModel.loading = true;

      const url = props.modelUrls[path];

      loader.load(
        url,
        (gltf) => {
          processAndStoreModel(path, gltf.scene, existingGlbModel);

          existingGlbModel.loading = false;
          if (!preLoad) {
            setModelsLoading(false);
          }

          setLoadedModels((prev) => [...prev, path]);
          setLoadingModels((prev) =>
            prev.filter((loadingPath) => loadingPath !== path)
          );

          onCompleteCallback?.();
        },
        undefined,
        (error) => {
          console.error(`Error preloading model for path ${path}:`, error);
          setModelsLoading(false);
          existingGlbModel.loading = false;
        }
      );
    },
    [
      processAndStoreModel,
      glbModels,
      props.modelUrls,
      loadedModels,
      loadingModels,
    ]
  );

  const preloadOtherModels = useCallback(() => {
    const otherPaths = Object.entries(props.modelUrls).filter(
      ([path]) => path !== location.pathname
    );

    otherPaths.forEach(([path]) => {
      const existingGlbModel = glbModels.get(path);
      if (!existingGlbModel) {
        loadingModel(path, true);
      }
    });
  }, [props.modelUrls, location.pathname, loadingModel, glbModels]);

  // loading primary model first
  useEffect(() => {
    // if we have a model for the current page then we load it
    // as the primary model, otherwise we preload all other models
    const url = props.modelUrls[location.pathname];

    if (url) {
      loadingModel(location.pathname, false, () => {
        preloadOtherModels();
      });
    } else {
      preloadOtherModels();
    }
  }, [location.pathname, loadingModel, preloadOtherModels, props.modelUrls]);

  return { isLoading: modelsLoading };
};

export default useGlbModelLoading;
