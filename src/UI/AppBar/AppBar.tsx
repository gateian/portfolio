import {
  Icon3DSMax,
  IconBlender2,
  IconDavinciResolve,
  IconPhotoshop,
  IconUnity,
  IconUnrealEngine,
  IconZBrush,
  IconLinkedIn,
} from "./AppBar.icons";
import { AppBarWrapper } from "./AppBar.style";
import AppBarButton from "./AppBarButton";
import AppBarIcon from "./AppBarIcon";

interface AppBarItemsProps {
  type: "icon" | "button";
  name: string;
  icon: React.ReactNode;
  onclick?: () => void;
}

const AppBarItems: AppBarItemsProps[] = [
  {
    type: "icon",
    name: "3DS Max",
    icon: <Icon3DSMax />,
  },
  {
    type: "icon",
    name: "Blender",
    icon: <IconBlender2 />,
  },
  {
    type: "icon",
    name: "Photoshop",
    icon: <IconPhotoshop />,
  },
  {
    type: "icon",
    name: "Unity",
    icon: <IconUnity />,
  },
  {
    type: "icon",
    name: "Unreal",
    icon: <IconUnrealEngine />,
  },
  {
    type: "icon",
    name: "Resolve",
    icon: <IconDavinciResolve />,
  },
  {
    type: "icon",
    name: "Z Brush",
    icon: <IconZBrush />,
  },
  {
    type: "button",
    name: "Connect",
    icon: <IconLinkedIn />,
    onclick: () => {
      window.open("https://www.linkedin.com/in/ihamblin", "_blank");
    },
  },
];

const AppBar = () => {
  return (
    <AppBarWrapper>
      {AppBarItems.map((item, idx) => {
        if (item.type === "icon") {
          return <AppBarIcon key={idx} icon={item.icon} label={item.name} />;
        }

        return (
          <AppBarButton
            key={idx}
            label={item.name}
            icon={item.icon}
            selected={false}
            onClick={item.onclick}
          />
        );
      })}
    </AppBarWrapper>
  );
};

export default AppBar;
