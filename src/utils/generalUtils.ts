export function isDebugMode(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === 'true';
}

export function isCVTestMode(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('cv') === 'true';
}
