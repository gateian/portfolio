import { useGLTF } from "@react-three/drei";
import { useAppState } from "../../hooks/useAppState";
import GlbModelPrimitive from "./glbModelPrimitive";
import { useEffect } from "react";
import { GlbModelProps } from "./glbModel";

const GlbModelFetch = (props: GlbModelProps) => {
  const {
    url,
    position,
    scale,
    rotation,
    castShadow,
    receiveShadow,
    onloaded,
    visible,
  } = props;
  const { glbModels, setGlbModels } = useAppState();
  const { scene: group, materials } = useGLTF(url);

  useEffect(() => {
    if (group) {
      setGlbModels(new Map(glbModels).set(url, group));

      if (onloaded) {
        onloaded({ glbModel: group, materials });
      }
    }
  }, [group, setGlbModels, url, glbModels, onloaded, materials]);

  return (
    <GlbModelPrimitive
      glbModel={group}
      position={position}
      scale={scale}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      visible={visible}
    />
  );
};

export default GlbModelFetch;
