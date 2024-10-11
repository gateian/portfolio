import styled from "@emotion/styled";
import { IconButton } from "@mui/material";

interface PageWrapperProps {
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  modelView?: boolean;
  expanded?: boolean;
}

export const PageWrapper = styled.div<PageWrapperProps>((props) => ({
  margin: 0,
  padding: 0,
  width: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  backgroundColor: props.backgroundColor || "white",
  color: props.color || "black",
  pointerEvents: "all",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderRadius: "0 0 20px 20px",
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 200,
  minHeight: "8vh",
  height: props.expanded ? "80vh" : "8vh",
  transition: "height 0.3s ease-in-out",

  "& h1": {
    fontWeight: 100,
    textAlign: "center",
    textTransform: "uppercase",
    fontSize: "1.8rem",
  },

  "& p": {
    fontSize: "1rem",
    fontWeight: 100,
    maxWidth: "800px",
    border: "1px solid white",
  },
}));

interface ExpandMoreButtonProps {
  expanded?: boolean;
}

export const ExpandMoreButton = styled(IconButton)<ExpandMoreButtonProps>(
  (props) => ({
    position: "absolute",
    right: "40px",
    top: "20px",
    pointerEvents: "auto",
    cursor: "pointer",
    transform: props.expanded ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.3s ease-in-out",
    marginBottom: "1rem",
  })
);
