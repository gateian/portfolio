import { useGLTF } from "@react-three/drei";
import { useCallback, useEffect } from "react";
import {
  Color,
  Mesh,
  MeshPhysicalMaterial,
  Group,
  Object3DEventMap,
  Object3D,
} from "three";
import { useAppState } from "../../hooks/useAppState";
import { useLocation } from "react-router-dom";

const QueensUniversity = () => {
  const { scene, materials } = useGLTF("./3d/QueensUniversity.glb");
  const { environmentMap } = useAppState();

  const location = useLocation();

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

  const findMesh = useCallback(
    (child: Object3D<Object3DEventMap>) => {
      if (child instanceof Mesh) {
        const material = child.material as MeshPhysicalMaterial;
        modifyMaterial(material);
      } else if (child instanceof Group) {
        child.children.forEach((child) => {
          findMesh(child);
        });
      }
    },
    [modifyMaterial]
  );

  useEffect(() => {
    if (scene && environmentMap) {
      scene.children.forEach(findMesh);
    }
  }, [materials, scene, environmentMap, findMesh]);

  if (location.pathname !== "/queens") {
    return null;
  }

  return (
    <primitive
      object={scene}
      position={[0, 0, -40]}
      rotation={[0, Math.PI * 0.5, 0]}
      scale={[1, 1, 1]}
    />
  );
};

export default QueensUniversity;
