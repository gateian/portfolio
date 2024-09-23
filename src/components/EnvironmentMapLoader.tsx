import { useEffect, useRef } from "react";
import {
  Texture,
  WebGLRenderer,
  PMREMGenerator,
  CubeTextureLoader,
  CubeTexture,
  EquirectangularReflectionMapping,
} from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { useAppState } from "../StateProvider";
import { useThree } from "@react-three/fiber";

interface EnvironmentMapLoaderProps {
  onLoad?: (envMap: Texture) => void;
}

const EnvironmentMapLoader: React.FC<EnvironmentMapLoaderProps> = ({
  onLoad,
}) => {
  const envMapRef = useRef<Texture | null>(null);
  const { setEnvironmentMap } = useAppState();
  const { scene } = useThree();
  //   useEffect(() => {
  //     const urls = [
  //       "/3d/envMap/px.png",
  //       "/3d/envMap/nx.png",
  //       "/3d/envMap/py.png",
  //       "/3d/envMap/ny.png",
  //       "/3d/envMap/pz.png",
  //       "/3d/envMap/nz.png",
  //     ];

  //     const loader = new CubeTextureLoader();
  //     loader.load(urls, (texture: CubeTexture) => {
  //       const renderer = new WebGLRenderer();
  //       const pmremGenerator = new PMREMGenerator(renderer);
  //       pmremGenerator.compileCubemapShader();
  //       const envMap = pmremGenerator.fromCubemap(texture).texture;

  //       pmremGenerator.dispose();
  //       renderer.dispose();

  //       envMapRef.current = envMap;

  //       setEnvironmentMap(envMap);
  //       scene.environment = envMap;
  //       if (onLoad) {
  //         onLoad(envMap);
  //       }
  //     });

  //     return () => {
  //       if (envMapRef.current) {
  //         envMapRef.current.dispose();
  //       }
  //       setEnvironmentMap(null);
  //     };
  //   }, [onLoad, setEnvironmentMap]);

  useEffect(() => {
    scene.environment = new RGBELoader().load(
      "textures/equirectangular/venice_sunset_1k.hdr"
    );
    scene.environment.mapping = EquirectangularReflectionMapping;
  }, [scene]);

  return null;
};

export default EnvironmentMapLoader;
