// Lives under ProjectInfoPanel inside ProjectCluster so it always moves with
// the panel. Progress is driven by direct DOM writes (see MediaProgressBar.tsx),
// so nesting here does not cause slideshow re-renders.

import { MEDIA_HEIGHT_MEDIUM } from '../../Theme';
import styled from '@emotion/styled';

interface BarAnchorProps {
  isVisible: boolean;
  isDisabled?: boolean;
}

export const BarAnchor = styled.div<BarAnchorProps>(
  ({ isVisible, isDisabled }) => ({
    display: isDisabled ? 'none' : 'flex',
    width: '100%',
    gap: '0.5rem',
    flexShrink: 0,
    pointerEvents: 'auto',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    [`@media (max-height: ${MEDIA_HEIGHT_MEDIUM})`]: {
      gap: '0.1rem',
    },
  })
);

// Generous vertical padding gives a comfortable touch target without making
// the dash itself any thicker.
export const Segment = styled.button({
  flex: 1,
  minWidth: 0,
  position: 'relative',
  height: '1.35rem',
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'none',
  appearance: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  // Android/iOS paint their own grey flash on tap; the dash highlight below
  // is the intended feedback.
  WebkitTapHighlightColor: 'transparent',
  // first-of-type is the Track. Without it this would also catch the Fill and
  // dim the played portion from solid white to 60% on hover.
  '&:hover > span:first-of-type': {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  // Deliberately no outline. A ring around a 1.35rem-tall button reads as a
  // stray border, and mobile browsers hold focus after a tap so it lingers.
  // Brightening the dash keeps a cue for keyboard users without that.
  '&:focus': {
    outline: 'none',
  },
  '&:focus-visible > span:first-of-type': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

export const Track = styled.span({
  position: 'absolute',
  left: 0,
  right: 0,
  height: '2px',
  backgroundColor: 'rgba(255, 255, 255, 0.35)',
  boxShadow: '0 0 4px rgba(0, 0, 0, 0.6)',
  transition: 'background-color 0.2s ease',
});

// The played portion: a thicker solid white line drawn over the track.
export const Fill = styled.span({
  position: 'absolute',
  left: 0,
  right: 0,
  height: '2px',
  backgroundColor: '#fff',
  boxShadow: '0 0 6px rgba(0, 0, 0, 0.7)',
  transformOrigin: 'left center',
  transform: 'scaleX(0)',
  willChange: 'transform',
});
