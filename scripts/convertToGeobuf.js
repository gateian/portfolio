import fs from "fs";
import geobuf from "geobuf";
import Pbf from "pbf";

// Function to convert GeoJSON to Geobuf and write it to a file
function convertGeoJsonToGeobuf(inputPath, outputPath) {
  try {
    // Step 1: Load GeoJSON data from file
    const geojsonData = JSON.parse(fs.readFileSync(inputPath, "utf8"));

    // Step 2: Encode GeoJSON to Geobuf
    const buffer = geobuf.encode(geojsonData, new Pbf());

    // Step 3: Write the resulting buffer to the output file
    fs.writeFileSync(outputPath, Buffer.from(buffer));

    console.log(`Geobuf data written to ${outputPath}`);
  } catch (err) {
    console.error("Error processing the file:", err);
  }
}

// Read input and output paths from command line arguments
const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Please provide input and output paths.");
  process.exit(1);
}

convertGeoJsonToGeobuf(inputPath, outputPath);
