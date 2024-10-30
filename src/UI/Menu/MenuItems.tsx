import { MenuOptions } from "./Menu.enums";
import HomeIcon from "@mui/icons-material/Home";
import QueensIcon from "@mui/icons-material/School";
import HarrierCockpitIcon from "@mui/icons-material/ConnectingAirports";
import TerrainIcon from "@mui/icons-material/Landscape";

const MenuItems = [
  {
    id: MenuOptions.Home,
    title: "Home",
    label: "Home",
    icon: <HomeIcon />,
    route: "/",
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

export const GetMenuItem = (id: MenuOptions) => {
  return MenuItems.find((item) => item.id === id) || MenuItems[0];
};

export const GetMenuItemByPath = (path: string) => {
  return MenuItems.find((item) => item.route === path) || MenuItems[0];
};

export default MenuItems;
