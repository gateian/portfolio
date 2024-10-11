import { useState } from "react";
import { MenuIcon, MenuWrapper } from "./Menu.style";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { MenuOptions } from "./Menu.enums";
import { useNavigate } from "react-router-dom";

const MainMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate();

  const MenuItems = [
    {
      id: MenuOptions.Home,
      title: "Home",
      route: "/",
    },
    {
      id: MenuOptions.CV,
      title: "CV / Resume",
      route: "/cv",
    },
    {
      id: MenuOptions.Terrain,
      title: "Terrain and Mapping",
      route: "/terrain",
    },
    {
      id: MenuOptions.Queens,
      title: "Queens University 3D Model",
      route: "/queens",
    },
    {
      id: MenuOptions.Combat,
      title: "Combat Air Patrol 2",
      route: "/combat",
    },
  ];

  const handleMenuItemClick = (id: MenuOptions) => {
    console.log(
      `Menu item clicked: ${MenuItems.find((item) => item.id === id)?.title}`
    );
    const menuItem = MenuItems.find((item) => item.id === id);
    navigate(menuItem?.route || "/");
    handleClose();
  };

  return (
    <MenuWrapper>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MenuIcon src={"/icons/hamburger-menu.svg"} />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {MenuItems.map((item) => (
          <MenuItem key={item.id} onClick={() => handleMenuItemClick(item.id)}>
            {item.title}
          </MenuItem>
        ))}
      </Menu>
    </MenuWrapper>
  );
};

export default MainMenu;
