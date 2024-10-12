import { Vector3 } from "three";
import MapMarker from "../mapMarker/MapMarker";
import { useTexture } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { GetMenuItem } from "../../UI/Menu/MenuItems";
import { MenuOptions } from "../../UI/Menu/Menu.enums";

const MarkerLayer = () => {
  const queensImage = useTexture("/icons/queens.png");
  const terrainImage = useTexture("/icons/terrainIcon.png");
  const combatImage = useTexture("/icons/combat.png");
  const navigate = useNavigate();

  const markers = [
    {
      position: new Vector3(-85, 10, 0),
      image: queensImage,
      onClick: () => navigate(GetMenuItem(MenuOptions.Queens).route),
    },
    {
      position: new Vector3(155, 10, 0),
      image: terrainImage,
      onClick: () => navigate(GetMenuItem(MenuOptions.Terrain).route),
    },
    {
      position: new Vector3(-15, 10, 90),
      image: combatImage,
      onClick: () => navigate(GetMenuItem(MenuOptions.Combat).route),
    },
  ];

  return (
    <>
      <group>
        {markers.map((marker, index) => (
          <MapMarker
            key={index}
            position={marker.position}
            image={marker.image}
            onClick={marker.onClick}
          />
        ))}
      </group>
    </>
  );
};

export default MarkerLayer;
