import styled from "@emotion/styled";

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
  overflowY: props.expanded ? "auto" : "hidden",
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
  height: props.expanded ? "75vh" : "8vh",
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
  },
}));
