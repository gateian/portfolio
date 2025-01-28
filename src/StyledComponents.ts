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
  background: "transparent",
  backgroundImage: "radial-gradient(black 1px, transparent 0)",
  backgroundSize: "4px 4px",
  backgroundPosition: "-19px -19px",
});

const HeroBanner = styled.div({
  color: "white",
  flexBasis: "15vh",
  flexShrink: 0,
  width: "100%",
  display: "flex",
  pointerEvents: "auto",
  marginTop: "50px",
});

const HeroBannerSideColumn = styled.div({
  flexGrow: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  align: "center",
});

export { ThreeContainer, Overlay, HeroBanner, HeroBannerSideColumn };
