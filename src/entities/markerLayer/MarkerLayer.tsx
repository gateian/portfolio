import MapMarker from "../mapMarker/MapMarker";

import { useAppState } from "../../hooks/useAppState";

const MarkerLayer = () => {
  const { mapMarkers } = useAppState();

  return (
    <>
      <group>
        {mapMarkers.map((marker, index) => (
          <MapMarker
            key={index}
            id={index}
            type={marker.type}
            position={marker.position}
            image={marker.image}
            pointMode={marker?.pointMode || false}
            onClick={marker.onClick}
          />
        ))}
      </group>
    </>
  );
};

export default MarkerLayer;
