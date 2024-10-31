import SubPage from "../../SubPage/SubPage";
import { Color, Material, MeshPhysicalMaterial, Vector3 } from "three";
import { CameraModes } from "../../../components/CameraMode/CameraMode.types";
import { GlbModelSettings } from "../../../entities/glbModel/glbModelPrimitive";
import { useAppState } from "../../../hooks/useAppState";
import { useCallback, useMemo } from "react";

const QueensPage = () => {
  const { environmentMap } = useAppState();

  const glbModelSettings: GlbModelSettings = useMemo(() => {
    return {
      position: [0, 0, -40],
      rotation: [0, Math.PI * 0.5, 0],
      scale: [1, 1, 1],
      castShadow: true,
      receiveShadow: true,
      visible: true,
    };
  }, []);

  const cameraSettings = useMemo(() => {
    return {
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
  }, []);

  const handleMaterialReady = useCallback(
    (material: Material) => {
      const updateMaterial = material as MeshPhysicalMaterial;
      updateMaterial.aoMap = updateMaterial.emissiveMap;
      updateMaterial.aoMapIntensity = 1;
      updateMaterial.emissive = new Color(0x000000);
      updateMaterial.envMap = environmentMap;
      updateMaterial.envMapIntensity = 2;
      updateMaterial.reflectivity = 1;
      updateMaterial.color = new Color(0xffffff);
      updateMaterial.metalness = 1;
      updateMaterial.vertexColors = false;
      updateMaterial.roughness = 0.8;
      updateMaterial.needsUpdate = true;
    },
    [environmentMap]
  );

  return (
    <SubPage
      title="Queens University Belfast"
      objectIndex={2}
      modelView
      cameraSettings={cameraSettings}
      glbModelSettings={glbModelSettings}
      onMaterialReady={handleMaterialReady}
    >
      <p>description</p>
    </SubPage>
  );
};

export default QueensPage;
