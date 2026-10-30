import type { CaptureOptions, PostHog } from 'posthog-js';

/*
 * Small, safe wrapper around PostHog.
 *
 * PostHog is loaded as a deferred chunk (see main.tsx), so components can't
 * import it directly. `track()` queues events until it has loaded, then
 * replays them. If PostHog never loads (dev build, failed chunk) the queue
 * just stays small and bounded; if it's blocked by an ad blocker, PostHog
 * itself drops the requests. Either way, tracking never throws.
 */

type Properties = Record<string, unknown>;

const MAX_QUEUED = 100;
/** The one PostHog method used; also satisfied by the `loaded` callback. */
type Client = Pick<PostHog, 'capture'>;

let client: Client | null = null;
const queue: {
  event: string;
  properties: Properties;
  options: CaptureOptions;
}[] = [];

export function track(
  event: string,
  properties: Properties = {},
  options?: CaptureOptions
) {
  try {
    if (client) {
      client.capture(event, properties, options);
    } else if (queue.length < MAX_QUEUED) {
      // Keep the real time the event happened, not when it's flushed.
      queue.push({
        event,
        properties,
        options: { ...options, timestamp: new Date() },
      });
    }
  } catch {
    // Analytics must never break the page.
  }
}

/** Called by main.tsx once posthog.init() has run. Flushes the queue. */
export function setAnalyticsClient(posthog: Client) {
  client = posthog;
  for (const { event, properties, options } of queue.splice(0)) {
    try {
      posthog.capture(event, properties, options);
    } catch {
      // Ignore: see track().
    }
  }
}

/** UTM parameters on the current URL, e.g. from a link shared in a group. */
export function utmProperties(search: string): Properties {
  const params = new URLSearchParams(search);
  const props: Properties = {};
  for (const key of [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
  ]) {
    const value = params.get(key);
    if (value) {
      props[key] = value;
    }
  }
  return props;
}
