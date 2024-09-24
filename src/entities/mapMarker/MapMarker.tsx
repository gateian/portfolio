import { Billboard, useTexture } from "@react-three/drei";

const Marker = ({ position }: { position: [number, number, number] }) => {
  const texture = useTexture("/icons/mapMarker.png");

  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} transparent={true} />
      </mesh>
    </Billboard>
  );
};

export default Marker;
