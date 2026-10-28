import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import styled from '@emotion/styled';
import type { MediaItem } from '../../data/mediaItems';
import { videoCropStyle } from '../../data/videoCrop';

interface MediaSlideshowProps {
  items: MediaItem[];
  onReady?: () => void;
  onIndexChange?: (index: number) => void;
  /**
   * Extend the current item while true (e.g. the callout is hovered). If it
   * finishes meanwhile, a video replays and a still stays up; the reel moves
   * on HOLD_GRACE_MS after this goes false, or after HOLD_MAX_MS regardless,
   * so it can never sit on one item indefinitely. Manual selection still works.
   */
  paused?: boolean;
  /** Item to start on, e.g. when coming back from a page that hid the reel. */
  initialIndex?: number;
}

export interface MediaSlideshowHandle {
  /** Jump to an item; selecting the current one restarts it. */
  select: (index: number) => void;
  /** Playback position of the current item, 0..1. */
  getProgress: () => number;
}

const SlideshowContainer = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  overflow: 'hidden',
  zIndex: 0,
  backgroundColor: '#000',
});

const MediaElement = styled.div({
  position: 'absolute',
  overflow: 'hidden',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  transition: 'opacity 1s ease-in-out',
  '&.active': {
    opacity: 1,
  },
});

const Video = styled.video({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  backgroundColor: '#000',
});

const VideoSlot = styled.div({
  width: '100%',
  height: '100%',
  '& > video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    backgroundColor: '#000',
  },
});

const Image = styled.div<{ src: string }>(({ src }) => ({
  width: '100%',
  height: '100%',
  backgroundImage: `url(${src})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'transform 10s linear',
  '&.pan': {
    transform: 'scale(1.2)',
  },
}));

// Safety net for when the bootstrap script in index.html is missing. When it
// is present it alone decides when the hero is ready (fully downloaded, or a
// real network failure), with no time limit, so slow connections still get
// the whole clip before the reel starts.
const HERO_READY_TIMEOUT_MS = 30000;

// A video counts as fully buffered once its buffered range reaches this close
// to the end of what will actually be played.
const BUFFERED_END_TOLERANCE_S = 0.25;

// How long a still image stays on screen before advancing.
const IMAGE_DURATION_MS = 8000;

// Hard cap on video playback. Clips shorter than this still end naturally.
const VIDEO_MAX_DURATION_S = 10;

/** Playback cap for an item, in seconds. */
const videoCapFor = (item: MediaItem | undefined) =>
  item?.playFullClip ? Number.POSITIVE_INFINITY : VIDEO_MAX_DURATION_S;

// After an item has run out during a hold: pause before moving on once the
// pointer/focus leaves, and the longest it is held even if it never does.
const HOLD_GRACE_MS = 2500;
const HOLD_MAX_MS = 15000;

const MediaSlideshow = forwardRef<MediaSlideshowHandle, MediaSlideshowProps>(
  function MediaSlideshow(
    { items, onReady, onIndexChange, paused = false, initialIndex = 0 },
    ref
  ) {
    const [currentIndex, setCurrentIndex] = useState(() =>
      initialIndex >= 0 && initialIndex < items.length ? initialIndex : 0
    );
    const [heroReady, setHeroReady] = useState(false);
    const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [heroVideo, setHeroVideo] = useState<HTMLVideoElement | null>(null);
    const [isImagePanning, setIsImagePanning] = useState(false);
    const readyNotified = useRef(false);
    // Wall-clock start of the current still image, for progress reporting.
    const imageStartRef = useRef(0);
    // Mirrors currentIndex so the imperative handle below doesn't go stale.
    const currentIndexRef = useRef(currentIndex);
    currentIndexRef.current = currentIndex;
    // Read inside the end-of-media handler, so it can't go stale.
    const pausedRef = useRef(paused);
    pausedRef.current = paused;
    // Set when an item finished while paused, so unpausing moves on.
    const heldRef = useRef(false);
    const holdMaxTimerRef = useRef<number | undefined>(undefined);

    useEffect(() => {
      onIndexChange?.(currentIndex);
    }, [currentIndex, onIndexChange]);

    const heroVideoSrc =
      typeof window !== 'undefined' ? window.__heroVideoSrc : undefined;
    const heroIndex = heroVideoSrc
      ? items.findIndex(
          (item) => item.type === 'video' && item.src === heroVideoSrc
        )
      : -1;

    const nextIndex = (currentIndex + 1) % items.length;

    const markReady = useCallback(() => {
      if (readyNotified.current) {
        return;
      }
      readyNotified.current = true;
      setHeroReady(true);
      onReady?.();
    }, [onReady]);

    // Guards against `ended` and the 10s cap both firing for the same clip,
    // which would skip the next item (functional setState updaters chain).
    const advancingRef = useRef(false);

    const advance = useCallback(() => {
      if (advancingRef.current) {
        return;
      }
      advancingRef.current = true;
      heldRef.current = false;
      window.clearTimeout(holdMaxTimerRef.current);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, [items]);

    const handleMediaEnd = useCallback(() => {
      if (advancingRef.current) {
        return;
      }
      if (!pausedRef.current) {
        advance();
        return;
      }
      const index = currentIndexRef.current;
      const element =
        items[index]?.type === 'video' ? videoRefs.current[index] : null;
      if (element) {
        // Replay rather than leaving a frozen last frame while held.
        element.currentTime = 0;
        void element.play().catch(() => undefined);
      }
      if (!heldRef.current) {
        heldRef.current = true;
        holdMaxTimerRef.current = window.setTimeout(advance, HOLD_MAX_MS);
      }
    }, [items, advance]);

    // An item that ran out during the hold moves on shortly after the hold
    // ends; re-engaging within the grace period cancels the pending advance.
    useEffect(() => {
      if (paused || !heldRef.current) {
        return undefined;
      }
      const timer = window.setTimeout(advance, HOLD_GRACE_MS);
      return () => window.clearTimeout(timer);
    }, [paused, advance]);

    useEffect(() => () => window.clearTimeout(holdMaxTimerRef.current), []);

    // Index of the item whose media is fully buffered. Only then does the next
    // item start downloading, so it never competes with the clip on screen
    // (with no range support, a preloading clip pulls its entire file).
    const [bufferedIndex, setBufferedIndex] = useState<number | null>(null);

    const shouldLoad = (index: number) => {
      if (index === currentIndex) {
        return true;
      }
      if (!hasStartedPlayback || bufferedIndex !== currentIndex) {
        return false;
      }
      return index === nextIndex;
    };

    useEffect(() => {
      if (!hasStartedPlayback) {
        return undefined;
      }
      if (items[currentIndex]?.type !== 'video') {
        setBufferedIndex(currentIndex);
        return undefined;
      }
      const element = videoRefs.current[currentIndex];
      if (!element) {
        return undefined;
      }

      const events = ['progress', 'loadedmetadata', 'canplaythrough'];
      const check = () => {
        const { duration, buffered } = element;
        if (!duration || Number.isNaN(duration)) {
          return;
        }
        const needed =
          Math.min(duration, videoCapFor(items[currentIndex])) -
          BUFFERED_END_TOLERANCE_S;
        for (let i = 0; i < buffered.length; i += 1) {
          if (buffered.end(i) >= needed) {
            setBufferedIndex(currentIndex);
            events.forEach((name) => element.removeEventListener(name, check));
            return;
          }
        }
      };

      events.forEach((name) => element.addEventListener(name, check));
      check();
      return () => {
        events.forEach((name) => element.removeEventListener(name, check));
      };
    }, [currentIndex, hasStartedPlayback, items, heroVideo]);

    useEffect(() => {
      const preloaded = window.__heroVideoEl;
      if (preloaded && heroIndex >= 0) {
        videoRefs.current[heroIndex] = preloaded;
        setHeroVideo(preloaded);
      }
    }, [heroIndex]);

    useEffect(() => {
      const video = window.__heroVideoEl;
      if (!video) {
        return undefined;
      }
      // This element outlives its slot in the DOM, so it can still be running
      // after the viewer has jumped elsewhere. Only advance if it is genuinely
      // the item on screen, otherwise it would yank them off their selection.
      const onEnded = () => {
        if (currentIndexRef.current === heroIndex) {
          handleMediaEnd();
        }
      };
      video.addEventListener('ended', onEnded);
      return () => {
        video.removeEventListener('ended', onEnded);
      };
    }, [handleMediaEnd, heroIndex]);

    useEffect(() => {
      if (window.__hero) {
        return undefined;
      }
      const timeoutId = window.setTimeout(markReady, HERO_READY_TIMEOUT_MS);
      return () => window.clearTimeout(timeoutId);
    }, [markReady]);

    useEffect(() => {
      const firstItem = items[0];
      if (!firstItem) {
        markReady();
        return undefined;
      }

      if (firstItem.type === 'image') {
        const preview = new window.Image();
        preview.onload = markReady;
        preview.onerror = markReady;
        preview.src = firstItem.src;
        return undefined;
      }

      if (!heroVideo) {
        return undefined;
      }

      // Hold the loader until the bootstrap reports the first clip can play
      // through: downloaded in full, or given up on after a network failure.
      const hero = window.__hero;
      if (!hero) {
        markReady();
        return undefined;
      }
      let cancelled = false;
      hero.start();
      hero.onReady(() => {
        if (!cancelled) {
          markReady();
        }
      });
      return () => {
        cancelled = true;
      };
    }, [items, markReady, heroVideo]);

    useEffect(() => {
      advancingRef.current = false;
      heldRef.current = false;
      window.clearTimeout(holdMaxTimerRef.current);
      const currentItem = items[currentIndex];
      const videoCap = videoCapFor(currentItem);

      if (currentItem.type === 'image') {
        if (currentIndex === 0 && !heroReady) {
          return undefined;
        }
        if (currentIndex === 0) {
          setHasStartedPlayback(true);
        }
        setIsImagePanning(true);
        imageStartRef.current = performance.now();
        const timer = setTimeout(() => {
          handleMediaEnd();
        }, IMAGE_DURATION_MS);
        return () => clearTimeout(timer);
      }

      setIsImagePanning(false);

      if (currentIndex === 0 && !heroReady) {
        return undefined;
      }

      const videoElement = videoRefs.current[currentIndex];
      if (!videoElement) {
        return undefined;
      }

      const onTimeUpdate = () => {
        if (videoElement.currentTime >= videoCap) {
          videoElement.pause();
          handleMediaEnd();
        }
      };

      const playCurrent = () => {
        if (videoElement.currentTime > 0.05) {
          videoElement.currentTime = 0;
        }
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setHasStartedPlayback(true);
            })
            .catch((error) => {
              console.error('Video playback failed:', error);
              setHasStartedPlayback(true);
            });
        } else {
          setHasStartedPlayback(true);
        }
      };

      videoElement.addEventListener('timeupdate', onTimeUpdate);

      if (videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        playCurrent();
      } else {
        videoElement.addEventListener('canplay', playCurrent, { once: true });
        videoElement.addEventListener('error', handleMediaEnd, { once: true });
      }

      return () => {
        videoElement.removeEventListener('timeupdate', onTimeUpdate);
        videoElement.removeEventListener('canplay', playCurrent);
        videoElement.removeEventListener('error', handleMediaEnd);
        // Stop the outgoing clip. The hero in particular is reused rather than
        // unmounted, so without this it keeps running behind the new selection.
        videoElement.pause();
      };
    }, [currentIndex, items, handleMediaEnd, heroReady]);

    useImperativeHandle(
      ref,
      () => ({
        select: (index: number) => {
          if (index < 0 || index >= items.length) {
            return;
          }

          if (index === currentIndexRef.current) {
            // Re-selecting the current item restarts it.
            const element = videoRefs.current[index];
            if (element) {
              element.currentTime = 0;
              void element.play().catch(() => undefined);
            }
            imageStartRef.current = performance.now();
            return;
          }

          setCurrentIndex(index);
        },
        getProgress: () => {
          const index = currentIndexRef.current;
          if (items[index]?.type === 'image') {
            if (!imageStartRef.current) {
              return 0;
            }
            const elapsed = performance.now() - imageStartRef.current;
            return Math.min(elapsed / IMAGE_DURATION_MS, 1);
          }

          const element = videoRefs.current[index];
          if (!element || !element.duration || Number.isNaN(element.duration)) {
            return 0;
          }
          const cappedDuration = Math.min(
            element.duration,
            videoCapFor(items[index])
          );
          return Math.min(element.currentTime / cappedDuration, 1);
        },
      }),
      [items]
    );

    const renderMedia = (item: MediaItem, index: number) => {
      const isActive = index === currentIndex;
      const loadThis = shouldLoad(index);

      if (item.type === 'video') {
        return (
          <MediaElement className={isActive ? 'active' : ''} key={item.src}>
            {loadThis ? (
              index === heroIndex && window.__heroVideoEl ? (
                <VideoSlot
                  ref={(container) => {
                    const hero = window.__heroVideoEl;
                    if (!hero) {
                      return;
                    }
                    videoRefs.current[heroIndex] = hero;
                    if (container) {
                      if (hero.parentNode !== container) {
                        container.appendChild(hero);
                      }
                    } else if (hero.parentNode) {
                      hero.parentNode.removeChild(hero);
                    }
                  }}
                />
              ) : (
                <Video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={item.src}
                  poster={item.poster}
                  style={videoCropStyle(item.crop)}
                  muted
                  playsInline
                  preload="auto"
                  onEnded={handleMediaEnd}
                />
              )
            ) : null}
          </MediaElement>
        );
      }

      return (
        <MediaElement className={isActive ? 'active' : ''} key={item.src}>
          {loadThis ? (
            <Image
              src={item.src}
              className={isImagePanning && isActive ? 'pan' : ''}
            />
          ) : null}
        </MediaElement>
      );
    };

    return (
      <SlideshowContainer>
        {items.map((item, index) => renderMedia(item, index))}
      </SlideshowContainer>
    );
  }
);

export default MediaSlideshow;
