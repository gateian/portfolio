import styled from "@emotion/styled";
import "./App.css";
import { StateProvider } from "./StateContext";
import {
  Overlay,
  HeroBanner,
  ThreeContainer,
  HeroBannerSideColumn,
} from "./StyledComponents";
import { lazy } from "react";
const ThreeScene = lazy(() => import("./ThreeScene"));
import ContentArea from "./UI/ContentArea";
import TitleBanner from "./UI/TitleBanner";
import { BrowserRouter } from "react-router-dom";
import MenuBar from "./UI/Menu/MenuBar";

const AppWrapper = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
`;

function App() {
  return (
    <BrowserRouter>
      <StateProvider>
        <AppWrapper>
          <ThreeContainer>
            <ThreeScene />
          </ThreeContainer>
          <Overlay>
            <HeroBanner>
              <HeroBannerSideColumn />
              <TitleBanner />
              <HeroBannerSideColumn />
            </HeroBanner>
            <ContentArea />
            <MenuBar />
          </Overlay>
        </AppWrapper>
      </StateProvider>
    </BrowserRouter>
  );
}

export default App;
