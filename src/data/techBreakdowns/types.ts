import type { VideoCrop } from '../videoCrop';

/**
 * Data model for a "technical breakdown" page (/tech/:slug).
 *
 * Breakdowns are plain data so new ones can be added without touching the
 * page component: write a file next to zippyTown.ts and register it in
 * index.ts.
 *
 * Anything not yet verified against the real project is a `todo` string.
 * The page renders those as small, muted "TODO(Ian)" notes instead of
 * inventing numbers.
 */

/** A slot for a screenshot. Without `src` it renders as a placeholder frame. */
export type BreakdownMedia = {
  /** Public path to an existing image. Omit to show a placeholder frame. */
  src?: string;
  alt: string;
  /** Caption under the frame. For placeholders: what Ian should drop in. */
  caption: string;
};

export type BreakdownFact = {
  label: string;
  /** Verified value, with units. */
  value?: string;
  /** Unverified: what Ian needs to fill in. Rendered as TODO(Ian). */
  todo?: string;
  /** Where the number came from (file, measurement). */
  source?: string;
};

export type PipelineNode = {
  id: string;
  /** Short label shown in the diagram box. */
  label: string;
  /** Tool / tech under the label. */
  tool: string;
  /** Which stage section the node scrolls to. */
  stageId: string;
  /** Lane the node sits in: shared source, web output or Android output. */
  lane: 'source' | 'web' | 'android';
};

export type BreakdownStage = {
  id: string;
  title: string;
  /** Tools / languages involved, shown as chips. */
  tools: string[];
  problem: string;
  /** What the tool or step does. One paragraph per entry. */
  solution: string[];
  result: string;
  /** Key numbers for this stage. */
  facts?: BreakdownFact[];
  media: BreakdownMedia;
  /** Open questions for Ian about this stage. */
  todos?: string[];
};

export type BudgetGroup = {
  title: string;
  facts: BreakdownFact[];
};

export type TechBreakdown = {
  slug: string;
  /** Project name, e.g. "Zippy Town". */
  project: string;
  title: string;
  /** One-line summary under the hero. */
  summary: string;
  hero: {
    video?: string;
    poster?: string;
    /** Zoom to hide capture artefacts at the clip's edges. */
    crop?: VideoCrop;
    alt: string;
  };
  links?: { label: string; href: string }[];
  /**
   * The project's Google Play listing. Shown as a "Get it on Google Play"
   * badge in the hero and in a short call to action at the end of the page.
   */
  playStore?: {
    /** Package name / applicationId from the app's build.gradle. */
    packageName: string;
    /** Heading for the call to action at the end of the page. */
    title: string;
    /** One or two lines aimed at the readers most likely to install it. */
    body: string;
  };
  pipeline: PipelineNode[];
  stages: BreakdownStage[];
  budgets: {
    intro: string;
    groups: BudgetGroup[];
  };
  closing?: {
    title: string;
    intro?: string;
    points: { title: string; body: string }[];
    todos?: string[];
  };
};
