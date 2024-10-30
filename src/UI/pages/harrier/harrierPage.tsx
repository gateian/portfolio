import SubPage from "../../SubPage/SubPage";
import { Color, DoubleSide, MeshPhysicalMaterial, Vector3 } from "three";
import { CameraModes } from "../../../components/CameraMode/CameraMode.types";
import {
  GlbModelSettings,
  GlbOnLoadedData,
} from "../../../entities/glbModel/glbModelPrimitive";
import { useCallback } from "react";
import { useAppState } from "../../../hooks/useAppState";

const HarrierPage = () => {
  const { environmentMap } = useAppState();

  const glbModelSettings: GlbModelSettings = {
    position: [0, 0, -40],
    scale: [10, 10, 10],
    rotation: [0, Math.PI, 0],
    castShadow: true,
    receiveShadow: true,
    visible: true,
  };

  const cameraSettings = {
    mode: CameraModes.MotionPath,
    autoRotate: true,
    enableRotate: true,
    screenSpacePanning: true,
    maxDistance: 100,
    minDistance: 1,
    initialPosition: new Vector3(-2.7, 6.54, -4.5),
    target: new Vector3(0, 2.5, 0),
  };

  const glassMaterials = [
    "AV8B-glass",
    "GLASS",
    "HUD_GLASS",
    "HUD_PROJECTOR_GLASS",
    "HUD_GLASS_BACK",
  ];

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
    Object.values(data.materials).forEach((material) => {
      if (material instanceof MeshPhysicalMaterial) {
        modifyMaterial(material);
      }
    });
  };

  return (
    <SubPage
      title="Harrier Cockpit"
      objectIndex={1}
      modelView
      glbModelSettings={glbModelSettings}
      onGlbLoadedData={onLoadedHandler}
      cameraSettings={cameraSettings}
    />
  );
};

export default HarrierPage;
