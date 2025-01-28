import styled from "@emotion/styled";

export const AppBarWrapper = styled("div")({
  padding: "1rem",
  zIndex: 100,
  pointerEvents: "auto",
  position: "absolute",
  bottom: "5rem",
  backgroundColor: "rgba(0, 0, 0, 0.1)",
  display: "flex",
  color: "white",
});

interface AppBarButtonProps {
  selected?: boolean;
}

export const AppBarButtonWrapper = styled("div")<AppBarButtonProps>(
  (props) => ({
    flexGrow: 1,
    fontSize: "0.9rem",
    fontFamily: "Zuume",
    fontWeight: 300,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0.5rem",
    textTransform: "uppercase",
    cursor: "pointer",
    color: props.selected ? "white" : "#111",
    textAlign: "center",
    backgroundColor: "#ddd",
    pointerEvents: props.selected ? "none" : "auto",
    "& svg": {
      width: "40px",
      height: "40px",
      marginBottom: "0.1rem",
    },
    "&:hover": {
      color: "#ddd",
      backgroundColor: "#111",
    },
  })
);

export const AppBarIconWrapper = styled("div")({
  flexGrow: 1,
  fontSize: "0.9rem",
  fontFamily: "Zuume",
  fontWeight: 300,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0.5rem",
  textTransform: "uppercase",
  cursor: "pointer",
  color: "white",
  textAlign: "center",
  backgroundColor: "transparent",
  pointerEvents: "none",
  "& svg": {
    width: "40px",
    height: "40px",
    marginBottom: "0.1rem",
  },
});
