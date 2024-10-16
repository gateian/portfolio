import { useEffect } from "react";
import Pbf from "pbf";
import geobuf from "geobuf";
import { FeatureCollection } from "geojson";

const useFetchGeojson = (
  url: string,
  setGeojson: React.Dispatch<React.SetStateAction<FeatureCollection | null>>
) => {
  useEffect(() => {
    if (url.endsWith(".geojson")) {
      fetch(url)
        .then((response) => response.json())
        .then((data) => setGeojson(data))
        .catch((error) => console.error("Error loading GeoJSON:", error));
    } else if (url.endsWith(".pbf")) {
      fetch(url)
        .then((response) => response.arrayBuffer())
        .then((data) => {
          const geojson = geobuf.decode(new Pbf(new Uint8Array(data)));
          setGeojson(geojson);
        })
        .catch((error) => console.error("Error loading GeoJSON:", error));
    } else {
      console.error("Invalid file type");
    }
  }, [url, setGeojson]);
};

export default useFetchGeojson;
