import styled from '@emotion/styled';

const ThreeContainer = styled.div({
  width: '100vw',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
});

const Overlay = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  minHeight: '450px',
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  background: 'transparent',
  backgroundImage:
    'radial-gradient(rgba(0.0, 0.0, 0.0, 0.05) 1px, transparent 0)',
  backgroundSize: '4px 4px',
  overflow: 'auto',
});

interface HeroBannerProps {
  isVisible: boolean;
  isDisabled?: boolean;
}

const HeroBanner = styled.div<HeroBannerProps>((props) => ({
  display: props.isDisabled ? 'none' : 'flex',
  color: 'white',
  flexBasis: '15vh',
  flexShrink: 0,
  width: '100%',
  pointerEvents: 'auto',
  marginTop: '50px',
  opacity: props.isVisible ? 1 : 0,
  transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
}));

const HeroBannerSideColumn = styled.div({
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  align: 'center',
});

interface FooterAreaProps {
  isDisabled?: boolean;
}

const FooterArea = styled.div<FooterAreaProps>((props) => ({
  display: props.isDisabled ? 'flex' : 'none',
  justifyContent: 'center',
  alignItems: 'center',
  align: 'center',
  width: '100%',
  height: '100%',
  padding: '10px',
  backgroundColor: '#222',
}));

export { ThreeContainer, Overlay, HeroBanner, HeroBannerSideColumn, FooterArea };
