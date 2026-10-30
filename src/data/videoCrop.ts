import type { CSSProperties } from 'react';

/**
 * A slight zoom for clips with capture artefacts at their edges. Applied as a
 * CSS transform on the <video> itself, so its poster gets exactly the same
 * framing and there is no jump when playback starts. The parent must clip
 * (overflow: hidden).
 */
export interface VideoCrop {
  scale: number;
  /** CSS transform-origin; the edge it sits nearest is cropped least. */
  origin: string;
}

export const videoCropStyle = (crop?: VideoCrop): CSSProperties | undefined =>
  crop
    ? { transform: `scale(${crop.scale})`, transformOrigin: crop.origin }
    : undefined;

/**
 * ZippyTown_NewTextures_Clip2.mp4 was screen captured with the app's
 * "Lightmap cycle" button in its top-left corner (bottom edge at ~3.7% of the
 * frame height) and a thin rounded frame on every edge (~0.4%).
 *
 * A 1.06 zoom removes 5.66% of each axis; an origin at 85% height puts 4.8% of
 * that on the top edge and 0.85% on the bottom, and 60% width splits the rest
 * 3.4% left / 2.3% right. object-fit: cover only ever crops further, so the
 * button stays out of frame at every aspect ratio.
 */
export const ZIPPY_NEW_TEXTURES_CROP: VideoCrop = {
  scale: 1.06,
  origin: '60% 85%',
};
