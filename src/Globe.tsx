import React from "react";
import { Viewer, Entity, Camera, CameraFlyTo } from "resium";
import { Cartesian3 } from "cesium";
import styled from "@emotion/styled";

const GlobeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
`;

const StyledViewer = styled(Viewer)`
  width: 100%;
  height: 100%;
`;

const Globe: React.FC = () => {
  return (
    <GlobeContainer>
      <StyledViewer full>
        <Entity
          position={Cartesian3.fromDegrees(-74.006, 40.7128, 100000)}
          point={{ pixelSize: 10 }}
          description="Hello, NYC!"
        />
        <CameraFlyTo
          duration={5}
          destination={Cartesian3.fromDegrees(-74.006, 40.7128, 1000)}
        />
      </StyledViewer>
    </GlobeContainer>
  );
};

export default Globe;
