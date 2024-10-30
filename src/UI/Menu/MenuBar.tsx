import { MenuBarWrapper } from "./MenuBar.style";
import MenuBarButton from "./MenuBarButton";
import { useLocation, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";

const MenuBar = () => {

  const navigate = useNavigate();

  const handleMenuItemClick = (itemIdx: number) => {
    navigate(MenuItems[itemIdx]?.route || "/");
  };

  const location = useLocation();

  return (
    <MenuBarWrapper>
      {MenuItems.map((item, idx) => (
        <MenuBarButton
          key={item.id}
          label={item.label}
          icon={item.icon}
          selected={location.pathname === item.route}
          onClick={() => handleMenuItemClick(idx)}
        />
      ))}
    </MenuBarWrapper>
  );
};

export default MenuBar;
