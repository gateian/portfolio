import SubPage from "../../SubPage/SubPage";
import {
  Color,
  DoubleSide,
  Material,
  MeshPhysicalMaterial,
  Vector3,
} from "three";
import { CameraModes } from "../../../components/CameraMode/CameraMode.types";
import { GlbModelSettings } from "../../../entities/glbModel/glbModelPrimitive";
import { useCallback, useMemo } from "react";
import { useAppState } from "../../../hooks/useAppState";

const HarrierPage = () => {
  const { environmentMap } = useAppState();

  const glbModelSettings: GlbModelSettings = useMemo(() => {
    return {
      position: [0, 0, -40],
      scale: [10, 10, 10],
      rotation: [0, Math.PI, 0],
      castShadow: true,
      receiveShadow: true,
      visible: true,
    };
  }, []);

  const cameraSettings = useMemo(() => {
    return {
      mode: CameraModes.MotionPath,
      autoRotate: true,
      enableRotate: true,
      screenSpacePanning: true,
      maxDistance: 100,
      minDistance: 1,
      initialPosition: new Vector3(-2.7, 6.54, -4.5),
      target: new Vector3(0, 2.5, 0),
    };
  }, []);

  const handleMaterialReady = useCallback(
    (material: Material) => {
      const updateMaterial = material as MeshPhysicalMaterial;

      if (
        [
          "AV8B-glass",
          "GLASS",
          "HUD_GLASS",
          "HUD_PROJECTOR_GLASS",
          "HUD_GLASS_BACK",
        ].includes(material.name)
      ) {
        updateMaterial.color = new Color(0xffffff);
        updateMaterial.transmission = 1;
        updateMaterial.metalness = 0;
        updateMaterial.roughness = 0.1;
        updateMaterial.roughnessMap = updateMaterial.map;
        updateMaterial.ior = 1.5;
        updateMaterial.thickness = 0.02;
        updateMaterial.specularIntensity = 0.5;
        updateMaterial.specularColor = new Color(0xffffff);
        updateMaterial.envMapIntensity = 0.2;
        updateMaterial.opacity = 0.5;
      } else {
        updateMaterial.metalness = 0.8;
        updateMaterial.roughness = 0.6;
        updateMaterial.specularIntensity = 0.0;
        updateMaterial.specularColor = new Color(0xffffff);
        updateMaterial.envMapIntensity = 0.5;
      }

      updateMaterial.envMap = environmentMap;
      updateMaterial.aoMapIntensity = 0.5;
      updateMaterial.depthWrite = true;
      updateMaterial.transparent = false;
      updateMaterial.side = DoubleSide;
      updateMaterial.needsUpdate = true;
    },
    [environmentMap]
  );

  return (
    <SubPage
      title="Harrier Cockpit"
      objectIndex={1}
      modelView
      glbModelSettings={glbModelSettings}
      cameraSettings={cameraSettings}
      onMaterialReady={handleMaterialReady}
    />
  );
};

export default HarrierPage;
