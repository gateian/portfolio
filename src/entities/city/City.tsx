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
        <mesh position={[0, 0, 0]}>
          <bufferGeometry attach="geometry" {...mergedGeometry} />
          <meshPhysicalMaterial color="grey" />
        </mesh>
      ) : null}
    </group>
  );
};

export default City;
