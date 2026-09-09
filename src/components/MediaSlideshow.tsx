import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import styled from '@emotion/styled';
import type { MediaItem } from '../data/mediaItems';

interface MediaSlideshowProps {
  items: MediaItem[];
  onReady?: () => void;
  onIndexChange?: (index: number) => void;
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

// Safety net only. The hero normally becomes ready via `canplay`, which fires
// in a fraction of a second; this just stops a media error or a stalled fetch
// from leaving the loading overlay up indefinitely.
const HERO_READY_TIMEOUT_MS = 8000;

// How long a still image stays on screen before advancing.
const IMAGE_DURATION_MS = 8000;

const MediaSlideshow = forwardRef<MediaSlideshowHandle, MediaSlideshowProps>(
  function MediaSlideshow({ items, onReady, onIndexChange }, ref) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [heroReady, setHeroReady] = useState(false);
    const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [heroVideo, setHeroVideo] = useState<HTMLVideoElement | null>(null);
    const [isImagePanning, setIsImagePanning] = useState(false);
    const readyNotified = useRef(false);
    // Wall-clock start of the current still image, for progress reporting.
    const imageStartRef = useRef(0);
    // Mirrors currentIndex so the imperative handle below doesn't go stale.
    const currentIndexRef = useRef(0);
    currentIndexRef.current = currentIndex;

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

    const handleMediaEnd = useCallback(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, [items.length]);

    const shouldLoad = (index: number) => {
      if (index === currentIndex) {
        return true;
      }
      if (!hasStartedPlayback) {
        return false;
      }
      return index === nextIndex;
    };

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

      const video = heroVideo;
      if (!video) {
        return undefined;
      }

      // Reveal as soon as playback can start, rather than waiting on buffered
      // ranges. A paused video only buffers a few seconds ahead before firing
      // `suspend` and halting the fetch, so any "mostly downloaded" test
      // deadlocks against the playback gate below: it waits on buffering that
      // only resumes once playback starts, which in turn waits on this flag.
      //
      // `canplay` rather than `canplaythrough`: the latter needs the browser to
      // predict the *whole* clip will play without stalling, which can never be
      // true when the connection is slower than the video's bitrate, so it falls
      // through to HERO_READY_TIMEOUT_MS on exactly the connections that can
      // least afford the wait. Measured reveal on a 3 Mbps link: 9.0s -> 1.0s.
      //
      // Check readyState synchronously first: the event usually fires before
      // this component mounts, so the listener alone would miss it.
      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        markReady();
        return undefined;
      }

      video.addEventListener('canplay', markReady);
      video.addEventListener('error', markReady);

      return () => {
        video.removeEventListener('canplay', markReady);
        video.removeEventListener('error', markReady);
      };
    }, [items, markReady, heroVideo]);

    useEffect(() => {
      const currentItem = items[currentIndex];

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

      if (videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        playCurrent();
      } else {
        videoElement.addEventListener('canplay', playCurrent, { once: true });
        videoElement.addEventListener('error', handleMediaEnd, { once: true });
      }

      return () => {
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
          return Math.min(element.currentTime / element.duration, 1);
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
