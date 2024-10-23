import { useLocation } from "react-router-dom";
import GlbModel, { GlbOnLoadedData } from "../glbModel/glbModel";
import { Color, DoubleSide, Material, MeshPhysicalMaterial } from "three";
import { useCallback, useState } from "react";
import { useAppState } from "../../hooks/useAppState";
import { useFrame } from "@react-three/fiber";

const glassMaterials = [
  "AV8B-glass",
  "GLASS",
  "HUD_GLASS",
  "HUD_PROJECTOR_GLASS",
  "HUD_GLASS_BACK",
];

const HarrierCockpit = () => {
  const location = useLocation();

  const [materials, setMaterials] = useState<{ [name: string]: Material }>({});

  const { environmentMap } = useAppState();

  const modifyMaterial = useCallback(
    (material: MeshPhysicalMaterial) => {
      if (glassMaterials.includes(material.name)) {
        material.color = new Color(0xffffff);
        material.transmission = 1;

        material.metalness = 0;
        material.roughness = 0.1;
        material.roughnessMap = material.map;
        material.ior = 1.5;
        material.thickness = 0.02;
        material.specularIntensity = 0.5;
        material.specularColor = new Color(0xffffff);
        material.envMap = environmentMap;
        material.envMapIntensity = 0.2;
        material.opacity = 0.5;
      } else {
        material.metalness = 0.8;
        material.roughness = 0.6;
        material.specularIntensity = 0.0;
        material.specularColor = new Color(0xffffff);
        material.envMap = environmentMap;
        material.envMapIntensity = 0.5;
      }
      material.aoMapIntensity = 0.5;
      material.side = DoubleSide;
      material.depthWrite = true;
      material.transparent = false;
    },
    [environmentMap]
  );

  const onLoadedHandler = (data: GlbOnLoadedData) => {
    setMaterials(data.materials);
    Object.values(data.materials).forEach((material) => {
      if (material instanceof MeshPhysicalMaterial) {
        modifyMaterial(material);
      }
    });
  };

  useFrame(() => {
    if (materials["AV8B-glass"]) {
      const matGlass = materials["AV8B-glass"] as MeshPhysicalMaterial;
      matGlass.opacity = 1.0;
      matGlass.transmission = 0.9;
    }

    if (materials["Mirror"]) {
      const mirror = materials["Mirror"] as MeshPhysicalMaterial;
      mirror.color = new Color(0xffffff);
      mirror.metalness = 1;
      mirror.envMap = environmentMap;
      mirror.roughness = 0.05;
      mirror.roughnessMap = mirror.map;
    }
  });

  return (
    <GlbModel
      url={"/3d/HarrierPortfolioExport.glb"}
      position={[0, 0, -40]}
      rotation={[0, Math.PI, 0]}
      scale={[10, 10, 10]}
      visible={location.pathname == "/combat"}
      onloaded={onLoadedHandler}
    />
  );
};

export default HarrierCockpit;
