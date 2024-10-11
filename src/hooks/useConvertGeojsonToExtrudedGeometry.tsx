import { FeatureCollection } from "geojson";
import { useCallback, useEffect, useState } from "react";
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

interface useConvertGeojsonToGeometryProps {
  url: string;
  lat: number;
  lon: number;
}

const useConvertGeojsonToExtrudedGeometry = (
  props: useConvertGeojsonToGeometryProps
) => {
  const { url, lat, lon } = props;

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

  const geoJsonToShape = useCallback(
    (geoJSON: GeoJSONFeature) => {
      const shape = new Shape();

      const coordinates = geoJSON.geometry.coordinates[0];

      const scale = 25000;

      coordinates.forEach((coord, index) => {
        const x = (coord[0] - lon) * scale * Math.cos((lat * Math.PI) / 180);
        const y = (coord[1] - lat) * scale;

        if (index === 0) {
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      });

      return { shape };
    },
    [lat, lon]
  );

  useEffect(() => {
    if (geojson) {
      {
        const polygonFeatures = geojson.features.filter((feature) => {
          return feature.geometry.type === "Polygon";
        });

        const extrudedGeometries = polygonFeatures.flatMap((feature) => {
          if (feature.geometry.type !== "Polygon") {
            return [];
          }

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
  }, [geojson, geoJsonToShape]);

  if (!geojson) return null;

  return mergedGeometry;
};

export default useConvertGeojsonToExtrudedGeometry;
