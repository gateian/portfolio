import { useState, useEffect, useRef, useCallback } from 'react';
import styled from '@emotion/styled';

interface MediaItem {
  type: 'video' | 'image';
  src: string;
  alt?: string;
}

interface MediaSlideshowProps {
  items: MediaItem[];
}

const SlideshowContainer = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  overflow: 'hidden',
  zIndex: 0,
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
const MediaSlideshow: React.FC<MediaSlideshowProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isImagePanning, setIsImagePanning] = useState(false);

  // Wrap handleMediaEnd in useCallback
  const handleMediaEnd = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]); // Add items.length as dependency

  useEffect(() => {
    // Initialize video refs array
    videoRefs.current = videoRefs.current.slice(0, items.length);
  }, [items]);

  useEffect(() => {
    const currentItem = items[currentIndex];

    if (currentItem.type === 'video') {
      const videoElement = videoRefs.current[currentIndex];
      if (videoElement) {
        videoElement.currentTime = 0;
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Video playback failed:', error);
          });
        }
      }
      return undefined; // Explicit return for video case
    }

    if (currentItem.type === 'image') {
      setIsImagePanning(true);
      const timer = setTimeout(() => {
        handleMediaEnd();
      }, 8000);
      return () => clearTimeout(timer);
    }

    // Reset image panning when changing media
    if (currentItem.type === 'video') {
      setIsImagePanning(false);
    }

    return undefined; // Default return
  }, [currentIndex, items, handleMediaEnd]);

  const renderMedia = (item: MediaItem, index: number) => {
    if (item.type === 'video') {
      return (
        <MediaElement
          className={index === currentIndex ? 'active' : ''}
          key={item.src}
        >
          <Video
            ref={(el) => (videoRefs.current[index] = el)}
            src={item.src}
            muted
            playsInline
            onEnded={handleMediaEnd}
          />
        </MediaElement>
      );
    }
    return (
      <MediaElement
        className={index === currentIndex ? 'active' : ''}
        key={item.src}
      >
        <Image
          src={item.src}
          className={isImagePanning && index === currentIndex ? 'pan' : ''}
        />
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
