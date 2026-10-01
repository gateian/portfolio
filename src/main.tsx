import React from 'react';
import ReactDOM from 'react-dom/client';
import posthog from 'posthog-js';
import App from './App.tsx';
import './index.css';

// Only track production builds so local dev visits don't pollute the stats.
// The project key is public by design (it ships in the client bundle).
if (import.meta.env.PROD) {
  posthog.init('phc_wdbFUqbwv4WXkiHJBgdT5bkEkxkrXs8r5dLahXqE7RMf', {
    api_host: 'https://eu.i.posthog.com',
    // Includes capture_pageview: 'history_change', so React Router
    // navigations are tracked as pageviews.
    defaults: '2026-08-30',
    person_profiles: 'identified_only',
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
