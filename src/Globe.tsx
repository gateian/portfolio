import React from "react";
import { Viewer, Entity } from "resium";
import { Cartesian3 } from "cesium";

const Globe: React.FC = () => {
  return (
    <Viewer full>
      <Entity
        position={Cartesian3.fromDegrees(-74.006, 40.7128, 100000)}
        point={{ pixelSize: 10 }}
        description="Hello, NYC!"
      />
    </Viewer>
  );
};

export default Globe;
