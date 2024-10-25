import styled from "@emotion/styled";

export const MenuBarWrapper = styled("div")({
  position: "fixed",
  bottom: 0,
  height: "4rem",
  width: "100%",
  maxWidth: "800px",
  display: "flex",
  justifyContent: "space-between",
  padding: "0",
  color: "#333",
  borderRadius: "20px 20px 0 0",
  fontFamily: '"Kanit", sans-serif',
  backgroundColor: "rgba(255, 255, 255, 1)",
  overflow: "hidden",
  "@media (max-width: 800px)": {
    width: "100%",
    borderRadius: "0",
  },
});

interface MenuBarButtonProps {
  selected?: boolean;
}

export const MenuBarButtonWrapper = styled("div")<MenuBarButtonProps>(
  (props) => ({
    flexGrow: 1,
    fontSize: "0.9rem",
    fontFamily: "Kanit",
    fontWeight: 300,
    textTransform: "uppercase",
    cursor: "pointer",
    color: props.selected ? "white" : "#333",
    textAlign: "center",
    backgroundColor: props.selected ? "#333" : "transparent",
    pointerEvents: props.selected ? "none" : "auto",
    "& div": {
      paddingTop: "0.5rem",
    },
    "&:hover": {
      color: "#333",
      backgroundColor: "#ddd",
    },
  })
);
