export const MEDIA_WIDTH_LARGE = '900px';
export const MEDIA_WIDTH_MEDIUM = '400px';
export const MEDIA_WIDTH_SMALL = '250px';
export const MEDIA_HEIGHT_MEDIUM = '450px';
export const MEDIA_HEIGHT_LARGE = '600px';

// Side-by-side bottom chrome only when the viewport is short *and* wide
// enough for both halves to stay readable. Narrow + short stacks and scrolls.
export const MEDIA_BOTTOM_SIDE_BY_SIDE = `(max-height: ${MEDIA_HEIGHT_MEDIUM}) and (min-width: ${MEDIA_WIDTH_LARGE})`;
