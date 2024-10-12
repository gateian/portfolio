import styled from "@emotion/styled";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";

export const MenuBarWrapper = styled(BottomNavigation)({
  position: "fixed",
  bottom: 0,
  width: "50%",
  display: "flex",
  justifyContent: "space-between",
  padding: "0.5rem 1rem",
  // backgroundColor: "rgba(255, 255, 255, 0.8)",
  color: "#333",
  borderRadius: "20px 20px 0 0",
  fontFamily: '"Kanit", sans-serif',
  backdropFilter: "blur(5px)",
});

export const MenuBarButton = styled(BottomNavigationAction)({
  pointerEvents: "auto",
  fontSize: "1rem",
  fontFamily: "Kanit",
  fontWeight: 300,
  textTransform: "uppercase",
  cursor: "pointer",
  color: "#333",
});
