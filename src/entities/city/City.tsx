import useConvertGeojsonToExtrudedGeometry from "../../hooks/useConvertGeojsonToExtrudedGeometry";

const City = () => {
  const mergedGeometry = useConvertGeojsonToExtrudedGeometry({
    url: "./osm/Belfast.geojson",
    lat: 54.5844367,
    lon: -5.9284677,
  });

  return (
    <group position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {mergedGeometry ? (
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <bufferGeometry attach="geometry" {...mergedGeometry} />
          <meshPhysicalMaterial color="#666" />
        </mesh>
      ) : null}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <planeGeometry attach="geometry" args={[1000, 1000]} />
        <shadowMaterial attach="material" opacity={1} />
      </mesh>
    </group>
  );
};

export default City;
