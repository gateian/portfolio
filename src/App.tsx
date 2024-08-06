import styled from "@emotion/styled";
import "./App.css";
import { Overlay, HeroBanner } from "./StyledComponents";

const GlobeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
`;

function App() {
  return (
    <div className="App">
      <GlobeContainer>
        <Overlay>
          <HeroBanner>
            <h1>Title</h1>
            <p>3D Specialist | Realtime Developer</p>
          </HeroBanner>
        </Overlay>
      </GlobeContainer>
    </div>
  );
}

export default App;
