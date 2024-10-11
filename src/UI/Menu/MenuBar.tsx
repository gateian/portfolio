import HomeIcon from "@mui/icons-material/Home";
import QueensIcon from "@mui/icons-material/School";
import HarrierCockpitIcon from "@mui/icons-material/ConnectingAirports";
import TerrainIcon from "@mui/icons-material/Landscape";
import CVIcon from "@mui/icons-material/Description";
import { useState } from "react";
import { MenuBarButton, MenuBarWrapper } from "./MenuBar.style";
import { MenuOptions } from "./Menu.enums";
import { useNavigate } from "react-router-dom";

const MenuBar = () => {
  const [value, setValue] = useState(0);

  const MenuItems = [
    {
      id: MenuOptions.Home,
      title: "Home",
      label: "Home",
      icon: <HomeIcon />,
      route: "/",
    },
    {
      id: MenuOptions.CV,
      title: "CV / Resume",
      label: "CV",
      icon: <CVIcon />,
      route: "/cv",
    },
    {
      id: MenuOptions.Terrain,
      title: "Terrain and Mapping",
      label: "Mapping",
      icon: <TerrainIcon />,
      route: "/terrain",
    },
    {
      id: MenuOptions.Queens,
      title: "Queens University 3D Model",
      label: "Queens",
      icon: <QueensIcon />,
      route: "/queens",
    },
    {
      id: MenuOptions.Combat,
      title: "Combat Air Patrol 2",
      label: "Harrier",
      icon: <HarrierCockpitIcon />,
      route: "/combat",
    },
  ];

  const navigate = useNavigate();

  const handleMenuItemClick = (
    _event: React.SyntheticEvent,
    itemIdx: number
  ) => {
    navigate(MenuItems[itemIdx]?.route || "/");
    setValue(itemIdx);
  };

  return (
    <MenuBarWrapper
      value={value}
      onChange={handleMenuItemClick}
      showLabels
      className="menu-bar-navigation"
    >
      {MenuItems.map((item) => (
        <MenuBarButton key={item.id} label={item.label} icon={item.icon} />
      ))}
    </MenuBarWrapper>
  );
};

export default MenuBar;
