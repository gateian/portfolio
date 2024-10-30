import SubPage from "../../SubPage/SubPage";
import { Color, MeshPhysicalMaterial, Vector3 } from "three";
import { CameraModes } from "../../../components/CameraMode/CameraMode.types";
import {
  GlbModelSettings,
  GlbOnLoadedData,
} from "../../../entities/glbModel/glbModelPrimitive";
import { useAppState } from "../../../hooks/useAppState";
import { useCallback } from "react";

const QueensPage = () => {
  const { environmentMap } = useAppState();

  const glbModelSettings: GlbModelSettings = {
    position: [0, 0, -40],
    rotation: [0, Math.PI * 0.5, 0],
    scale: [1, 1, 1],
    castShadow: true,
    receiveShadow: true,
    visible: true,
  };

  const cameraSettings = {
    mode: CameraModes.Orbit,
    autoRotate: true,
    autoRotateSpeed: 0.3,
    enableRotate: true,
    screenSpacePanning: true,
    maxDistance: 50,
    minDistance: 1,
    initialPosition: new Vector3(1, 3, 50),
    target: new Vector3(3, 12.5, 0),
  };

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

  const onLoadedHandler = (data: GlbOnLoadedData) => {
    Object.values(data.materials).forEach((material) => {
      if (material instanceof MeshPhysicalMaterial) {
        modifyMaterial(material);
      }

      data.glbModel.traverse((child) => {
        if (child.isObject3D) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    });
  };

  return (
    <SubPage
      title="Queens University Belfast"
      objectIndex={2}
      modelView
      cameraSettings={cameraSettings}
      glbModelSettings={glbModelSettings}
      onGlbLoadedData={onLoadedHandler}
    >
      <p>description</p>
    </SubPage>
  );
};

export default QueensPage;
