import styled from '@emotion/styled';
import {
  MEDIA_WIDTH_LARGE,
  MEDIA_WIDTH_MEDIUM,
  MEDIA_WIDTH_SMALL,
  MEDIA_HEIGHT_MEDIUM,
  MEDIA_HEIGHT_LARGE,
} from './Theme';

const TitleBannerWrapper = styled.div({
  fontSize: '4rem',
  fontWeight: 100,
  margin: 0,
  textAlign: 'center',
  fontFamily: '"Zuume", sans-serif',
  textTransform: 'uppercase',
  backgroundColor: 'rgba(0, 0, 0, 0)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginTop: '40px',
  [`@media (max-width: ${MEDIA_WIDTH_SMALL})`]: {
    marginTop: '10px',
  },
});

const NamePlate = styled.div({
  fontSize: '8rem',
  border: '4px solid white',
  lineHeight: 1,
  padding: '0.5rem 2rem 0rem 2rem',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  textShadow: '0px 0px 6px rgba(0,0,0,0.8)',
  [`@media (max-height: ${MEDIA_HEIGHT_MEDIUM})`]: {
    fontSize: '4rem',
  },
  [`@media (max-height: ${MEDIA_HEIGHT_LARGE})`]: {
    fontSize: '6rem',
  },
  [`@media (max-width: ${MEDIA_WIDTH_LARGE})`]: {
    fontSize: '5rem',
  },
  [`@media (max-width: ${MEDIA_WIDTH_MEDIUM})`]: {
    fontSize: '3rem',
  },
  [`@media (max-width: ${MEDIA_WIDTH_SMALL})`]: {
    fontSize: '2.5rem',
    border: '2px solid white',
    padding: '0.1rem 2rem 0rem 2rem',
  },
});

const SubTitle = styled.div({
  fontSize: '2rem',
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 300,
  fontStyle: 'normal',
  textShadow: '0px 0px 6px rgba(0,0,0,1.0)',
  [`@media (max-width: ${MEDIA_WIDTH_SMALL})`]: {
    fontSize: '1rem',
  },
  [`@media (max-width: ${MEDIA_WIDTH_MEDIUM})`]: {
    fontSize: '1.1rem',
  },
});

function TitleBanner() {
  return (
    <TitleBannerWrapper>
      <NamePlate>Ian Hamblin</NamePlate>
      <SubTitle>3D Graphics and Creative Development</SubTitle>
    </TitleBannerWrapper>
  );
}

export default TitleBanner;
