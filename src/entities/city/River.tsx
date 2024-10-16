import useConvertGeojsonToExtrudedGeometry from "../../hooks/useConvertGeojsonToExtrudedGeometry";

const River = () => {
  const mergedGeometry = useConvertGeojsonToExtrudedGeometry({
    url: "./osm/Belfast_river.pbf",
    lat: 54.5844367,
    lon: -5.9284677,
  });

  return (
    <group position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {mergedGeometry ? (
        <mesh position={[0, 0, 0]}>
          <bufferGeometry attach="geometry" {...mergedGeometry} />
          <meshPhysicalMaterial color="rgb(57, 224, 223)" />
        </mesh>
      ) : null}
    </group>
  );
};

export default River;
