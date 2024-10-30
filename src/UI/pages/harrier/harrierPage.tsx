import { useEffect } from "react";
import { useAppState } from "../../../hooks/useAppState";
import SubPage from "../../SubPage/SubPage";
import { Vector3 } from "three";
import { CameraModes } from "../../../components/CameraMode/CameraMode.types";
import { useLocation } from "react-router-dom";
import {
  GlbModelProps,
  GlbModelSettings,
} from "../../../entities/glbModel/glbModelPrimitive";
import { Group } from "three";

const HarrierPage = () => {
  const { setCameraSettings, glbModels, setGlbModels } = useAppState();
  const location = useLocation();

  const glbModelSettings: GlbModelSettings = {
    position: [0, 0, -40],
    scale: [10, 10, 10],
    rotation: [0, Math.PI, 0],
    castShadow: true,
    receiveShadow: true,
    visible: true,
  };

  useEffect(() => {
    const model = glbModels.get(location.pathname);

    const updatedModel: GlbModelProps = {
      glbModel: model?.glbModel ?? new Group(),
      materials: model?.materials ?? {},
      ...glbModelSettings,
    };

    setGlbModels(new Map(glbModels).set(location.pathname, updatedModel));
  }, [setGlbModels, location.pathname]);

  useEffect(() => {
    setCameraSettings({
      mode: CameraModes.MotionPath,
      autoRotate: true,
      enableRotate: true,
      screenSpacePanning: true,
      maxDistance: 100,
      minDistance: 1,
      initialPosition: new Vector3(-2.7, 6.54, -4.5),
      target: new Vector3(0, 2.5, 0),
    });
  }, [setCameraSettings]);

  return <SubPage title="Harrier Cockpit" objectIndex={1} modelView />;
};

export default HarrierPage;
