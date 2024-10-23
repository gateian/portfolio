import { useEffect } from "react";
import { useAppState } from "../../../hooks/useAppState";
import SubPage from "../../SubPage/SubPage";
import { Vector3 } from "three";
import { CameraModes } from "../../../components/CameraMode/CameraMode.types";

const CombatPage = () => {
  const { setCameraSettings } = useAppState();

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

export default CombatPage;
