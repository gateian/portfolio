/// <reference types="vite/client" />

/** Set up by the inline bootstrap script in index.html. */
interface HeroLoader {
  el: HTMLVideoElement;
  src: string;
  status: 'idle' | 'loading' | 'ready';
  mode: 'blob' | 'timeout' | 'error' | 'nofetch' | null;
  readyAt: number;
  /** Runs `cb` once the hero may be shown (immediately if it already can). */
  onReady: (cb: () => void) => void;
  /** Begins the download; a no-op once started. */
  start: () => void;
}

interface Window {
  __hero?: HeroLoader;
  __heroVideoEl?: HTMLVideoElement;
  __heroVideoSrc?: string;
}
