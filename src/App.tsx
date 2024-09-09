import "./App.css";
import { Overlay, HeroBanner, ThreeContainer } from "./StyledComponents";
import ThreeScene from "./ThreeScene";
import TitleBanner from "./UI/Debug/TitleBanner";

function App() {
  return (
    <div className="App">
      <ThreeContainer>
        <ThreeScene />
      </ThreeContainer>
      <Overlay>
        <HeroBanner>
          <TitleBanner />
        </HeroBanner>
      </Overlay>
    </div>
  );
}

export default App;
