import { useDebugState } from "./useDebugState";
import { Overlay } from "../StyledComponents";
import styled from "@emotion/styled";

const CameraPosition = styled("div")({
  padding: "10px",
  background: "rgba(0, 0, 0, 0.7)",
  color: "white",
  position: "absolute",
  top: "0px",
  left: "100px",
  borderRadius: "5px",
  lineHeight: "10px",
});

const Debug2D = () => {
  const { cameraPosition } = useDebugState();

  return (
    <Overlay>
      <CameraPosition>
        <h3>Camera Position</h3>
        <p>Y: {cameraPosition?.y.toFixed(2) || "-"}</p>
        <p>Z: {cameraPosition?.z.toFixed(2) || "-"}</p>
        <p>X: {cameraPosition?.x.toFixed(2) || "-"}</p>
      </CameraPosition>
    </Overlay>
  );
};

export default Debug2D;
