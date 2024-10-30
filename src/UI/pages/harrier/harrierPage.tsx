import SubPage from "../../SubPage/SubPage";
import { Vector3 } from "three";
import { CameraModes } from "../../../components/CameraMode/CameraMode.types";
import { GlbModelSettings } from "../../../entities/glbModel/glbModelPrimitive";

const HarrierPage = () => {
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

  return (
    <SubPage
      title="Harrier Cockpit"
      objectIndex={1}
      modelView
      glbModelSettings={glbModelSettings}
      cameraSettings={cameraSettings}
    />
  );
};

export default HarrierPage;
