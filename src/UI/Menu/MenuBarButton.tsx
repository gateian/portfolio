import { MenuBarButtonWrapper } from "./MenuBar.style";

interface MenuBarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
}
const MenuBarButton = ({
  icon,
  label,
  onClick,
  selected,
}: MenuBarButtonProps) => {
  return (
    <MenuBarButtonWrapper onClick={onClick} selected={selected}>
      <div>{icon}</div>
      <span>{label}</span>
    </MenuBarButtonWrapper>
  );
};

export default MenuBarButton;
