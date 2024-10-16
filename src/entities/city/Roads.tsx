import useConvertGeojsonToLineGeometry from "../../hooks/useConvertGeoJsonToLineGeometry";

const Roads = () => {
  const geometry = useConvertGeojsonToLineGeometry({
    url: "./osm/Belfast_roads.pbf",
    lat: 54.5844367,
    lon: -5.9284677,
  });

  return (
    <mesh geometry={geometry} position={[0, -1, 0]}>
      <meshBasicMaterial color="rgb(70, 70, 70)" />
    </mesh>
  );
};

export default Roads;
