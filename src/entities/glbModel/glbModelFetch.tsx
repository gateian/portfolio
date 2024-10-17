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
  const { scene, materials } = useGLTF(url);

  useEffect(() => {
    if (scene) {
      setGlbModels(new Map(glbModels).set(url, scene));

      if (onloaded) {
        onloaded(scene, materials);
      }
    }
  }, [scene, setGlbModels, url, glbModels, onloaded, materials]);

  return (
    <GlbModelPrimitive
      glbModel={scene}
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
