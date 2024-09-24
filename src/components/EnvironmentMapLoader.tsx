import { useEffect } from "react";
import { Texture, EquirectangularReflectionMapping } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { useAppState } from "../hooks/useAppState";
import { useThree } from "@react-three/fiber";

const EnvironmentMapLoader: React.FC = () => {
  const { setEnvironmentMap } = useAppState();
  const { scene } = useThree();

  useEffect(() => {
    scene.environment = new RGBELoader().load(
      "3d/envMap/venice_sunset_1k.hdr",
      (texture: Texture) => {
        texture.mapping = EquirectangularReflectionMapping;

        setEnvironmentMap(texture);
      }
    );
  }, [scene, setEnvironmentMap]);

  return null;
};

export default EnvironmentMapLoader;
