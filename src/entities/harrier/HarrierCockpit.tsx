import { useLoader } from "@react-three/fiber";
import { DRACOLoader } from "../../libs/three/loaders/DRACOLoader";
import { GLTFLoader } from "../../libs/three/loaders/GLTFLoader";

const HarrierCockpit = () => {
  const gltf = useLoader(
    GLTFLoader,
    "./3d/HarrierPortfolioExport.glb",
    (loader) => {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
      loader.setDRACOLoader(dracoLoader);
    }
  );

  return <primitive object={gltf.scene} />;
};

export default HarrierCockpit;
