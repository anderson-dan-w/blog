import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { scenes } from "../content/posts/automated-db-migration/scenes";
import type { SceneDiff } from "../lib/diff";

const EMPTY_DIFF: SceneDiff = {
  nodes: new Map(),
  groups: new Map(),
  connections: new Map(),
};

/** Side-by-side mini-diagrams for the outro: where we started (step 0) vs.
 *  where we ended up (step 9). Renders without diff highlighting so both
 *  diagrams display normally. Pure SVG, so it can SSR without a client
 *  directive. */
export function OutroComparison() {
  const before = scenes.find((s) => s.id === "step-zero");
  const after = scenes.find((s) => s.id === "terraform-irsa");
  if (!before || !after) return null;

  return (
    <div className="outro-comparison">
      <figure>
        <figcaption>Step 0: psql + ssh</figcaption>
        <ArchitectureDiagram scene={before} diff={EMPTY_DIFF} />
      </figure>
      <figure>
        <figcaption>Step 9: <code>alembic upgrade head</code> on merge</figcaption>
        <ArchitectureDiagram scene={after} diff={EMPTY_DIFF} />
      </figure>
    </div>
  );
}
