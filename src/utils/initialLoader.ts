let dismissed = false;

export function dismissInitialLoader() {
  if (dismissed) {
    return;
  }
  dismissed = true;

  const loader = document.getElementById('initial-loader');
  if (!loader) {
    return;
  }

  loader.classList.add('fade-out');
  window.setTimeout(() => {
    loader.remove();
  }, 500);
}
