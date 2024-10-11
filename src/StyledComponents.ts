import styled from "@emotion/styled";

const ThreeContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

const HeroBanner = styled.div`
  color: white;
  flex-basis: 25vh;
  flex-shrink: 0;
  width: 100%;
  display: flex;
  pointer-events: auto;
  backdrop-filter: blur(5px);
`;

const HeroBannerSideColumn = styled.div`
  flex-basis: 25vh;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  align: center;
  flex-grow: 1;
`;

export { ThreeContainer, Overlay, HeroBanner, HeroBannerSideColumn };
