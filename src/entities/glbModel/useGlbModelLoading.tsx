import { useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Group, Material } from "three";
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

  const { glbModels, setGlbModels } = useAppState();

  const processAndStoreModel = useCallback(
    (path: string, model: Group, existingGlbModel: GlbModelProps) => {
      const preloadedMaterials: { [key: string]: Material } = {};
      model.traverse((child: any) => {
        if (child.material) {
          preloadedMaterials[child.material.name] = child.material;
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
    (path: string, onCompleteCallback?: () => void) => {
      let existingGlbModel = glbModels.get(path);
      if (existingGlbModel?.loading || existingGlbModel?.glbModel) {
        return;
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
          console.log("loaded model");

          onCompleteCallback?.();
        },
        undefined, // onProgress callback
        (error) => {
          console.error(`Error preloading model for path ${path}:`, error);
        }
      );
    },
    [processAndStoreModel, glbModels]
  );

  // loading primary model first
  useEffect(() => {
    loadingModel(location.pathname, () => {
      preloadOtherModels();
    });
  }, [location.pathname]);

  const preloadOtherModels = () => {
    const otherPaths = Object.entries(props.modelUrls).filter(
      ([path]) => path !== location.pathname
    );

    otherPaths.forEach(([path]) => {
      loadingModel(path);
    });
  };

  return { isLoading: false };
};

export default useGlbModelLoading;
