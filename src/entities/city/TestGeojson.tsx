import { FeatureCollection } from "geojson";
import React, { useCallback, useEffect, useState } from "react";
import { Shape } from "three";

interface GeoJSONFeature {
  type: "Feature";
  properties: {
    height: number;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

const TestGeojson: React.FC = () => {
  //   const url = "./osm/Barcelona.geojson";
  const url = "./osm/Belfast.geojson";

  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => setGeojson(data))
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, [url]);

  const geoJsonToShape = useCallback((geoJSON: GeoJSONFeature) => {
    const shape = new Shape();

    const coordinates = geoJSON.geometry.coordinates[0];

    // Barcelona
    // const center = {
    //   lat: 41.3826176,
    //   lon: 2.1900785,
    // };

    // Belfast
    const center = {
      lat: 54.5844367,
      lon: -5.9284677,
    };

    const scale = 25000;

    coordinates.forEach((coord, index) => {
      const x =
        (coord[0] - center.lon) *
        scale *
        Math.cos((center.lat * Math.PI) / 180);
      const y = (coord[1] - center.lat) * scale;

      if (index === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    });

    return { shape, center };
  }, []);

  if (!geojson) return null;

  return (
    <group position={[0, -40, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {geojson.features.map((feature, index) => {
        const { shape, center } = geoJsonToShape(feature as GeoJSONFeature);
        console.log("shape", shape, "center", center);

        if (feature.properties?.height != null) {
          console.log("height found");
        }
        const extrudeSettings = {
          steps: 1,
          depth:
            feature.properties?.height == null
              ? feature.properties?.height
              : Math.random() * (10 - 1) + 1,
          bevelEnabled: true,
        };
        return (
          <mesh key={index} position={[center.lon, 0, center.lat]}>
            <extrudeGeometry args={[shape, extrudeSettings]} />
            <meshPhysicalMaterial color="grey" />
          </mesh>
        );
      })}
    </group>
  );
};

export default TestGeojson;
