import styled from "@emotion/styled";

const CVWrapper = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: all;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Section = styled.div`
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.4);
`;

const Row = styled(Section)`
  display: flex;
  flex-direction: row;
  align-items: top;
  justify-content: center;
`;

const Column = styled(Section)`
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  align-items: top;
  justify-content: top;
`;

const Title = styled.h2`
  color: white;
`;

const SubTitle = styled.h3`
  color: white;
`;

const List = styled.ul`
  list-style-type: square;
`;

const CV = () => {
  return (
    <CVWrapper>
      <Row>
        <Column>
          <Title>Technical Skills</Title>
          <SubTitle>Web</SubTitle>
          <List>
            <li>Typescript / React / Sass / Emotion / MUI / Apollo</li>
            <li>Three.js / React Three Fiber / Mapbox / Cesium</li>
            <li>AWS / Graphql / git / CI / CD / Docker / Nginx / apache</li>
          </List>
          <SubTitle>Apps and Games</SubTitle>
          <List>
            <li>AR / VR / Unity c# / Android Java / Kotlin / ios</li>
          </List>
          <SubTitle>3D</SubTitle>
          <List>
            <li>
              Modelling / Rendering / PBR Materials / Texturing / UV Unwrapping
            </li>
          </List>
          <Title>Software / Disciplines</Title>
          <Row>
            <Column>
              <List>
                <li>3ds Max</li>
                <li>Photoshop</li>
                <li>Blender</li>
                <li>World Machine</li>
                <li>Shader Map Pro</li>
                <li>Marmoset Toolbag</li>
              </List>
            </Column>
            <Column>
              <List>
                <li>VS Code</li>
                <li>Visual Studio</li>
                <li>Unity</li>
                <li>Android Studio</li>
                <li>Git, Bitbucket, Github</li>
                <li>Docker / Docker Compose</li>
                <li>Ubuntu Linux</li>
              </List>
            </Column>
          </Row>
        </Column>
        <Column>
          <Title>About Me</Title>
          <p>
            Hi, I'm Ian and i'm a visual engineer who specialises in 3D realtime
            graphics. I also have a passion for web development, and have
            experience working with game engines on desktop and mobile.
          </p>
          <p>
            With a 20 year career in 3D visuaisation, I have seen all aspects of
            bringing rich and engaging content to the screen, from modelling and
            animation to coding and writing shaders.
          </p>
          <p>
            I view myself as a highliy motivated, fast working and adaptable
            individual that thrives best in teams. I have ocassionally taken
            responsibility as a leader (like the time I captained my own
            dodgeball team!).
          </p>
          <p>
            Outside of work I like to keep fit with cycling, walking and
            spending time with my two young children.
          </p>
        </Column>
      </Row>
      <Section>
        <Title>Employment History</Title>
      </Section>
      <Section>
        <Column>
          <Title>Education</Title>
        </Column>
        <Column>
          <Title>Interests and Achievements</Title>
        </Column>
      </Section>
    </CVWrapper>
  );
};

export default CV;
