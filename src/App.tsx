import styled from "@emotion/styled";
import "./App.css";
import { StateProvider } from "./StateContext";
import {
  Overlay,
  HeroBanner,
  ThreeContainer,
  HeroBannerSideColumn,
} from "./StyledComponents";
import ThreeScene from "./ThreeScene";
import ContentArea from "./UI/ContentArea";
import TitleBanner from "./UI/TitleBanner";
import CVMain from "./UI/pages/CV/CVMain";
import MainMenu from "./UI/Menu/Menu";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import QueensUni from "./UI/pages/queens/queensUni";
import CombatPage from "./UI/pages/combat/combatPage";
import HomePage from "./UI/pages/home/homePage";
import TerrainPage from "./UI/pages/terrain/terrainPage";

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
              <HeroBannerSideColumn>
                <MainMenu />
              </HeroBannerSideColumn>
            </HeroBanner>
            <ContentArea>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cv" element={<CVMain />} />
                <Route path="/terrain" element={<TerrainPage />} />
                <Route path="/queens" element={<QueensUni />} />
                <Route path="/combat" element={<CombatPage />} />
              </Routes>
            </ContentArea>
          </Overlay>
        </AppWrapper>
      </StateProvider>
    </BrowserRouter>
  );
}

export default App;
