import { Vector3 } from "three";
import SubPage from "../../SubPage/SubPage";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../../hooks/useAppState";
import TerrainDialog1 from "./terrainDialog1";

const TerrainPage = () => {
  const { setMapMarkers } = useAppState();
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
        position: new Vector3(155, 10, 0),
        type: "dialog",
        dialogContent: <TerrainDialog1 />,
        pointMode: true,
      },
      {
        position: new Vector3(-15, 10, 90),
        type: "dialog",
        dialogContent: <TerrainDialog1 />,
        pointMode: true,
      },
    ]);

    return () => {
      setMapMarkers([]);
    };
  }, [navigate, setMapMarkers]);

  return <SubPage title="Terrain and Mapping" objectIndex={0} modelView />;
};

export default TerrainPage;
