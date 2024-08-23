import { useEffect, useMemo } from "react";
import Delatin from "delatin";
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { DelatinTerrainMaterial } from "./DelatinTerrainMaterial";

extend({ DelatinTerrainMaterial });

interface DelatinTerrainProps {
  heightField: number[];
  wireframe?: boolean;
}

export const DelatinTerrain = (props: DelatinTerrainProps) => {
  const { heightField, wireframe } = props;
  const dimension = Math.sqrt(heightField.length);
  const tin = new Delatin(heightField, dimension, dimension);
  tin.run(0.03);
  const { coords, triangles } = tin;

  const geometry = useMemo(() => {
    const convertedCoords: number[] = [];

    for (let i = 0; i < coords.length; i += 2) {
      convertedCoords.push(coords[i] / dimension, 0, coords[i + 1] / dimension);
    }

    const geom = new THREE.BufferGeometry();

    // Convert coords to Float32Array for positions
    const positions = new Float32Array(convertedCoords);

    // Convert triangles to Uint32Array for indices
    const indices = new Uint32Array(triangles);

    // Set the position attribute
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Set the index attribute for triangles
    geom.setIndex(new THREE.BufferAttribute(indices, 3));

    // Calculate normals for shading
    geom.computeVertexNormals();

    return geom;
  }, [coords, triangles]);

  useEffect(() => {
    console.log(coords, triangles);
  }, [coords, triangles]);

  const scale = 50;
  return (
    <mesh
      geometry={geometry}
      position={new THREE.Vector3(-scale * 0.5, 0, -scale * 0.5)}
      scale={new THREE.Vector3(scale, scale, scale)}
    >
      {wireframe ? (
        <meshStandardMaterial color="lightgray" wireframe={true} />
      ) : (
        <delatinTerrainMaterial />
      )}
    </mesh>
  );
};
