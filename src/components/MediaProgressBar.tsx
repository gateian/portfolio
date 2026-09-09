import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';

interface MediaProgressBarProps {
  labels: string[];
  currentIndex: number;
  /** Playback position of the current item, 0..1. Polled, never rendered. */
  getProgress: () => number;
  onSelect: (index: number) => void;
  isVisible: boolean;
  isDisabled?: boolean;
}

// Sits just under ProjectInfoPanel (bottom: 12rem / 14rem) and matches its
// width so the two read as one stacked control.
//
// Vertical placement is tight on desktop: the panel's bottom edge is at 12rem
// and AppBarWrapper's box starts at 11.74rem, so there is no truly free band.
// The tool icons themselves only begin at ~10.74rem though (AppBarWrapper has
// 1rem of padding), so the bar goes in that visual gap and takes a z-index
// above AppBarWrapper's 100 — otherwise that padding swallows every click.
// The region it overlaps is empty padding, so nothing else loses a hit target.
// Mobile has a real 2.26rem gap and needs no such care.
const BarAnchor = styled.div<{ isVisible: boolean; isDisabled?: boolean }>(
  ({ isVisible, isDisabled }) => ({
    display: isDisabled ? 'none' : 'flex',
    position: 'fixed',
    left: '50%',
    bottom: '10.9rem',
    transform: 'translateX(-50%)',
    zIndex: 110,
    width: 'min(34rem, calc(100vw - 2rem))',
    gap: '0.5rem',
    // Overlay is pointer-events: none, so opt back in to catch clicks.
    pointerEvents: 'auto',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    '@media (max-width: 650px)': {
      bottom: '12.25rem',
    },
  })
);

// Generous vertical padding gives a comfortable touch target without making
// the dash itself any thicker.
const Segment = styled.button({
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

const Track = styled.span({
  position: 'absolute',
  left: 0,
  right: 0,
  height: '2px',
  backgroundColor: 'rgba(255, 255, 255, 0.35)',
  boxShadow: '0 0 4px rgba(0, 0, 0, 0.6)',
  transition: 'background-color 0.2s ease',
});

// The played portion: a thicker solid white line drawn over the track.
const Fill = styled.span({
  position: 'absolute',
  left: 0,
  right: 0,
  height: '4px',
  backgroundColor: '#fff',
  boxShadow: '0 0 6px rgba(0, 0, 0, 0.7)',
  transformOrigin: 'left center',
  transform: 'scaleX(0)',
  willChange: 'transform',
});

function MediaProgressBar({
  labels,
  currentIndex,
  getProgress,
  onSelect,
  isVisible,
  isDisabled,
}: MediaProgressBarProps) {
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Drive the fills by writing transforms straight to the DOM on each frame.
  // Going through React state here would re-render the whole slideshow ~60x a
  // second, which remounts the hero <video> via its inline ref callback and
  // interrupts playback.
  const stateRef = useRef({ currentIndex, getProgress });
  stateRef.current = { currentIndex, getProgress };

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      const { currentIndex: active, getProgress: read } = stateRef.current;
      const progress = Math.min(Math.max(read(), 0), 1);

      for (let i = 0; i < fillRefs.current.length; i += 1) {
        const el = fillRefs.current[i];
        if (!el) {
          continue;
        }
        const scale = i < active ? 1 : i === active ? progress : 0;
        el.style.transform = `scaleX(${scale})`;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <BarAnchor
      isVisible={isVisible}
      isDisabled={isDisabled}
      role="tablist"
      aria-label="Showreel items"
    >
      {labels.map((label, index) => (
        <Segment
          key={label}
          type="button"
          role="tab"
          aria-selected={index === currentIndex}
          aria-label={label}
          title={label}
          onClick={() => onSelect(index)}
        >
          <Track />
          <Fill
            ref={(el) => {
              fillRefs.current[index] = el;
            }}
          />
        </Segment>
      ))}
    </BarAnchor>
  );
}

export default MediaProgressBar;
