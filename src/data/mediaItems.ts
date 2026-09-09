export type MediaItem = {
  type: 'video' | 'image';
  src: string;
  alt?: string;
  title: string;
  description: string;
  url?: string;
  poster?: string;
};

export const mediaItems: MediaItem[] = [
  {
    type: 'image',
    src: '/images/zippytown.webp',
    title: 'Zippy Town',
    description:
      'A realtime cartoon city running in the browser. Built in Three.js with DRACO compressed meshes, LOD and post processing.',
    url: 'https://zippy.town/',
  },
  {
    type: 'video',
    src: '/videos/raptor_short_web.mp4',
    poster: '/posters/raptor_short_web.webp',
    title: 'M-Sport Raptor',
    description:
      'Marketing CG renders of the M-Sport Ford Raptor for the Dakar Rally.',
    url: 'https://www.msport-raptor.com/',
  },
  {
    type: 'video',
    src: '/videos/cap2.mp4',
    poster: '/posters/cap2.webp',
    title: 'Combat Air Patrol 2',
    description:
      'Cockpit, aircraft and supporting asset modelling for the flight simulator.',
    url: 'https://store.steampowered.com/app/347170/Combat_Air_Patrol_2_Military_Flight_Simulator/',
  },
  {
    type: 'video',
    src: '/videos/Cyberpunkcity005.mp4',
    poster: '/posters/Cyberpunkcity005.webp',
    title: 'Cyberpunk City',
    description:
      'Atmospheric city flythrough built for real-time and cinematic presentation.',
  },
  {
    type: 'video',
    src: '/videos/mountain.mp4',
    poster: '/posters/mountain.webp',
    title: 'Mountain Vista',
    description:
      'Environment lighting and camera work across a large-scale landscape scene.',
  },
  {
    type: 'video',
    src: '/videos/tower.mp4',
    poster: '/posters/tower.webp',
    title: 'Tower Approach',
    description:
      'Architectural focal point with dramatic lighting and aerial camera path.',
  },
  {
    type: 'image',
    src: '/images/harrier.webp',
    title: 'Harrier Cockpit',
    description:
      'High-detail cockpit interior modelled and textured for close-up presentation.',
  },
  {
    type: 'image',
    src: '/images/ShrineRender2.webp',
    title: 'Shrine',
    description:
      'Mood-driven environment render exploring light, material and composition.',
  },
  {
    type: 'video',
    src: '/videos/carvis.mp4',
    poster: '/posters/carvis.webp',
    title: 'Car Visualisation',
    description:
      'Product-style automotive visualisation with cinematic camera movement.',
  },
];
