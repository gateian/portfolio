import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { Location } from 'react-router-dom';
import { track, utmProperties } from '../../../analytics';

/*
 * Reading analytics for a /tech/:slug page. Every event carries
 * `breakdown` (the slug) and `breakdown_view_id` (one id per visit to the
 * page) so a single read-through can be followed in PostHog.
 *
 * The page scrolls inside its own element (`pageRef`), not the window.
 * Mount it with `key={slug}` so each breakdown visit gets a fresh view.
 */

const SCROLL_MILESTONES = [25, 50, 75, 100];
/** Section counts as read once it fills half of it (or half the screen)... */
const SECTION_VISIBLE_SHARE = 0.5;
/** ...for this long. */
const SECTION_DWELL_MS = 1500;
/** No input for this long and time stops counting as engaged. */
const IDLE_MS = 30_000;
/** Don't send time-on-page for blips shorter than this. */
const MIN_REPORT_MS = 1000;

export type BreakdownEntry = 'reel' | 'in_app' | 'direct';

/** Router state the reel's callout link sets, so the page knows the source. */
export type BreakdownLinkState = { from?: 'reel' };

function newViewId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

function referrerProperties() {
  const referrer = document.referrer;
  if (!referrer) {
    return {};
  }
  try {
    const { hostname } = new URL(referrer);
    if (hostname === location.hostname) {
      return {};
    }
    return { referrer, referring_domain: hostname };
  } catch {
    return { referrer };
  }
}

export function useBreakdownAnalytics(
  slug: string,
  pageRef: RefObject<HTMLElement>,
  location: Location
) {
  // One id per visit. The page is keyed by slug, so a new slug remounts it.
  const [viewId] = useState(newViewId);
  const maxScrollRef = useRef(0);

  const trackBreakdown = useCallback(
    (
      event: string,
      properties: Record<string, unknown> = {},
      options?: Parameters<typeof track>[2]
    ) =>
      track(
        event,
        { breakdown: slug, breakdown_view_id: viewId, ...properties },
        options
      ),
    [slug, viewId]
  );

  // tech_breakdown_viewed: once per visit. Reads the location it mounted with.
  const mountLocation = useRef(location);
  useEffect(() => {
    const { state, key, search } = mountLocation.current;
    const entry: BreakdownEntry =
      (state as BreakdownLinkState | null)?.from === 'reel'
        ? 'reel'
        : key !== 'default'
          ? 'in_app'
          : 'direct';
    trackBreakdown('tech_breakdown_viewed', {
      entry,
      ...referrerProperties(),
      ...utmProperties(search),
    });
  }, [trackBreakdown]);

  // tech_breakdown_scroll_depth: each milestone once per visit.
  useEffect(() => {
    const page = pageRef.current;
    if (!page) {
      return undefined;
    }
    const startedAt = performance.now();
    const reached = new Set<number>();
    maxScrollRef.current = 0;

    const check = () => {
      const scrollable = page.scrollHeight - page.clientHeight;
      if (scrollable <= 0) {
        return;
      }
      const bottom = page.scrollTop + page.clientHeight;
      const percent =
        page.scrollHeight - bottom <= 4
          ? 100
          : Math.floor((bottom / page.scrollHeight) * 100);
      maxScrollRef.current = Math.max(maxScrollRef.current, percent);
      for (const milestone of SCROLL_MILESTONES) {
        if (percent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          trackBreakdown('tech_breakdown_scroll_depth', {
            percent: milestone,
            seconds_since_view: Math.round(
              (performance.now() - startedAt) / 1000
            ),
          });
        }
      }
    };

    let frame = 0;
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          check();
        });
      }
    };
    page.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      page.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pageRef, trackBreakdown]);

  // tech_breakdown_section_viewed: a section held on screen for 1.5 s.
  useEffect(() => {
    const page = pageRef.current;
    if (!page || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const sections = Array.from(
      page.querySelectorAll<HTMLElement>('[data-track-section]')
    );
    const seen = new Set<string>();
    const timers = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const id = el.dataset.trackSection ?? el.id;
          if (seen.has(id)) {
            continue;
          }
          const viewport = entry.rootBounds?.height ?? page.clientHeight;
          const needed =
            SECTION_VISIBLE_SHARE *
            Math.min(entry.boundingClientRect.height, viewport);
          const visible =
            entry.isIntersecting && entry.intersectionRect.height >= needed;

          if (visible && !timers.has(id)) {
            timers.set(
              id,
              window.setTimeout(() => {
                timers.delete(id);
                if (document.visibilityState !== 'visible') {
                  return;
                }
                seen.add(id);
                observer.unobserve(el);
                trackBreakdown('tech_breakdown_section_viewed', {
                  section_id: id,
                  section_title: el.dataset.trackTitle ?? '',
                  section_index: sections.indexOf(el),
                });
              }, SECTION_DWELL_MS)
            );
          } else if (!visible && timers.has(id)) {
            window.clearTimeout(timers.get(id));
            timers.delete(id);
          }
        }
      },
      {
        root: page,
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      }
    );
    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pageRef, trackBreakdown]);

  // tech_breakdown_time_on_page: visible and engaged time, sent when the
  // visitor leaves (tab hidden, page closed, or navigated away in the app).
  // Each event carries the time since the previous one, so summing
  // engaged_seconds per breakdown_view_id gives the whole visit.
  useEffect(() => {
    const page = pageRef.current;
    let visibleMs = 0;
    let engagedMs = 0;
    let sentVisibleMs = 0;
    let sentEngagedMs = 0;
    let lastTick = performance.now();
    let lastActivity = lastTick;

    const tick = () => {
      const now = performance.now();
      if (document.visibilityState === 'visible') {
        visibleMs += now - lastTick;
        engagedMs += Math.max(
          0,
          Math.min(now, lastActivity + IDLE_MS) - lastTick
        );
      }
      lastTick = now;
    };

    const send = (reason: 'hidden' | 'pagehide' | 'route_change') => {
      tick();
      const visibleDelta = visibleMs - sentVisibleMs;
      if (visibleDelta < MIN_REPORT_MS) {
        return;
      }
      const engagedDelta = engagedMs - sentEngagedMs;
      sentVisibleMs = visibleMs;
      sentEngagedMs = engagedMs;
      trackBreakdown(
        'tech_breakdown_time_on_page',
        {
          reason,
          engaged_seconds: Math.round(engagedDelta / 1000),
          visible_seconds: Math.round(visibleDelta / 1000),
          total_engaged_seconds: Math.round(engagedMs / 1000),
          total_visible_seconds: Math.round(visibleMs / 1000),
          max_scroll_percent: maxScrollRef.current,
        },
        // The page may be closing: send now with a beacon. A route change
        // inside the app can use the normal batched queue.
        reason === 'route_change'
          ? undefined
          : { transport: 'sendBeacon', send_instantly: true }
      );
    };

    const onActivity = () => {
      tick();
      lastActivity = performance.now();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        send('hidden');
      } else {
        lastTick = performance.now();
        lastActivity = lastTick;
      }
    };
    const onPageHide = () => send('pagehide');

    const activityEvents = [
      'pointerdown',
      'pointermove',
      'keydown',
      'wheel',
      'touchstart',
    ] as const;
    activityEvents.forEach((name) =>
      window.addEventListener(name, onActivity, { passive: true })
    );
    page?.addEventListener('scroll', onActivity, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      activityEvents.forEach((name) =>
        window.removeEventListener(name, onActivity)
      );
      page?.removeEventListener('scroll', onActivity);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      send('route_change');
    };
  }, [pageRef, trackBreakdown]);

  return trackBreakdown;
}
