import { MenuBarWrapper } from "./MenuBar.style";
import MenuBarButton from "./MenuBarButton";
import { useLocation, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { isDebugMode } from "../../utils/generalUtils";

const MenuBar = () => {
  const navigate = useNavigate();

  const handleMenuItemClick = (itemIdx: number) => {
    const route = MenuItems[itemIdx]?.route || "/";
    const params = isDebugMode() ? "?debug=true" : "";
    navigate(`${route}${params}`);
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
