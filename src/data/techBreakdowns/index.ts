import type { TechBreakdown } from './types';
import { zippyTownBreakdown } from './zippyTown';

export type { TechBreakdown } from './types';

/** Every breakdown, keyed by URL slug (/tech/:slug). */
export const techBreakdowns: Record<string, TechBreakdown> = {
  [zippyTownBreakdown.slug]: zippyTownBreakdown,
};

export const techBreakdownPath = (slug: string) => `/tech/${slug}`;
