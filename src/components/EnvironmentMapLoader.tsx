import { useEffect, useRef } from "react";
import {
  Texture,
  WebGLRenderer,
  PMREMGenerator,
  CubeTextureLoader,
  CubeTexture,
} from "three";
import { useAppState } from "../StateProvider";

interface EnvironmentMapLoaderProps {
  onLoad?: (envMap: Texture) => void;
}

const EnvironmentMapLoader: React.FC<EnvironmentMapLoaderProps> = ({
  onLoad,
}) => {
  const envMapRef = useRef<Texture | null>(null);
  const { setEnvironmentMap } = useAppState();

  useEffect(() => {
    const urls = [
      "/3d/envMap/px.png",
      "/3d/envMap/nx.png",
      "/3d/envMap/py.png",
      "/3d/envMap/ny.png",
      "/3d/envMap/pz.png",
      "/3d/envMap/nz.png",
    ];

    const loader = new CubeTextureLoader();
    loader.load(urls, (texture: CubeTexture) => {
      const renderer = new WebGLRenderer();
      const pmremGenerator = new PMREMGenerator(renderer);
      const envMap = pmremGenerator.fromCubemap(texture).texture;
      pmremGenerator.dispose();
      renderer.dispose();

      envMapRef.current = envMap;

      setEnvironmentMap(envMap);
      if (onLoad) {
        onLoad(envMap);
      }
    });

    return () => {
      if (envMapRef.current) {
        envMapRef.current.dispose();
      }
      setEnvironmentMap(null);
    };
  }, [onLoad, setEnvironmentMap]);

  return null;
};

export default EnvironmentMapLoader;
