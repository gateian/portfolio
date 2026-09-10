import { MEDIA_HEIGHT_MEDIUM, MEDIA_BOTTOM_SIDE_BY_SIDE } from '../../Theme';
import styled from '@emotion/styled';

interface PanelAnchorProps {
  isVisible: boolean;
  isDisabled?: boolean;
}

export const PanelAnchor = styled.div<PanelAnchorProps>(
  ({ isVisible, isDisabled }) => ({
    display: isDisabled ? 'none' : 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    maxWidth: '34rem',
    margin: '0rem 1rem',
    width: 'calc(100% - 2rem)',
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    [`@media ${MEDIA_BOTTOM_SIDE_BY_SIDE}`]: {
      // Fill the stretched ProjectCluster so panel + progress consume the
      // shared side-by-side height.
      margin: 0,
      width: '100%',
      maxWidth: 'none',
      height: '100%',
    },
  })
);

export const PanelShell = styled.div({
  display: 'flex',
  alignItems: 'stretch',
  width: '100%',
  minHeight: '5.4rem',
  flex: '1 1 auto',
  border: '1px solid rgba(255, 255, 255, 0.75)',
  backgroundColor: 'rgba(0, 0, 0, 0.35)',
  backdropFilter: 'blur(2px)',
  boxShadow: '0 0 12px rgba(0, 0, 0, 0.45)',
  overflow: 'hidden',
  boxSizing: 'border-box',
});

export const Content = styled.div<{ fading: boolean }>(({ fading }) => ({
  flex: 1,
  minWidth: 0,
  padding: '0.85rem 1.1rem',
  opacity: fading ? 0 : 1,
  transform: fading ? 'translateY(6px)' : 'translateY(0)',
  transition: 'opacity 0.45s ease, transform 0.45s ease',
}));

export const Title = styled.div({
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 200,
  fontSize: '1.55rem',
  lineHeight: 1.05,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#fff',
  textShadow: '0px 0px 6px rgba(0,0,0,0.85)',
  marginBottom: '0.35rem',
  [`@media (max-height: ${MEDIA_HEIGHT_MEDIUM})`]: {
    fontSize: '1.2rem',
  },
});

export const Description = styled.p({
  margin: 0,
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 300,
  fontSize: '0.95rem',
  lineHeight: 1.25,
  letterSpacing: '0.02em',
  color: 'rgba(255, 255, 255, 0.88)',
  textShadow: '0px 0px 6px rgba(0,0,0,0.85)',
  [`@media (max-height: ${MEDIA_HEIGHT_MEDIUM})`]: {
    fontSize: '0.8rem',
  },
});

export const LinkButton = styled.a<{ fading: boolean }>(({ fading }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.2rem',
  flexShrink: 0,
  width: '4.75rem',
  borderLeft: '1px solid rgba(255, 255, 255, 0.55)',
  color: '#fff',
  textDecoration: 'none',
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 300,
  fontSize: '0.85rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  opacity: fading ? 0 : 1,
  transition: 'opacity 0.45s ease, background-color 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
}));

export const Arrow = styled.span({
  fontSize: '1.25rem',
  lineHeight: 1,
});
