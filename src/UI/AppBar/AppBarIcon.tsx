import { AppBarButtonWrapper } from "./AppBar.style";

interface AppBarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
}

const AppBarIcon = ({ icon, label, onClick, selected }: AppBarButtonProps) => {
  return (
    <AppBarButtonWrapper onClick={onClick} selected={selected}>
      <div>{icon}</div>
      <span>{label}</span>
    </AppBarButtonWrapper>
  );
};

export default AppBarIcon;
