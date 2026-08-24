import { useState, useEffect, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import type { MediaItem } from '../data/mediaItems';

interface MediaSlideshowProps {
  items: MediaItem[];
  onReady?: () => void;
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

const HERO_READY_TIMEOUT_MS = 45000;

function isHeroBuffered(video: HTMLVideoElement): boolean {
  if (video.buffered.length === 0) {
    return false;
  }

  const bufferedEnd = video.buffered.end(video.buffered.length - 1);
  const duration = video.duration;
  if (!duration || Number.isNaN(duration)) {
    return bufferedEnd >= 3;
  }

  return bufferedEnd >= duration * 0.9;
}

const MediaSlideshow: React.FC<MediaSlideshowProps> = ({ items, onReady }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [heroVideo, setHeroVideo] = useState<HTMLVideoElement | null>(null);
  const [isImagePanning, setIsImagePanning] = useState(false);
  const readyNotified = useRef(false);

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
    if (preloaded) {
      videoRefs.current[0] = preloaded;
      setHeroVideo(preloaded);
    }
  }, []);

  useEffect(() => {
    const video = window.__heroVideoEl;
    if (!video) {
      return undefined;
    }
    video.addEventListener('ended', handleMediaEnd);
    return () => {
      video.removeEventListener('ended', handleMediaEnd);
    };
  }, [handleMediaEnd]);

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

    const onCheck = () => {
      if (isHeroBuffered(video)) {
        markReady();
      }
    };

    if (isHeroBuffered(video)) {
      markReady();
      return undefined;
    }

    video.addEventListener('progress', onCheck);
    video.addEventListener('canplaythrough', onCheck);
    video.addEventListener('loadeddata', onCheck);
    video.addEventListener('error', markReady);

    return () => {
      video.removeEventListener('progress', onCheck);
      video.removeEventListener('canplaythrough', onCheck);
      video.removeEventListener('loadeddata', onCheck);
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
      const timer = setTimeout(() => {
        handleMediaEnd();
      }, 8000);
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
      return undefined;
    }

    videoElement.addEventListener('canplay', playCurrent, { once: true });
    videoElement.addEventListener('error', handleMediaEnd, { once: true });
    return () => {
      videoElement.removeEventListener('canplay', playCurrent);
      videoElement.removeEventListener('error', handleMediaEnd);
    };
  }, [currentIndex, items, handleMediaEnd, heroReady]);

  const renderMedia = (item: MediaItem, index: number) => {
    const isActive = index === currentIndex;
    const loadThis = shouldLoad(index);

    if (item.type === 'video') {
      return (
        <MediaElement className={isActive ? 'active' : ''} key={item.src}>
          {loadThis ? (
            index === 0 && window.__heroVideoEl ? (
              <VideoSlot
                ref={(container) => {
                  const hero = window.__heroVideoEl;
                  if (!hero) {
                    return;
                  }
                  videoRefs.current[0] = hero;
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
};

export default MediaSlideshow;
