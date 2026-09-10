import { useEffect, useRef } from 'react';
import { BarAnchor, Segment, Track, Fill } from './MediaProgressBar.style';

interface MediaProgressBarProps {
  labels: string[];
  currentIndex: number;
  /** Playback position of the current item, 0..1. Polled, never rendered. */
  getProgress: () => number;
  onSelect: (index: number) => void;
  isVisible: boolean;
  isDisabled?: boolean;
}

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
