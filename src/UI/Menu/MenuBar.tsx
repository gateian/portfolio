import { useState } from "react";
import { MenuBarButton, MenuBarWrapper } from "./MenuBar.style";
import { useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";

const MenuBar = () => {
  const [value, setValue] = useState(0);

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
