import { MEDIA_HEIGHT_MEDIUM, MEDIA_BOTTOM_SIDE_BY_SIDE } from '../../Theme';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Link } from 'react-router-dom';

// Soft breathing glow for items that have a technical breakdown.
const panelGlow = keyframes({
  '0%, 100%': {
    boxShadow:
      '0 0 12px rgba(0, 0, 0, 0.45), 0 0 0 rgba(140, 220, 255, 0), inset 0 0 0 rgba(140, 220, 255, 0)',
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  '50%': {
    boxShadow:
      '0 0 12px rgba(0, 0, 0, 0.45), 0 0 18px rgba(140, 220, 255, 0.45), inset 0 0 14px rgba(140, 220, 255, 0.12)',
    borderColor: 'rgba(190, 235, 255, 0.95)',
  },
});

const STATIC_GLOW =
  '0 0 12px rgba(0, 0, 0, 0.45), 0 0 14px rgba(140, 220, 255, 0.35)';

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

const panelShellBase = {
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
} as const;

export const PanelShell = styled.div<{ highlight?: boolean }>(
  ({ highlight }) => ({
    ...panelShellBase,
    ...(highlight
      ? {
          animation: `${panelGlow} 2.8s ease-in-out infinite`,
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            boxShadow: STATIC_GLOW,
            borderColor: 'rgba(190, 235, 255, 0.95)',
          },
        }
      : {}),
  })
);

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

// Attention pulse for the technical breakdown callout. One 2.6s beat:
// the border brightens, two hairline rings radiate out and fade, a light
// sheen sweeps across and the arrow nudges right, then it rests.
const CALLOUT_BEAT = '2.6s';

const calloutRing = keyframes({
  '0%': {
    outlineOffset: '0px',
    outlineColor: 'rgba(225, 245, 255, 1)',
  },
  '28%': {
    outlineOffset: '8px',
    outlineColor: 'rgba(210, 240, 255, 0.55)',
  },
  '60%, 100%': {
    outlineOffset: '16px',
    outlineColor: 'rgba(210, 240, 255, 0)',
  },
});

const calloutBorder = keyframes({
  '0%, 45%, 100%': {
    borderColor: 'rgba(190, 235, 255, 0.85)',
    boxShadow: '0 0 0 rgba(140, 220, 255, 0)',
  },
  '8%': {
    borderColor: '#fff',
    boxShadow: '0 0 16px rgba(140, 220, 255, 0.5)',
  },
});

// A light streak that crosses the whole box once per beat, just after the
// border flash. The fill streak (transform) and the border glint
// (background-position) share keyframe stops and easing, so they stay locked
// together: both carry the band's centre from -22% to 122% of the box width,
// i.e. from just clear of the left edge to just clear of the right.
const SHEEN_EASE = 'cubic-bezier(0.35, 0, 0.65, 1)';

const calloutStreak = keyframes({
  '0%, 6%': { transform: 'translateX(-72%)' },
  '60%, 100%': { transform: 'translateX(72%)' },
});

const calloutGlint = keyframes({
  '0%, 6%': { backgroundPosition: '86% 0' },
  '60%, 100%': { backgroundPosition: '14% 0' },
});

const arrowNudge = keyframes({
  '0%, 40%, 100%': { transform: 'translateX(0)' },
  '12%': { transform: 'translateX(5px)' },
  '22%': { transform: 'translateX(0)' },
  '30%': { transform: 'translateX(3px)' },
});

const calloutRingLayer = {
  content: '""',
  position: 'absolute',
  inset: '-1px',
  pointerEvents: 'none',
  outline: '1px solid rgba(210, 240, 255, 0)',
  outlineOffset: '0px',
  animation: `${calloutRing} ${CALLOUT_BEAT} ease-out infinite`,
} as const;

export const CalloutLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'fading',
})<{ fading: boolean }>(({ fading }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%',
  flexShrink: 0,
  boxSizing: 'border-box',
  minHeight: '2.75rem',
  padding: '0.55rem 1.1rem',
  border: '1px solid rgba(190, 235, 255, 0.85)',
  backgroundColor: 'rgba(10, 30, 40, 0.55)',
  backdropFilter: 'blur(2px)',
  color: '#fff',
  textDecoration: 'none',
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 300,
  fontSize: '1.05rem',
  lineHeight: 1.15,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  textShadow: '0px 0px 6px rgba(0,0,0,0.85)',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  opacity: fading ? 0 : 1,
  transform: fading ? 'translateY(6px)' : 'translateY(0)',
  transition:
    'opacity 0.45s ease, transform 0.45s ease, background-color 0.2s ease, border-color 0.2s ease',
  animation: `${calloutBorder} ${CALLOUT_BEAT} ease-out infinite`,
  '&::before': calloutRingLayer,
  '&::after': {
    ...calloutRingLayer,
    animationDelay: '0.35s',
  },
  '&:hover, &:focus-visible': {
    backgroundColor: 'rgba(140, 220, 255, 0.22)',
    borderColor: '#fff',
  },
  '&:focus-visible': {
    outline: '2px solid #fff',
    outlineOffset: '2px',
  },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    borderColor: '#fff',
    boxShadow: '0 0 14px rgba(140, 220, 255, 0.4)',
    '&::before': {
      animation: 'none',
      outlineColor: 'rgba(210, 240, 255, 0.45)',
      outlineOffset: '3px',
    },
    '&::after': { animation: 'none', display: 'none' },
  },
  [`@media (max-height: ${MEDIA_HEIGHT_MEDIUM})`]: {
    minHeight: '2.4rem',
    fontSize: '0.9rem',
  },
}));

// Clipping layer for the sheen. The link itself can't clip (its rings draw
// outside it), so the streak lives in this inset, overflow-hidden child.
export const CalloutShine = styled.span({
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  // Diagonal band across the fill: soft wide falloff with a brighter core.
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(105deg, transparent 28%, rgba(255, 255, 255, 0.12) 38%, rgba(255, 255, 255, 0.45) 46%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.45) 54%, rgba(255, 255, 255, 0.12) 62%, transparent 72%)',
    transform: 'translateX(-72%)',
    animation: `${calloutStreak} ${CALLOUT_BEAT} ${SHEEN_EASE} infinite`,
  },
  // The same band, masked down to the 1px border, so the top and bottom edges
  // glint white as the streak passes along them.
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    // Slightly heavier than the 1px border it rides on, so the glint reads.
    padding: '1.5px',
    backgroundImage:
      'linear-gradient(105deg, transparent 38%, rgba(255, 255, 255, 0.6) 46%, #fff 50%, rgba(255, 255, 255, 0.6) 54%, transparent 62%)',
    backgroundSize: '300% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '86% 0',
    WebkitMask:
      'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
    WebkitMaskComposite: 'xor',
    mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
    animation: `${calloutGlint} ${CALLOUT_BEAT} ${SHEEN_EASE} infinite`,
  },
  '@media (prefers-reduced-motion: reduce)': {
    display: 'none',
  },
});

export const CalloutArrow = styled.span({
  fontSize: '1.25rem',
  lineHeight: 1,
  display: 'inline-block',
  animation: `${arrowNudge} ${CALLOUT_BEAT} ease-in-out infinite`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
});

export const CalloutKicker = styled.span({
  flexShrink: 0,
  fontSize: '0.75rem',
  letterSpacing: '0.12em',
  padding: '0.15rem 0.45rem',
  border: '1px solid rgba(190, 235, 255, 0.7)',
  color: 'rgba(210, 240, 255, 0.95)',
});

export const CalloutLabel = styled.span({
  flex: 1,
  minWidth: 0,
});
