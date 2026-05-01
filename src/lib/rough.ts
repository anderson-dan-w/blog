import rough from "roughjs";

// Single module-level generator so we don't churn instances on every render.
// We import from the package root (pre-bundled ESM) because `roughjs/bin/*`
// has extensionless internal imports that trip Node's strict ESM resolver
// during Astro's SSR step.
export const generator = rough.generator();

// Inferred `Drawable` type without importing from `roughjs/bin/core` (same SSR
// risk, and a declaration-only import here would be fine but this avoids any
// accidental runtime bundling).
export type RoughDrawable = ReturnType<typeof generator.rectangle>;

export function drawablesToStrokePath(drawables: RoughDrawable[]): string {
  const parts: string[] = [];
  for (const d of drawables) {
    for (const s of d.sets) {
      if (s.type === "path") {
        parts.push(generator.opsToPath(s));
      }
    }
  }
  return parts.join(" ");
}
