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
  text-align: center;
  pointer-events: auto;
`;

export { ThreeContainer, Overlay, HeroBanner };
