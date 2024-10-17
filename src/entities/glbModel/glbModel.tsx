import { Group, Material, Object3DEventMap } from "three";
import { useAppState } from "../../hooks/useAppState";
import GlbModelFetch from "./glbModelFetch";
import GlbModelPrimitive from "./glbModelPrimitive";

export interface GlbModelBaseProps {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  onloaded?: (
    glbModel: Group<Object3DEventMap>,
    materials: {
      [name: string]: Material;
    }
  ) => void;
  castShadow?: boolean;
  receiveShadow?: boolean;
}
export interface GlbModelProps extends GlbModelBaseProps {
  url: string;
}

const GlbModel = (props: GlbModelProps) => {
  const {
    url,
    position,
    scale,
    rotation,
    castShadow,
    receiveShadow,
    onloaded,
  } = props;
  const { glbModels } = useAppState();

  const glbModel = glbModels.get(url);

  return (
    <>
      {glbModel ? (
        <GlbModelPrimitive
          glbModel={glbModel}
          position={position}
          scale={scale}
          rotation={rotation}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        />
      ) : (
        <GlbModelFetch
          url={url}
          position={position}
          scale={scale}
          rotation={rotation}
          onloaded={onloaded}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        />
      )}
    </>
  );
};

export default GlbModel;