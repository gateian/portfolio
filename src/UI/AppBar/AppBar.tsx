import {
  Icon3DSMax,
  IconBlender2,
  IconPhotoshop,
  IconZBrush,
} from "./AppBar.icons";
import { AppBarWrapper } from "./AppBar.style";
import AppBarIcon from "./AppBarIcon";

interface AppBarItemsProps {
  type: "icon" | "button";
  name: string;
  icon: React.FC;
}

const AppBarItems: AppBarItemsProps[] = [
  {
    type: "icon",
    name: "3DS Max",
    icon: Icon3DSMax,
  },
  {
    type: "icon",
    name: "Blender",
    icon: IconBlender2,
  },
  {
    type: "icon",
    name: "Photoshop",
    icon: IconPhotoshop,
  },
  {
    type: "icon",
    name: "Z Brush",
    icon: IconZBrush,
  },
];

const AppBar = () => {
  return (
    <AppBarWrapper>
      {AppBarItems.map((item, idx) => (
        <AppBarIcon
          key={idx}
          label={item.name}
          icon={<item.icon />}
          selected={false}
          onClick={() => {}}
        />
      ))}
    </AppBarWrapper>
  );
};

export default AppBar;
