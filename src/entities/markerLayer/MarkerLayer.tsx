import { Vector3 } from "three";
import MapMarker from "../mapMarker/MapMarker";
import { useTexture } from "@react-three/drei";
import { useLocation, useNavigate } from "react-router-dom";
import { GetMenuItem, GetMenuItemByPath } from "../../UI/Menu/MenuItems";
import { MenuOptions } from "../../UI/Menu/Menu.enums";

const MarkerLayer = () => {
  const queensImage = useTexture("/icons/queens.png");
  const terrainImage = useTexture("/icons/terrainIcon.png");
  const combatImage = useTexture("/icons/combat.png");
  const navigate = useNavigate();

  const pages = [
    {
      id: MenuOptions.Home,
      markers: [
        {
          id: MenuOptions.Queens,
          position: new Vector3(-85, 10, 0),
          image: queensImage,
          onClick: () => navigate(GetMenuItem(MenuOptions.Queens).route),
        },
        {
          id: MenuOptions.Terrain,
          position: new Vector3(155, 10, 0),
          image: terrainImage,
          onClick: () => navigate(GetMenuItem(MenuOptions.Terrain).route),
        },
        {
          id: MenuOptions.Combat,
          position: new Vector3(-15, 10, 90),
          image: combatImage,
          onClick: () => navigate(GetMenuItem(MenuOptions.Combat).route),
        },
      ],
    },
    {
      id: MenuOptions.CV,
      markers: [],
    },
    {
      id: MenuOptions.Queens,
      markers: [],
    },
    {
      id: MenuOptions.Terrain,
      markers: [],
    },
    {
      id: MenuOptions.Combat,
      markers: [],
    },
  ];

  const location = useLocation();
  const currentId = GetMenuItemByPath(location.pathname).id;
  const currentPage = pages.find((page) => page.id === currentId);
  return (
    <>
      <group>
        {currentPage?.markers.map((marker, index) => (
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
