import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import styled from '@emotion/styled';
import type { MediaItem } from '../../../data/mediaItems';
import {
  createImageTexture,
  createVideoTexture,
  createViewingHallScene,
  type ViewingHallScene,
} from './viewingHallScene';

interface ViewingHallProps {
  items: MediaItem[];
  onReady?: () => void;
  onIndexChange?: (index: number) => void;
}

export interface ViewingHallHandle {
  /** Jump to an item; selecting the current one restarts it. */
  select: (index: number) => void;
  /** Playback position of the current item, 0..1. */
  getProgress: () => number;
}

const HallContainer = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  overflow: 'hidden',
  zIndex: 0,
  backgroundColor: '#050508',
});

const HallCanvas = styled.canvas({
  display: 'block',
  width: '100%',
  height: '100%',
  touchAction: 'none',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
});

// Hidden host so video elements stay in the document (helps iOS autoplay).
const MediaHost = styled.div({
  position: 'absolute',
  width: 0,
  height: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  opacity: 0,
});

const HERO_READY_TIMEOUT_MS = 8000;
const IMAGE_DURATION_MS = 8000;
const VIDEO_MAX_DURATION_S = 10;

function playMuted(video: HTMLVideoElement) {
  const playPromise = video.play();
  if (playPromise !== undefined) {
    return playPromise.catch(() => undefined);
  }
  return Promise.resolve();
}

const ViewingHall = forwardRef<ViewingHallHandle, ViewingHallProps>(
  function ViewingHall({ items, onReady, onIndexChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaHostRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<ViewingHallScene | null>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const reflectVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

    const [currentIndex, setCurrentIndex] = useState(0);
    const [heroReady, setHeroReady] = useState(false);
    const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
    const [heroVideo, setHeroVideo] = useState<HTMLVideoElement | null>(null);
    const [sceneReady, setSceneReady] = useState(false);

    const readyNotified = useRef(false);
    const imageStartRef = useRef(0);
    const currentIndexRef = useRef(0);
    const advancingRef = useRef(false);
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
      if (advancingRef.current) {
        return;
      }
      advancingRef.current = true;
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

    // --- Three.js lifecycle -------------------------------------------------
    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        return undefined;
      }

      const scene = createViewingHallScene(canvas);
      sceneRef.current = scene;
      setSceneReady(true);

      const resize = () => {
        const { clientWidth, clientHeight } = container;
        scene.resize(clientWidth, clientHeight);
      };
      resize();

      let frame = 0;
      const tick = () => {
        scene.render();
        frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);

      const observer = new ResizeObserver(resize);
      observer.observe(container);
      window.addEventListener('resize', resize);

      return () => {
        window.cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('resize', resize);
        scene.dispose();
        sceneRef.current = null;
        setSceneReady(false);
      };
    }, []);

    // --- Hero video hand-off ------------------------------------------------
    useEffect(() => {
      const preloaded = window.__heroVideoEl;
      if (preloaded && heroIndex >= 0) {
        videoRefs.current[heroIndex] = preloaded;
        setHeroVideo(preloaded);
        const host = mediaHostRef.current;
        if (host && preloaded.parentNode !== host) {
          host.appendChild(preloaded);
        }
      }
    }, [heroIndex]);

    useEffect(() => {
      const video = window.__heroVideoEl;
      if (!video) {
        return undefined;
      }
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

    // --- Active item → screen texture + playback ----------------------------
    useEffect(() => {
      advancingRef.current = false;
      const currentItem = items[currentIndex];
      const scene = sceneRef.current;
      if (!currentItem || !scene || !sceneReady) {
        return undefined;
      }

      if (currentItem.type === 'image') {
        if (currentIndex === 0 && !heroReady) {
          return undefined;
        }
        if (currentIndex === 0) {
          setHasStartedPlayback(true);
        }

        let cancelled = false;
        const cached = imageCacheRef.current.get(currentItem.src);
        const applyImage = (image: HTMLImageElement) => {
          if (cancelled) {
            return;
          }
          const texture = createImageTexture(image);
          scene.setScreenMap(texture);
          // Still frames: reuse the same plate in the mirror (no separate blur asset).
          scene.setReflectMap(createImageTexture(image));
        };

        if (cached?.complete) {
          applyImage(cached);
        } else {
          const image = cached ?? new window.Image();
          image.crossOrigin = 'anonymous';
          image.onload = () => applyImage(image);
          image.onerror = () => handleMediaEnd();
          if (!cached) {
            imageCacheRef.current.set(currentItem.src, image);
            image.src = currentItem.src;
          }
        }

        imageStartRef.current = performance.now();
        const timer = window.setTimeout(handleMediaEnd, IMAGE_DURATION_MS);
        return () => {
          cancelled = true;
          window.clearTimeout(timer);
        };
      }

      if (currentIndex === 0 && !heroReady) {
        return undefined;
      }

      const videoElement = videoRefs.current[currentIndex];
      if (!videoElement) {
        return undefined;
      }

      const reflectElement = reflectVideoRefs.current[currentIndex];

      scene.setScreenMap(createVideoTexture(videoElement));
      if (reflectElement) {
        scene.setReflectMap(createVideoTexture(reflectElement));
      } else {
        scene.setReflectMap(null);
      }

      const onTimeUpdate = () => {
        if (videoElement.currentTime >= VIDEO_MAX_DURATION_S) {
          videoElement.pause();
          reflectElement?.pause();
          handleMediaEnd();
        }
      };

      const playCurrent = () => {
        if (videoElement.currentTime > 0.05) {
          videoElement.currentTime = 0;
        }
        if (reflectElement && reflectElement.currentTime > 0.05) {
          reflectElement.currentTime = 0;
        }

        void playMuted(videoElement).then(() => {
          setHasStartedPlayback(true);
        });
        if (reflectElement) {
          void playMuted(reflectElement);
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
        videoElement.pause();
        reflectElement?.pause();
      };
    }, [currentIndex, items, handleMediaEnd, heroReady, sceneReady]);

    useImperativeHandle(
      ref,
      () => ({
        select: (index: number) => {
          if (index < 0 || index >= items.length) {
            return;
          }

          if (index === currentIndexRef.current) {
            const element = videoRefs.current[index];
            const reflect = reflectVideoRefs.current[index];
            if (element) {
              element.currentTime = 0;
              void playMuted(element);
            }
            if (reflect) {
              reflect.currentTime = 0;
              void playMuted(reflect);
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
            VIDEO_MAX_DURATION_S
          );
          return Math.min(element.currentTime / cappedDuration, 1);
        },
      }),
      [items]
    );

    return (
      <HallContainer ref={containerRef}>
        <HallCanvas ref={canvasRef} />
        <MediaHost ref={mediaHostRef}>
          {items.map((item, index) => {
            if (item.type !== 'video' || !shouldLoad(index)) {
              return null;
            }

            const sharp =
              index === heroIndex && window.__heroVideoEl ? null : (
                <video
                  key={item.src}
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={item.src}
                  poster={item.poster}
                  muted
                  playsInline
                  preload="auto"
                  onEnded={handleMediaEnd}
                  crossOrigin="anonymous"
                />
              );

            const reflect = item.reflectSrc ? (
              <video
                key={`${item.src}-reflect`}
                ref={(el) => {
                  reflectVideoRefs.current[index] = el;
                }}
                src={item.reflectSrc}
                muted
                playsInline
                preload="auto"
                crossOrigin="anonymous"
              />
            ) : null;

            return (
              <span key={`media-${item.src}`}>
                {sharp}
                {reflect}
              </span>
            );
          })}
        </MediaHost>
      </HallContainer>
    );
  }
);

export default ViewingHall;
