import { useCallback } from "react";
import {
  Color,
  MeshPhysicalMaterial,
  Group,
  Object3DEventMap,
  Material,
} from "three";
import { useAppState } from "../../hooks/useAppState";
import GlbModel from "../glbModel/glbModel";

const QueensUniversity = () => {
  const { environmentMap } = useAppState();

  const modifyMaterial = useCallback(
    (material: MeshPhysicalMaterial) => {
      material.aoMap = material.emissiveMap;
      material.aoMapIntensity = 1;
      material.emissive = new Color(0x000000);
      material.envMap = environmentMap;
      material.envMapIntensity = 2;
      material.reflectivity = 1;
      material.color = new Color(0xffffff);
      material.metalness = 1;
      material.vertexColors = false;
      material.roughness = 0.8;
      material.needsUpdate = true;
    },
    [environmentMap]
  );

  const onLoadedHandler = (
    _glbModel: Group<Object3DEventMap>,
    materials: {
      [name: string]: Material;
    }
  ) => {
    Object.values(materials).forEach((material) => {
      if (material instanceof MeshPhysicalMaterial) {
        modifyMaterial(material);
      }
    });
  };

  return (
    <>
      {environmentMap ? (
        <GlbModel
          url="/3d/QueensUniversity.glb"
          onloaded={onLoadedHandler}
          position={[0, 0, -40]}
          rotation={[0, Math.PI * 0.5, 0]}
          scale={[1, 1, 1]}
        />
      ) : null}
    </>
  );
};

export default QueensUniversity;
