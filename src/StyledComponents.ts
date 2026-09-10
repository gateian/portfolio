import styled from '@emotion/styled';
import {
  MEDIA_HEIGHT_LARGE,
  MEDIA_HEIGHT_MEDIUM,
  MEDIA_BOTTOM_SIDE_BY_SIDE,
} from './UI/Theme';

const ThreeContainer = styled.div({
  width: '100%',
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
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  background: 'transparent',
  backgroundSize: '4px 4px',
  overflowX: 'hidden',
  overflowY: 'auto',
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
  [`@media (max-height: ${MEDIA_HEIGHT_LARGE})`]: {
    marginTop: '10px',
  },
  [`@media (max-height: ${MEDIA_HEIGHT_MEDIUM})`]: {
    flexBasis: '10vh',
  },
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

// Pins the bottom chrome + footer to the overlay floor. Footer height is in
// normal flow, so the chrome above it rises/falls with the footer instead of
// hard-coded bottom offsets.
const FooterArea = styled.div<FooterAreaProps>((props) => ({
  display: props.isDisabled ? 'none' : 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'stretch',
  width: '100%',
  marginTop: 'auto',
  flexShrink: 0,
  padding: '0.5rem 1rem 0.5rem',
  boxSizing: 'border-box',
  gap: '0.75rem',
  pointerEvents: 'none',
}));

// Holds ProjectInfoPanel (+ progress) and AppBar. Column by default; only
// goes side-by-side when short *and* wide enough (see MEDIA_BOTTOM_SIDE_BY_SIDE).
const BottomChrome = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '0.75rem',
  width: '100%',
  flexShrink: 0,
  pointerEvents: 'none',
  [`@media ${MEDIA_BOTTOM_SIDE_BY_SIDE}`]: {
    flexDirection: 'row',
    // Stretch so ProjectCluster and AppBar share one height (the taller of
    // the two — almost always the panel + progress stack).
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: '1rem',
  },
});

// Info panel + progress bar travel as one unit.
const ProjectCluster = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '0.35rem',
  // Same width formula as AppBarWrapper so the stacked layout shares one axis.
  width: 'min(34rem, calc(100% - 2rem))',
  minWidth: 0,
  alignSelf: 'center',
  flexShrink: 0,
  pointerEvents: 'none',
  [`@media ${MEDIA_BOTTOM_SIDE_BY_SIDE}`]: {
    flex: '1 1 0',
    width: 'auto',
    alignSelf: 'stretch',
  },
});

export {
  ThreeContainer,
  Overlay,
  HeroBanner,
  HeroBannerSideColumn,
  FooterArea,
  BottomChrome,
  ProjectCluster,
};
