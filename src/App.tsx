import "./App.css";
import { Overlay, HeroBanner, ThreeContainer } from "./StyledComponents";
import ThreeScene from "./ThreeScene";

function App() {
  return (
    <div className="App">
      <ThreeContainer>
        <ThreeScene />
      </ThreeContainer>
      <Overlay>
        <HeroBanner>
          <h1>Title</h1>
          <p>3D Specialist | Realtime Developer</p>
        </HeroBanner>
      </Overlay>
    </div>
  );
}

export default App;
