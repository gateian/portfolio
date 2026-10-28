import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { mediaItems } from './src/data/mediaItems';
import { defaultMeta, renderMetaTags, routeMeta } from './src/data/routeMeta';

function injectHeroMediaSrc(): Plugin {
  const firstItem = mediaItems[0];
  const src = firstItem?.type === 'video' ? firstItem.src : '';
  const poster = firstItem?.type === 'video' ? (firstItem.poster ?? '') : '';

  return {
    name: 'inject-hero-media-src',
    transformIndexHtml(html) {
      return html
        .replaceAll('__HERO_MEDIA_SRC__', src)
        .replaceAll('__HERO_POSTER_SRC__', poster);
    },
  };
}

const META_BLOCK = /<!-- route-meta:start -->[\s\S]*?<!-- route-meta:end -->/;

/**
 * Writes share-preview tags into index.html, plus a copy of index.html per
 * route in routeMeta (dist/tech/zippy-town.html) with that route's tags, so
 * crawlers that don't run JavaScript still see the right preview.
 */
function routeMetaPages(): Plugin {
  const block = (meta: typeof defaultMeta) =>
    `<!-- route-meta:start -->\n    ${renderMetaTags(meta)}\n    <!-- route-meta:end -->`;

  return {
    name: 'route-meta-pages',
    transformIndexHtml(html) {
      return html.replace(META_BLOCK, block(defaultMeta));
    },
    // Runs after Vite has written dist/index.html with hashed asset URLs.
    writeBundle(options) {
      const outDir = options.dir ?? 'dist';
      const html = readFileSync(join(outDir, 'index.html'), 'utf8');
      for (const meta of routeMeta) {
        if (!meta.path) {
          continue;
        }
        const file = join(outDir, `${meta.path.replace(/^\//, '')}.html`);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html.replace(META_BLOCK, block(meta)));
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    injectHeroMediaSrc(),
    routeMetaPages(),
  ],
});
