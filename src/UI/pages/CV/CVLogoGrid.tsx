import React from "react";
import styled from "@emotion/styled";

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 10px;
  & img {
    width: 100%;
    height: auto;
    max-width: 50px;
  }
`;

const svgFiles = [
  "react-2.svg",
  "graphql-logo-2.svg",
  "typescript.svg",
  "threejs-1.svg",
  "android-logomark.svg",
  "aws-2.svg",
  "docker-3.svg",
  "material-ui-1.svg",
  "nodejs-1.svg",
  "node-sass.svg",
  "photoshop.svg",
  "unity-technologies-logo.svg",
];

const CVLogoGrid: React.FC = () => {
  return (
    <IconGrid className="icon-grid">
      {svgFiles.map((fileName) => (
        <img
          key={fileName}
          src={`./icons/${fileName}`}
          alt={fileName.replace(".svg", "")}
          className="icon"
        />
      ))}
    </IconGrid>
  );
};

export default CVLogoGrid;
