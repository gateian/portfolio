import { Group, Object3DEventMap } from "three";
import { GlbModelBaseProps } from "./glbModel";

interface GlbModelPrimitiveProps extends GlbModelBaseProps {
  glbModel: Group<Object3DEventMap>;
}

const GlbModelPrimitive = (props: GlbModelPrimitiveProps) => {
  const {
    glbModel,
    position,
    scale,
    rotation,
    castShadow,
    receiveShadow,
    visible,
  } = props;

  return (
    <primitive
      object={glbModel}
      position={position}
      scale={scale}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      visible={visible}
    />
  );
};
export default GlbModelPrimitive;
