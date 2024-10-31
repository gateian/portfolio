import { Group, Material, Object3D, Object3DEventMap } from "three";
import { useAppState } from "../../hooks/useAppState";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFrame } from "@react-three/fiber";
import { isDebugMode } from "../../utils/generalUtils";

export interface GlbOnLoadedData {
  glbModel?: Group<Object3DEventMap>;
  materials?: {
    [name: string]: Material;
  };
  loading?: boolean;
}

export interface GlbModelProps
  extends GlbOnLoadedData,
    GlbModelPrimitiveProps {}

interface GlbModelPrimitiveProps extends GlbOnLoadedData {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
  onGlbLoadedData?: (data: GlbOnLoadedData) => void;
  onMaterialReady?: (material: Material) => void;
}

export interface GlbModelSettings extends GlbModelPrimitiveProps {}

const GlbModelPrimitive = (props: GlbModelPrimitiveProps) => {
  const { position, scale, rotation, castShadow, receiveShadow, visible } =
    props;

  const [loaded, setLoaded] = useState(false);

  const location = useLocation();

  const { glbModels } = useAppState();
  const glbModel = useMemo(
    () => glbModels.get(location.pathname),
    [glbModels, location.pathname]
  );

  useFrame(() => {
    if ((glbModel?.glbModel && !loaded) || isDebugMode()) {
      setLoaded(true);
      if (glbModel?.glbModel) {
        glbModel.glbModel.traverse((object: Object3D) => {
          if ("material" in object && object.material instanceof Material) {
            if (object.material) {
              props.onMaterialReady?.(object.material);
            }
          }
        });
      }
    }
  });

  return (
    <>
      {glbModel?.glbModel ? (
        <primitive
          object={glbModel.glbModel}
          position={position}
          scale={scale}
          rotation={rotation}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
          visible={visible}
        />
      ) : null}
    </>
  );
};

export default GlbModelPrimitive;
