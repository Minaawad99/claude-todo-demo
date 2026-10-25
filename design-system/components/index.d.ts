/**
 * طب إزاي؟ — the components are HTML + CSS classes (bundle.css).
 * bundle.js adds the motion engine on window.TebEzay.
 * Each <Comp>Props lists the classes and data attributes a consumer provides.
 */

/** Motion verbs read from data-tz. */
type TzVerb = "type" | "ink" | "key" | "underline" | "count" | "ring" | "draw" | "pop" | "rise" | "fade" | "xray" | "callout";

/** Attributes every animated element may carry. */
interface TzMotionAttrs {
  "data-tz"?: TzVerb;
  /** Start with the previous beat instead of after it. */
  "data-tz-with"?: "prev";
  /** Absolute start time in ms from play(). */
  "data-tz-at"?: number;
  /** Extra wait before this beat, ms. */
  "data-tz-delay"?: number;
  /** Override this beat's length, ms. */
  "data-tz-dur"?: number;
}

/** figure.tz-frame (+ tz-frame--sheet) > .tz-frame__stage.tz-paper, .tz-frame__rule, figcaption.tz-frame__caption */
interface SceneFrameProps { variant?: "scene" | "sheet"; stage: "SVG viewBox 0 0 360 410 + callouts/insets"; caption: "1–2 Caption lines"; }
/** p.tz-caption with span.tz-k.tz-k--{heat|water|part} and span.tz-em */
interface CaptionProps extends TzMotionAttrs { keyword?: "heat" | "water" | "part"; emphasis?: boolean; }
/** span.tz-callout.tz-callout--{meaning} style="--x --y --angle --len --chip-shift" > __line, __dot, __chip */
interface CalloutProps extends TzMotionAttrs { x: string; y: string; angle?: string; len?: string; chipShift?: string; meaning?: "heat" | "water" | "part"; label: string; }
/** div.tz-inset style="--x --y --size" > svg viewBox 0 0 100 100 */
interface InsetProps extends TzMotionAttrs { x: string; y: string; size?: string; }
/** div.tz-counter(.tz-counter--water) > span.tz-counter__num[data-to], span.tz-counter__unit */
interface CounterProps extends TzMotionAttrs { to: number; from?: number; unit: string; meaning?: "heat" | "water"; numSize?: string; }
/** span.tz-brand > svg.tz-watch(.crown .track .arc .core), span.tz-brand__name */
interface BrandMarkProps extends TzMotionAttrs { watchSize?: string; }
/** a.tz-tag */
interface CategoryTagProps { label: string; href?: string; }
/** ol.tz-legend style="--cols" > li > span.tz-num + name */
interface LegendProps { items: string[]; cols?: number; }
/** .tz-ask > .tz-ask__lead, .tz-ask__line > .tz-ask__blank (span or input) */
interface AskBoxProps { lead: string[]; editable?: boolean; }
/** a.tz-card > .tz-card__thumb(svg g.tz-card__inner + g.tz-card__shell, __play, __dur), .tz-card__meta, h3.tz-card__title > span */
interface VideoCardProps { title: string; category: string; duration: string; published: string; href: string; }

interface TebEzayTiming { fast: 200; base: 400; slow: 800; word: 110; gap: 120; count: 1400; ring: 1300; }

declare const TebEzay: {
  timing: TebEzayTiming;
  /** Play every [data-tz] under root in DOM order. Returns total length in ms. No-op under prefers-reduced-motion unless force. */
  play(root?: Element | Document, opts?: { delay?: number; force?: boolean }): number;
  /** Cancel pending beats under root. */
  stop(root: Element): void;
  /** play() once when root is 40% visible. */
  onView(root: Element, opts?: { delay?: number; force?: boolean }): void;
  /** Inject #tz-hatch, #tz-dots, #tz-lines SVG patterns once per document. */
  patterns(doc?: Document): void;
  splitWords(el: Element): NodeListOf<Element>;
  countUp(el: Element, ms: number): void;
};
