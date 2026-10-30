import type { TechBreakdown } from './types';
import { fromTheCouchBreakdown } from './fromTheCouch';
import { zippyTownBreakdown } from './zippyTown';

export type { TechBreakdown } from './types';

/** Every breakdown, keyed by URL slug (/tech/:slug). */
export const techBreakdowns: Record<string, TechBreakdown> = {
  [zippyTownBreakdown.slug]: zippyTownBreakdown,
  [fromTheCouchBreakdown.slug]: fromTheCouchBreakdown,
};

export const techBreakdownPath = (slug: string) => `/tech/${slug}`;
