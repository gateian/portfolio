import styled from "@emotion/styled";
import "./App.css";
import { StateProvider } from "./StateContext";
import { Overlay, HeroBanner, ThreeContainer } from "./StyledComponents";
import ThreeScene from "./ThreeScene";
import ContentArea from "./UI/ContentArea";
import TitleBanner from "./UI/TitleBanner";
import { isCVTestMode } from "./utils/generalUtils";
import CV from "./UI/CV";

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
  const isCVTest = isCVTestMode();

  return (
    <StateProvider>
      <AppWrapper>
        <ThreeContainer>
          <ThreeScene />
        </ThreeContainer>
        <Overlay>
          <HeroBanner>
            <TitleBanner />
          </HeroBanner>
          <ContentArea>{isCVTest ? <CV /> : null}</ContentArea>
        </Overlay>
      </AppWrapper>
    </StateProvider>
  );
}

export default App;
