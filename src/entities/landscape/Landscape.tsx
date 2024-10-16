import { extend } from "@react-three/fiber";
import { useMemo, useState } from "react";
import * as THREE from "three";
import { LandscapeMaterial } from "./LandscapeMaterial";
import { useTexture } from "@react-three/drei";
import { DelatinTerrain } from "../delatinTerrain/DelatinTerrain";
import { Texture } from "three";

extend({ LandscapeMaterial });

function Landscape() {
  const heightmap: Texture = useTexture(
    "./hires/heightmap.jpg"
  ) as unknown as Texture;
  const albedo = useTexture("./hires/albedo.jpg") as unknown as Texture;
  const [heightField, setHeightField] = useState<number[]>([]);

  const dataTexture = useMemo(() => {
    if (!heightmap) return undefined;

    const canvas = document.createElement("canvas");
    canvas.width = heightmap.image.width;
    canvas.height = heightmap.image.height;
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Could not get 2d context");
      return undefined;
    }

    context.drawImage(heightmap.image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Create a new array with only the red channel data
    const newHeightField: number[] = [];
    const redChannelData = new Uint8Array(imageData.width * imageData.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      redChannelData[i / 4] = imageData.data[i];
      newHeightField.push(imageData.data[i] / 255);
    }

    const texture = new THREE.DataTexture(
      redChannelData,
      imageData.width,
      imageData.height,
      THREE.RedFormat,
      THREE.UnsignedByteType
    );

    texture.needsUpdate = true;

    setHeightField(newHeightField);
    return texture;
  }, [heightmap]);

  console.log("Albedo:", albedo);
  return (
    <>
      {heightField && albedo ? (
        <DelatinTerrain
          albedoMap={albedo}
          heightField={heightField}
          heightMap={dataTexture}
        />
      ) : null}
    </>
  );
}

export default Landscape;
