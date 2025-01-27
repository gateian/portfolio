import styled from "@emotion/styled";
import "./App.css";
import { StateProvider } from "./StateContext";
import {
  Overlay,
  HeroBanner,
  ThreeContainer,
  HeroBannerSideColumn,
} from "./StyledComponents";
import { lazy, Suspense, useEffect, useState } from "react";
const ThreeScene = lazy(() => import("./ThreeScene"));
import ContentArea from "./UI/ContentArea";
import TitleBanner from "./UI/TitleBanner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MenuBar from "./UI/Menu/MenuBar";
import { DebugStateProvider } from "./debug/DebugStateContext";
import { isDebugMode } from "./utils/generalUtils";
import Debug2D from "./debug/Debug2D";

interface AppWrapperProps {
  visible: boolean;
}

const AppWrapper = styled("div")<AppWrapperProps>(({ visible }) => ({
  margin: 0,
  padding: 0,
  width: "100%",
  height: "100%",
  overflow: "hidden",
  WebkitUserSelect: "none" /* Safari */,
  msUserSelect: "none" /* IE 10 and IE 11 */,
  userSelect: "none" /* Standard syntax */,
  opacity: visible ? 1 : 0,
  transition: "opacity 0.5s ease-in",
  backgroundColor: "#222",
}));

const ThreeLoadingFallback = styled.div({
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#1a1a1a",
  color: "white",
  fontSize: "1.2rem",
});

function App() {
  const isDebug = isDebugMode();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleLoaderRemoved = () => {
      setTimeout(() => {
        setIsVisible(true);
      }, 100);
    };

    window.addEventListener("initialLoaderRemoved", handleLoaderRemoved);

    if (!document.getElementById("initial-loader")) {
      handleLoaderRemoved();
    }

    return () => {
      window.removeEventListener("initialLoaderRemoved", handleLoaderRemoved);
    };
  }, []);

  return (
    <BrowserRouter>
      <StateProvider>
        <DebugStateProvider>
          <AppWrapper visible={isVisible}>
            <ThreeContainer>
              <Suspense
                fallback={
                  <ThreeLoadingFallback>
                    Loading 3D Scene...
                  </ThreeLoadingFallback>
                }
              >
                <ThreeScene />
              </Suspense>
            </ThreeContainer>
            <Overlay>
              <HeroBanner>
                <HeroBannerSideColumn />
                <TitleBanner />
                <HeroBannerSideColumn />
              </HeroBanner>
              <Routes>
                <Route path="/" element={<ContentArea />} />
                <Route path="/combat" element={<ContentArea />} />
                <Route path="/queens" element={<ContentArea />} />
                <Route path="/terrain" element={<ContentArea />} />
                <Route path="/cv" element={<ContentArea />} />
                <Route path="/cvart" element={<ContentArea />} />
              </Routes>
              <MenuBar />
            </Overlay>
            {isDebug ? <Debug2D /> : null}
          </AppWrapper>
        </DebugStateProvider>
      </StateProvider>
    </BrowserRouter>
  );
}

export default App;
