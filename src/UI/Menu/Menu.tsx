import { useState } from "react";
import { MenuIcon, MenuPopout, MenuWrapper } from "./Menu.style";

const Menu = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <MenuWrapper>
      <MenuIcon src={"/icons/hamburger-menu.svg"} onClick={handleMenuClick} />
      {menuOpen ? <MenuPopout /> : null}
    </MenuWrapper>
  );
};

export default Menu;
