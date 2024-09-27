import { FeatureCollection } from "geojson";
import React, { useCallback, useEffect, useState } from "react";
import { BufferGeometry, ExtrudeGeometry, Shape } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

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

const City: React.FC = () => {
  //   const url = "./osm/Barcelona.geojson";
  const url = "./osm/Belfast.geojson";

  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [mergedGeometry, setMergedGeometry] = useState<BufferGeometry | null>(
    null
  );

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => setGeojson(data))
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, [url]);

  useEffect(() => {
    console.log("Belfast Data Loaded");

    if (geojson) {
      {
        const extrudedGeometries = geojson.features.map((feature) => {
          const { shape } = geoJsonToShape(feature as GeoJSONFeature);

          const extrudeSettings = {
            steps: 1,
            depth:
              feature.properties?.height == null
                ? feature.properties?.height
                : Math.random() * (10 - 1) + 1,
            bevelEnabled: true,
            bevelThickness: 0.3,
            bevelSegments: 1,
          };

          return new ExtrudeGeometry(shape, extrudeSettings);
        });

        setMergedGeometry(mergeGeometries(extrudedGeometries));
      }
    }
  }, [geojson]);

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
      {mergedGeometry ? (
        <mesh position={[0, 0, 0]}>
          <bufferGeometry attach="geometry" {...mergedGeometry} />
          <meshPhysicalMaterial color="grey" />
        </mesh>
      ) : null}
    </group>
  );
};

export default City;
