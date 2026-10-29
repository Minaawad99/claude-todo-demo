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
  /** 3D isometric cutaway helpers drawing into an SVG group. x right-down, y left-down, z up. */
  iso(root: SVGGElement, opts?: { scale?: number; x?: number; y?: number }): TebEzayIso;
};

type Pt3 = [number, number, number];
interface TebEzayIso {
  scale: number;
  P(x: number, y: number, z: number): [number, number];
  d(points: Pt3[], close?: boolean): string;
  el(tag: string, attrs: Record<string, string>, parent?: Element): SVGElement;
  group(parent?: Element, attrs?: Record<string, string>): SVGGElement;
  face(g: Element, points: Pt3[], cls: string, attrs?: Record<string, string>): SVGPathElement;
  line(g: Element, points: Pt3[], cls: string): SVGPathElement;
  box(g: Element, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, faces?: { z?: string; x?: string; y?: string; hatch?: boolean }): SVGPathElement;
  ring(cx: number, cy: number, cz: number, r: number, n?: number, plane?: "x" | "y" | "z", a0?: number, a1?: number): Pt3[];
  disc(g: Element, cx: number, cy: number, cz: number, r: number, plane: "x" | "y" | "z", cls: string): SVGPathElement;
  cyl(g: Element, cx: number, cy: number, r: number, z0: number, z1: number, side?: string, top?: string): SVGPathElement;
  pipe(g: Element, points: Pt3[], inner?: string): SVGPathElement;
  /** Back walls + floor slab; returns a group clipped to show only what sits under the floor's cut edge. */
  cutaway(g: Element, W: number, D: number, H: number, T: number, B: number, clipId?: string): SVGGElement;
  /** A bar turning about z in true 3D (spray arm, fan blade). Redraw each frame. */
  rotor(g: Element, o: { x: number; y: number; z: number; length: number; width: number; thick?: number; angle: number; side?: string; sideX?: string; top?: string }): void;
}
