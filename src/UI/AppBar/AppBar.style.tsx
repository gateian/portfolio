import styled from "@emotion/styled";

export const AppBarWrapper = styled.div`
  padding: 1rem;
  z-index: 100;
  pointer-events: auto;
  position: absolute;
  bottom: 0;
  background-color: #fff;
  display: flex;
`;

export const MenuIcon = styled.img`
  width: 50px;
  height: auto;
  cursor: pointer;
  fill: white;
`;

export const MenuPopout = styled.div`
  width: 200px;
  min-height: 50px;
  background-color: white;
  color: black;
  position: absolute;
  right: 0;
`;

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
    color: props.selected ? "white" : "#333",
    textAlign: "center",
    backgroundColor: props.selected ? "#333" : "transparent",
    pointerEvents: props.selected ? "none" : "auto",
    "& svg": {
      width: "50px",
      height: "50px",
      marginBottom: "0.5rem",
    },
    "&:hover": {
      color: "#333",
      backgroundColor: "#ddd",
    },
  })
);
