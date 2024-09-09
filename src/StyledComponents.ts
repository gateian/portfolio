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
  width: 100%;
  height: 100%;
  pointer-events: none; // This allows clicks to pass through to the globe
  z-index: 1000; // Ensure it's above the Cesium Viewer

  // You can adjust these styles as needed
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
`;

const HeroBanner = styled.div`
  color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 80%;
  text-align: center;
  pointer-events: auto; // This allows interaction with the banner
`;

export { ThreeContainer, Overlay, HeroBanner };
