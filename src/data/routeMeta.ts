/*
 * Share-preview (Open Graph / Twitter) tags.
 *
 * The site is a single-page app, so every route would otherwise get the same
 * index.html and link previews couldn't be page-specific. At build time,
 * vite.config.ts writes these tags into index.html (the default) and into a
 * prerendered copy per route (e.g. dist/tech/zippy-town.html), which
 * Cloudflare serves for /tech/zippy-town. The app then boots as normal.
 */

/** Public origin the preview URLs point at. */
export const SITE_URL = 'https://v2.ianhamblin.xyz';

export type RouteMeta = {
  /**
   * Route the tags belong to. The default tags have none: index.html is also
   * served for every other route, so it mustn't claim a canonical URL.
   */
  path?: string;
  title: string;
  description: string;
  type: 'website' | 'article';
  image?: {
    /** Public path; made absolute with SITE_URL. */
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

export const defaultMeta: RouteMeta = {
  title: 'Ian Hamblin Portfolio',
  description:
    'Ian Hamblin: 3D graphics and technical art. Real-time rendering, tools and pipelines.',
  type: 'website',
};

export const routeMeta: RouteMeta[] = [
  {
    path: '/tech/zippy-town',
    title: 'Zippy Town: Blender → Android Pipeline | Ian Hamblin',
    description:
      'How one Blender scene ships to a three.js website and a native Filament live wallpaper on Android: baked Cycles lightmaps, KTX2/UASTC textures transcoded to ASTC, and testing on real devices.',
    type: 'article',
    image: {
      src: '/og/zippy-town.jpg',
      alt: 'Zippy Town: a cartoon city at night with traffic and canals, rendered in real time',
      width: 1200,
      height: 630,
    },
  },
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** The <title> and meta tags for one route, as HTML. */
export function renderMetaTags(meta: RouteMeta) {
  const url = meta.path ? `${SITE_URL}${meta.path}` : undefined;
  const tags: [string, string, string][] = [
    ['name', 'description', meta.description],
    ['property', 'og:type', meta.type],
    ['property', 'og:site_name', 'Ian Hamblin'],
    ['property', 'og:title', meta.title],
    ['property', 'og:description', meta.description],
    ['name', 'twitter:card', meta.image ? 'summary_large_image' : 'summary'],
    ['name', 'twitter:title', meta.title],
    ['name', 'twitter:description', meta.description],
  ];
  if (url) {
    tags.push(['property', 'og:url', url]);
  }
  if (meta.image) {
    const image = `${SITE_URL}${meta.image.src}`;
    tags.push(
      ['property', 'og:image', image],
      ['property', 'og:image:width', String(meta.image.width)],
      ['property', 'og:image:height', String(meta.image.height)],
      ['property', 'og:image:alt', meta.image.alt],
      ['name', 'twitter:image', image],
      ['name', 'twitter:image:alt', meta.image.alt]
    );
  }
  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    ...(url ? [`<link rel="canonical" href="${escapeHtml(url)}" />`] : []),
    ...tags.map(
      ([attr, key, value]) =>
        `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`
    ),
  ].join('\n    ');
}
