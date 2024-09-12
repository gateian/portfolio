import styled from "@emotion/styled";

const TitleBannerWrapper = styled.div`
  font-size: 2rem;
  font-weight: 100;
  margin: 0;
  text-align: center;
  font-family: "Kanit", sans-serif;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  backdrop-filter: blur(5px);
  background-color: rgba(0, 0, 0, 0.01);
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
  height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`;

const NamePlate = styled.div`
  font-size: 4rem;
  line-height: 1.3;
`;

const SubTitle = styled.div`
  font-size: 0.6rem;
  font-family: "Kulim Park", sans-serif;
  font-weight: 500;
`;

const TitleBanner = () => {
  return (
    <TitleBannerWrapper>
      <NamePlate>Ian Hamblin</NamePlate>
      <SubTitle>Web | 3D | Programmer</SubTitle>
    </TitleBannerWrapper>
  );
};

export default TitleBanner;
