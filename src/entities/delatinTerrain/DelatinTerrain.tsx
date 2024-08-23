import { useEffect, useMemo } from "react";
import Delatin from "delatin";
import * as THREE from "three";

interface DelatinTerrainProps {
  heightField: number[];
}
export const DelatinTerrain = (props: DelatinTerrainProps) => {
  const { heightField } = props;
  const dimension = Math.sqrt(heightField.length);
  const tin = new Delatin(heightField, dimension, dimension);
  tin.run(0.01);
  const { coords, triangles } = tin;

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();

    // Convert coords to Float32Array for positions
    const positions = new Float32Array(coords);

    // Convert triangles to Uint32Array for indices
    const indices = new Uint32Array(triangles);

    // Set the position attribute
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Set the index attribute for triangles
    geom.setIndex(new THREE.BufferAttribute(indices, 1));

    // Calculate normals for shading
    geom.computeVertexNormals();

    return geom;
  }, [coords, triangles]);

  useEffect(() => {
    console.log(coords, triangles);
  }, [coords, triangles]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="lightgray" wireframe={true} />
    </mesh>
  );
};
