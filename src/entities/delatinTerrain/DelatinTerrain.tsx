import { useEffect, useMemo, useRef } from "react";
import Delatin from "delatin";
import * as THREE from "three";
import { DelatinTerrainMaterial } from "./DelatinTerrainMaterial";

interface DelatinTerrainProps {
  heightField: number[];
  heightMap?: THREE.DataTexture;
  albedoMap?: THREE.Texture;
  wireframe?: boolean;
}

export const DelatinTerrain = (props: DelatinTerrainProps) => {
  const { heightField, wireframe, heightMap, albedoMap } = props;
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const dimension = Math.sqrt(heightField.length);

  const { coords, triangles } = useMemo(() => {
    const tin = new Delatin(heightField, dimension, dimension);
    tin.run(0.02);
    return tin;
  }, [heightField, dimension]);

  const geometry = useMemo(() => {
    const convertedCoords: number[] = [];

    for (let i = 0; i < coords.length; i += 2) {
      convertedCoords.push(coords[i] / dimension, 0, coords[i + 1] / dimension);
    }

    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(convertedCoords);
    const indices = new Uint32Array(triangles);

    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setIndex(new THREE.BufferAttribute(indices, 1));

    geom.computeVertexNormals();

    return geom;
  }, [coords, dimension, triangles]);

  useEffect(() => {
    if (heightMap && !wireframe && materialRef.current) {
      const material = materialRef.current;
      material.uniforms.heightMap.value = heightMap;
      material.needsUpdate = true;
    }
  }, [heightMap, wireframe]);

  useEffect(() => {
    if (albedoMap && !wireframe && materialRef.current) {
      const material = materialRef.current;
      material.uniforms.albedoMap.value = albedoMap;
      material.needsUpdate = true;
    }
  }, [albedoMap, wireframe]);

  const scale = 400;
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={new THREE.Vector3(-scale * 0.5, 1, -scale * 0.5)}
      scale={new THREE.Vector3(scale, scale * 0.03, scale)}
    >
      {wireframe ? (
        <meshStandardMaterial color="black" wireframe={true} />
      ) : (
        <DelatinTerrainMaterial ref={materialRef} />
      )}
    </mesh>
  );
};
