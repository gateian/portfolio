import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setAnalyticsClient } from './analytics';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Only track production builds so local dev visits don't pollute the stats.
// PostHog is ~300 KB, so it's loaded as a separate chunk after the app has
// started rendering rather than blocking the first paint.
// The project key is public by design (it ships in the client bundle).
if (import.meta.env.PROD) {
  const initAnalytics = () => {
    import('posthog-js').then(({ default: posthog }) => {
      posthog.init('phc_wdbFUqbwv4WXkiHJBgdT5bkEkxkrXs8r5dLahXqE7RMf', {
        api_host: 'https://eu.i.posthog.com',
        // Includes capture_pageview: 'history_change', so React Router
        // navigations are tracked as pageviews.
        defaults: '2026-08-30',
        person_profiles: 'identified_only',
        // The tech breakdown pages scroll inside their own element rather
        // than the window, so point PostHog's $pageleave scroll depth at it.
        scroll_root_selector: ['[data-ph-scroll-root]', 'html'],
        // Replays any custom events captured before PostHog had loaded.
        loaded: setAnalyticsClient,
      });
    });
  };
  // Keep the first reel clip's download uncontended: start analytics once the
  // hero is ready (or straight away on pages that don't load it).
  const hero = window.__hero;
  if (hero && hero.status !== 'idle') {
    hero.onReady(initAnalytics);
  } else {
    initAnalytics();
  }
}
