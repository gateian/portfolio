import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import styled from "@emotion/styled";
import React, { ReactNode, useCallback } from "react";
import { useAppState } from "../hooks/useAppState";
import { useLocation } from "react-router-dom";
import CombatPage from "./pages/combat/combatPage";
import CVMain from "./pages/CV/CVMain";
import HomePage from "./pages/home/homePage";
import QueensUni from "./pages/queens/queensUni";
import TerrainPage from "./pages/terrain/terrainPage";

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
  overflow: "hidden",
  position: "relative",
});

const ArrowLeft = styled(FaArrowLeft)({
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: "4rem",
  padding: "0 4rem",
  pointerEvents: "auto",
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "scale(1.3)",
    cursor: "pointer",
  },
});

const ArrowRight = styled(FaArrowRight)({
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: "4rem",
  padding: "0 4rem",
  pointerEvents: "auto",
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "scale(1.3)",
    cursor: "pointer",
  },
});

interface ContentAreaProps {
  children?: ReactNode;
}

const ContentArea: React.FC<ContentAreaProps> = () => {
  const { selectedObject, setSelectedObject, objectCount } = useAppState();

  const arrowClickHander = useCallback(
    (direction: "left" | "right") => {
      let newSelectedObject = 0;

      const operation = direction === "left" ? -1 : 1;

      newSelectedObject = selectedObject + operation;
      if (newSelectedObject < 0) {
        newSelectedObject = objectCount - 1;
      } else if (newSelectedObject >= objectCount) {
        newSelectedObject = 0;
      }

      setSelectedObject(newSelectedObject);
    },
    [selectedObject, setSelectedObject, objectCount]
  );

  const location = useLocation();

  return (
    <ContentWrapper>
      <ArrowLeft onClick={() => arrowClickHander("left")} />
      <CentreSpace>
        {(() => {
          let content;
          switch (location.pathname) {
            case "/cv":
              content = <CVMain />;
              break;
            case "/terrain":
              content = <TerrainPage />;
              break;
            case "/queens":
              content = <QueensUni />;
              break;
            case "/combat":
              content = <CombatPage />;
              break;
            case "/":
            default:
              content = <HomePage />;
              break;
          }

          return content;
        })()}
      </CentreSpace>
      <ArrowRight onClick={() => arrowClickHander("right")} />
    </ContentWrapper>
  );
};

export default ContentArea;
