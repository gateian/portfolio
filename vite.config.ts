import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { mediaItems } from './src/data/mediaItems';

function injectHeroMediaSrc(): Plugin {
  const firstItem = mediaItems[0];
  const src = firstItem?.type === 'video' ? firstItem.src : '';

  return {
    name: 'inject-hero-media-src',
    transformIndexHtml(html) {
      return html.replaceAll('__HERO_MEDIA_SRC__', src);
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
  ],
});
