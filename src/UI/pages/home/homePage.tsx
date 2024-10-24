import { useEffect } from "react";
import { useAppState } from "../../../hooks/useAppState";
import SubPage from "../../SubPage/SubPage";
import { useNavigate } from "react-router-dom";
import { Vector3 } from "three";
import { MenuOptions } from "../../Menu/Menu.enums";
import { GetMenuItem } from "../../Menu/MenuItems";
import { MapMarkerImageType } from "../../../entities/mapMarker/MapMarker.types";
import { CameraModes } from "../../../components/CameraMode/CameraMode.types";

const HomePage = () => {
  const { setMapMarkers } = useAppState();
  const navigate = useNavigate();

  const { setCameraSettings } = useAppState();

  useEffect(() => {
    setMapMarkers([
      {
        position: new Vector3(-85, 10, 0),
        image: MapMarkerImageType.Queens,
        onClick: () => navigate(GetMenuItem(MenuOptions.Queens).route),
        type: "navigate",
      },
      {
        position: new Vector3(70, 10, 0),
        image: MapMarkerImageType.Terrain,
        onClick: () => navigate(GetMenuItem(MenuOptions.Terrain).route),
        type: "navigate",
      },
      {
        position: new Vector3(-15, 10, 70),
        image: MapMarkerImageType.Combat,
        onClick: () => navigate(GetMenuItem(MenuOptions.Combat).route),
        type: "navigate",
      },
    ]);

    setCameraSettings({
      mode: CameraModes.Orbit,
      initialPosition: new Vector3(-11.43, 114.24, 135.24),
      target: new Vector3(0, 0, 0),
      fov: 60,
      autoRotate: true,
      autoRotateSpeed: 0.4,
    });

    return () => {
      setMapMarkers([]);
    };
  }, [navigate, setMapMarkers]);

  return <SubPage title="Welcome to my portfolio" modelView />;
};

export default HomePage;
