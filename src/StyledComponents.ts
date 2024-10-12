import styled from "@emotion/styled";

const ThreeContainer = styled.div({
  width: "100vw",
  height: "100vh",
  position: "fixed",
  top: 0,
  left: 0,
});

const Overlay = styled.div({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  pointerEvents: "none",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
});

const HeroBanner = styled.div({
  color: "white",
  flexBasis: "15vh",
  flexShrink: 0,
  width: "100%",
  display: "flex",
  pointerEvents: "auto",
  backdropFilter: "blur(5px)",
  backgroundColor: "#00000066",
});

const HeroBannerSideColumn = styled.div({
  flexBasis: "25vh",
  flexShrink: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  align: "center",
  flexGrow: 1,
});

export { ThreeContainer, Overlay, HeroBanner, HeroBannerSideColumn };
