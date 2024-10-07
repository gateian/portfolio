import { FeatureCollection } from "geojson";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

interface GeoJSONLineFeature {
  type: "Feature";
  properties: {};
  geometry: {
    type: "LineString";
    coordinates: number[][];
  };
}

interface useConvertGeojsonToLineGeometryProps {
  url: string;
  lat: number;
  lon: number;
}

const useConvertGeojsonToLineGeometry = (
  props: useConvertGeojsonToLineGeometryProps
) => {
  const { url, lat, lon } = props;

  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => setGeojson(data))
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, [url]);

  const scale = 25000;

  const lines = useMemo(() => {
    if (geojson) {
      const lineFeatures = geojson.features.filter((feature) => {
        return feature.geometry.type === "LineString";
      });

      const multiLinePoints = lineFeatures.map((feature) => {
        const lineString: number[][] = (
          feature.geometry as unknown as GeoJSONLineFeature["geometry"]
        ).coordinates;

        const linePoints = lineString.flatMap(([xOriginal, yOriginal]) => {
          const x = (xOriginal - lon) * scale * Math.cos((lat * Math.PI) / 180);
          const y = (yOriginal - lat) * scale;

          return [x, y, 0];
        });

        return linePoints;
      });

      return multiLinePoints;
    }
  }, [geojson]);

  const width = 1.2;

  const geometry = useMemo(() => {
    if (lines) {
      const meshGeometry = new THREE.BufferGeometry();
      const positions: number[] = [];
      const indices: number[] = [];

      lines.forEach((line: number[]) => {
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(line, 3)
        );

        const tempPositions = [];
        const up = new THREE.Vector3(0, 1, 0);
        const previous = new THREE.Vector3();
        const current = new THREE.Vector3();
        const next = new THREE.Vector3();

        for (let i = 0; i < line.length / 3; i++) {
          current.set(line[i * 3], line[i * 3 + 2], -line[i * 3 + 1]);

          if (i > 0) {
            previous.set(
              line[(i - 1) * 3],
              line[(i - 1) * 3 + 2],
              -line[(i - 1) * 3 + 1]
            );
          } else {
            previous.copy(current);
          }

          if (i < line.length / 3 - 1) {
            next.set(
              line[(i + 1) * 3],
              line[(i + 1) * 3 + 2],
              -line[(i + 1) * 3 + 1]
            );
          } else {
            next.copy(current);
          }

          const direction = new THREE.Vector3()
            .subVectors(next, previous)
            .normalize();
          const perpendicular = new THREE.Vector3()
            .crossVectors(up, direction)
            .normalize();
          const offset = perpendicular.multiplyScalar(width / 2);

          tempPositions.push(
            current.x + offset.x,
            current.y + offset.y,
            current.z + offset.z,
            current.x - offset.x,
            current.y - offset.y,
            current.z - offset.z
          );
        }

        const baseIndex = positions.length / 3;
        positions.push(...tempPositions);

        for (let i = 0; i < tempPositions.length / 3 - 2; i += 2) {
          indices.push(
            baseIndex + i,
            baseIndex + i + 1,
            baseIndex + i + 2,
            baseIndex + i + 2,
            baseIndex + i + 1,
            baseIndex + i + 3
          );
        }
      });

      meshGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      meshGeometry.setIndex(indices);
      meshGeometry.computeVertexNormals();

      return meshGeometry;
    }
  }, [lines, width]);

  return geometry;
};

export default useConvertGeojsonToLineGeometry;
