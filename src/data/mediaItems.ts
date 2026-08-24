export type MediaItem = {
  type: 'video' | 'image';
  src: string;
  alt?: string;
};

/** Keep in sync with the preload link in index.html */
export const FIRST_VIDEO_SRC = '/videos/raptor_short_web.mp4';

export const mediaItems: MediaItem[] = [
  {
    type: 'video',
    src: FIRST_VIDEO_SRC,
  },
  {
    type: 'video',
    src: '/videos/cap2.mp4',
  },
  {
    type: 'video',
    src: '/videos/Cyberpunkcity005.mp4',
  },
  {
    type: 'video',
    src: '/videos/mountain.mp4',
  },
  {
    type: 'video',
    src: '/videos/tower.mp4',
  },
  {
    type: 'image',
    src: '/images/harrier.webp',
  },
  {
    type: 'image',
    src: '/images/ShrineRender2.webp',
  },
  {
    type: 'video',
    src: '/videos/carvis.mp4',
  },
];
