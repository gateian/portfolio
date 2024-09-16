import "./App.css";
import { StateProvider } from "./StateProvider";
import { Overlay, HeroBanner, ThreeContainer } from "./StyledComponents";
import ThreeScene from "./ThreeScene";
import ContentArea from "./UI/ContentArea";
import TitleBanner from "./UI/TitleBanner";

function App() {
  return (
    <StateProvider>
      <div className="App">
        <ThreeContainer>
          <ThreeScene />
        </ThreeContainer>
        <Overlay>
          <HeroBanner>
            <TitleBanner />
          </HeroBanner>
          <ContentArea />
        </Overlay>
      </div>
    </StateProvider>
  );
}

export default App;
