import { useState } from "react";
import { MenuBarWrapper } from "./MenuBar.style";
import MenuBarButton from "./MenuBarButton";
import { useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";

const MenuBar = () => {
  const [value, setValue] = useState(0);

  const navigate = useNavigate();

  const handleMenuItemClick = (itemIdx: number) => {
    navigate(MenuItems[itemIdx]?.route || "/");
    setValue(itemIdx);
  };

  return (
    <MenuBarWrapper>
      {MenuItems.map((item, idx) => (
        <MenuBarButton
          key={item.id}
          label={item.label}
          icon={item.icon}
          selected={value === idx}
          onClick={() => handleMenuItemClick(idx)}
        />
      ))}
    </MenuBarWrapper>
  );
};

export default MenuBar;
