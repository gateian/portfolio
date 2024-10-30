import { Group, Material, Object3DEventMap } from "three";
import { useAppState } from "../../hooks/useAppState";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export interface GlbOnLoadedData {
  glbModel: Group<Object3DEventMap>;
  materials: {
    [name: string]: Material;
  };
}

export interface GlbModelProps
  extends GlbOnLoadedData,
    GlbModelPrimitiveProps {}

interface GlbModelPrimitiveProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
}

export interface GlbModelSettings extends GlbModelPrimitiveProps {}

const GlbModelPrimitive = (props: GlbModelPrimitiveProps) => {
  const { position, scale, rotation, castShadow, receiveShadow, visible } =
    props;

  const location = useLocation();

  const { glbModels } = useAppState();
  const glbModel = useMemo(() => glbModels.get(location.pathname), [glbModels]);

  return (
    <>
      {glbModel ? (
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
