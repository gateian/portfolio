import styled from "@emotion/styled";

const TitleBannerWrapper = styled.div`
  font-size: 2rem;
  font-weight: 100;
  margin: 0;
  padding: 0.5rem 0;
  text-align: center;
  font-family: "Kanit", sans-serif;
  letter-spacing: 0.5em;
  text-transform: uppercase;
`;

const NamePlate = styled.div`
  font-size: 4.5rem;
  line-height: 1.3;
`;

const SubTitle = styled.div`
  font-size: 0.8rem;
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
