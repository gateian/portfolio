import { useEffect } from "react";
import { useAppState } from "../../../hooks/useAppState";
import SubPage from "../../SubPage/SubPage";
import { Vector3 } from "three";
import { CameraModes } from "../../../components/CameraMode/CameraMode.types";

const QueensUni = () => {
  const { setSelectedObject, setCameraSettings } = useAppState();

  useEffect(() => {
    setCameraSettings({
      mode: CameraModes.Orbit,
      autoRotate: false,
      enableRotate: true,
      screenSpacePanning: true,
      maxDistance: 50,
      minDistance: 1,
      initialPosition: new Vector3(1, 3, 50),
      target: new Vector3(3, 12.5, 0),
    });
  }, [setCameraSettings]);

  useEffect(() => {
    setSelectedObject(2);
  }, [setSelectedObject]);

  return (
    <SubPage title="Queens University Belfast" objectIndex={2} modelView>
      <p>description</p>
    </SubPage>
  );
};

export default QueensUni;
