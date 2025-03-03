import { AppBarIconWrapper } from './AppBar.style';

interface AppBarIconProps {
  icon: React.ReactNode;
  label: string;
}

function AppBarIcon({ icon, label }: AppBarIconProps) {
  return (
    <AppBarIconWrapper>
      <div>{icon}</div>
      <span>{label}</span>
    </AppBarIconWrapper>
  );
}

export default AppBarIcon;
