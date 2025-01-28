import styled from "@emotion/styled";
import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import HarrierPage from "./pages/harrier/harrierPage";
import CVMain from "./pages/CV/CVMain";
import HomePage from "./pages/home/homePage";
import QueensPage from "./pages/queens/queensPage";
import TerrainPage from "./pages/terrain/terrainPage";
import CVArtMain from "./pages/CV/CVArtMain";

const ContentWrapper = styled.div({
  width: "100vw",
  position: "relative",
  display: "flex",
  flexBasis: "75vh",
  flexDirection: "row",
  alignItems: "center",
});

const CentreSpace = styled.div({
  flexGrow: 1,
  alignSelf: "flex-start",
  height: "75vh",
  overflow: "auto",
  position: "relative",
});

interface ContentAreaProps {
  children?: ReactNode;
}

const ContentArea: React.FC<ContentAreaProps> = () => {
  const location = useLocation();

  return (
    <ContentWrapper>
      <CentreSpace>
        {(() => {
          let content;
          switch (location.pathname) {
            case "/cv":
              content = <CVMain />;
              break;
            case "/cvart":
              content = <CVArtMain />;
              break;
            case "/terrain":
              content = <TerrainPage />;
              break;
            case "/queens":
              content = <QueensPage />;
              break;
            case "/combat":
              content = <HarrierPage />;
              break;
            case "/":
            default:
              content = <HomePage />;
              break;
          }

          return content;
        })()}
      </CentreSpace>
    </ContentWrapper>
  );
};

export default ContentArea;
