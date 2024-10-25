import { Vector3 } from "three";
import SubPage from "../../SubPage/SubPage";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../../hooks/useAppState";
import TerrainDialog1 from "./terrainDialog1";
import TerrainDialog2 from "./terrainDialog2";
import TerrainDialog3 from "./terrainDialog3";
import { CameraModes } from "../../../components/CameraMode/CameraMode.types";

const TerrainPage = () => {
  const { setMapMarkers, setCameraSettings } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    setMapMarkers([
      {
        position: new Vector3(-85, 10, 0),
        type: "dialog",
        dialogContent: <TerrainDialog1 />,
        pointMode: true,
      },
      {
        position: new Vector3(105, 10, 0),
        type: "dialog",
        dialogContent: <TerrainDialog2 />,
        pointMode: true,
      },
      {
        position: new Vector3(-15, 10, 70),
        type: "dialog",
        dialogContent: <TerrainDialog3 />,
        pointMode: true,
      },
    ]);

    setCameraSettings({
      mode: CameraModes.Orbit,
      initialPosition: new Vector3(-34.25, 45.76, 125.32),
      target: new Vector3(0, 0, 0),
      fov: 70,
    });

    return () => {
      setMapMarkers([]);
    };
  }, [navigate, setMapMarkers, setCameraSettings]);

  return <SubPage title="Terrain and Mapping" objectIndex={0} modelView />;
};

export default TerrainPage;
