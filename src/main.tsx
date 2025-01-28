import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const createCustomEvent = () => {
  const event = new CustomEvent('initialLoaderRemoved');
  window.dispatchEvent(event);
};

const cleanup = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.remove();
      createCustomEvent();
    }, 500);
  } else {
    createCustomEvent();
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

cleanup();
