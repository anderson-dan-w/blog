---
name: scrolly-diagram-diff
description: Add per-step "what's new" highlighting to scrolly-telling diagrams in this blog. Each diagram element is wrapped in `<g className="diagram-element" data-diff-state="...">` and CSS in src/styles/global.css paints the accent stroke, accent text, dimming for old elements, and pulse animation. Use when authoring a new scrolly post, debugging diff highlighting, or when text/strokes aren't going accent-purple at the right step.
---

# Scrolly Diagram Diff Highlighting

Pattern shared across blog scrolly diagrams (db-migration scenes, AWS-org steps, future posts) for highlighting what's *new this step*. Old stuff dims, new stuff pops in accent + pulses.

## Mechanic

1. Wrap each diagram element in `<g className="diagram-element" data-diff-state={state}>`.
2. Inside, wrap shapes (rough.js `<path>`s) in `<g className="diagram-node">` so the CSS path-stroke selector targets them.
3. CSS in `src/styles/global.css` does the rest — no per-element styling props needed.

## The four states

| `data-diff-state` | When | Effect (from `global.css`) |
|---|---|---|
| `hidden` | element hasn't been introduced yet | `opacity: 0` |
| `new` | element first appears at the current step | accent stroke on `.diagram-node path`, accent fill on all `text`, 1.2s drop-shadow pulse |
| `label-changed` | element existed but its label/subtitle changed this step | accent fill on `text` only (stroke stays default) |
| `unchanged` | element existed and didn't change | `opacity: 0.5` (dimmed so the new stuff stands out) |

The pulse re-fires whenever the user scrolls back/forward to that step, because the `new` class re-applies on remount/state-change.

## Two implementation styles

The blog has two scrolly components, using slightly different shapes of the same mechanic. Pick whichever style fits.

### Style A — declarative scenes + diff function (`Scrollytelling.tsx`)

Used by the db-migration post. Each scene declares `visibleNodes`, `visibleGroups`, `connections`. A `diffScenes(prev, cur)` helper in `src/lib/diff.ts` computes the per-element state by set-diff.

Use when:
- Diagram has many elements with complex connections.
- Same element may be visible across many scenes with subtle changes.
- You want a stable, declarative scene description.

Reference files:
- `src/components/Scrollytelling.tsx` — driver
- `src/components/ArchitectureDiagram.tsx` — `diffWrap()` helper
- `src/lib/diff.ts` — `diffScenes()` and types

### Style B — inline `introducedAt` per element (`AwsOrgScrolly.tsx`)

Used by the AWS-org post. Each diagram element is hard-coded with the step index it first appears at. A small `diffState(stepIndex, introducedAt, labelChangedAt?)` helper inside the component computes the state.

Use when:
- Diagram is small and all elements live in one component.
- Most elements appear once and never change again.
- Declarative scenes would be overkill.

Reference: `src/components/AwsOrgScrolly.tsx` — see `diffState()`, `AssignBox`, and `OrgDiagram`.

The helper:

```tsx
type DiffState = "hidden" | "new" | "label-changed" | "unchanged";

function diffState(
  stepIndex: number,
  introducedAt: number,
  labelChangedAt?: number,
): DiffState {
  if (stepIndex < introducedAt) return "hidden";
  if (stepIndex === introducedAt) return "new";
  if (labelChangedAt !== undefined && stepIndex === labelChangedAt) return "label-changed";
  return "unchanged";
}
```

Per-element usage:

```tsx
<g className="diagram-element" data-diff-state={diffState(stepIndex, 4)}>
  <g className="diagram-node">
    <HandDrawnFilledBox x={30} y={260} width={230} height={130} seed={29} />
  </g>
  <text x={42} y={278} fontSize={11} fill="currentColor">terraform account</text>
</g>
```

For an element whose label changes at a later step (e.g. "basic account" → "Management account" at step 1):

```tsx
<g className="diagram-element" data-diff-state={diffState(stepIndex, 0, 1)}>
  <g className="diagram-node"><HandDrawnFilledBox ... /></g>
  <text ...>{stepIndex === 0 ? "basic account" : "Management account"}</text>
</g>
```

## Required CSS

Already present in `src/styles/global.css`. Don't duplicate — just rely on it. The relevant rules (search for `data-diff-state`):

```css
.diagram-element { transition: opacity 0.4s ease; }
.diagram-element[data-diff-state="hidden"] { opacity: 0; }
.diagram-element[data-diff-state="unchanged"] { opacity: 0.5; }
.diagram-element[data-diff-state="new"] .diagram-node path,
.diagram-element[data-diff-state="new"] .diagram-group path,
.diagram-element[data-diff-state="new"] .diagram-connection path { stroke: var(--accent); }
.diagram-element[data-diff-state="label-changed"] text,
.diagram-element[data-diff-state="new"] text { fill: var(--accent); }
.diagram-element[data-diff-state="new"] { animation: diagram-new-pulse 1.2s ease-out; }
```

## Gotchas

- **Use a `.diagram-node` wrapper around rough.js shapes.** The accent-stroke selector targets `.diagram-element[data-diff-state="new"] .diagram-node path`. Bare `<HandDrawnBox>` directly under `<g className="diagram-element">` won't get the accent stroke. (`.diagram-group` and `.diagram-connection` also work — they're equivalent CSS hooks.)
- **Don't set inline `style={{ opacity: ... }}`.** It overrides the CSS opacity transitions for `hidden` / `unchanged`. Let the data-attribute drive opacity.
- **`fill="var(--accent)"` already-accented text is fine.** When the element transitions to `new` or `label-changed`, the CSS rule sets the same value. No visual conflict.
- **`HandDrawnFilledBox` renders `<rect>` (fill, no stroke) + `<HandDrawnBox>` (stroke path).** The fill `<rect>` has `stroke="none"` so the accent-stroke rule doesn't touch it; only the rough outline goes purple. This is what you want.
- **Label changes only — keep them in their own `<g>` if the box itself shouldn't pulse.** `label-changed` recolors text but leaves the stroke alone, so this is usually fine. But if you have many labels inside one element, all of them go accent on `label-changed`.

## Adding a new scrolly post

1. Pick style A or B based on diagram complexity.
2. For style B, just import `HandDrawnBox` etc. from `AwsOrgScrolly.tsx` patterns and write your `diffState` inline.
3. Each diagram element: wrap in `<g className="diagram-element" data-diff-state={...}>` with a `.diagram-node` inner wrapper around shapes.
4. No CSS changes needed — `global.css` already covers all four states.
5. Verify in the dev server: scroll through, check that each step's new elements pulse accent and old elements dim to 50%.
