import { useMemo } from "react";
import { drawablesToStrokePath, generator } from "../../lib/rough";
import { GROUP_RECTS } from "../../lib/layout";
import { GROUP_TOOLTIPS } from "../../lib/tooltips";
import { GroupLabel } from "./labels";

type Props = {
  /** Which env this chart represents (front/back layer). */
  target: "dev" | "prod";
  visible?: boolean;
  label?: string;
};

const SEEDS = { dev: 41, prod: 43 } as const;

export function HelmChartGroup({
  target,
  visible = true,
  label = target,
}: Props) {
  const id = `helm-chart-${target}` as const;
  const r = GROUP_RECTS[id];
  // Dashed stroke signals "packaging boundary" rather than a runtime
  // container (the docker and k8s boxes use solid strokes). Prod renders
  // as only the top + left edges — the right and bottom are covered by
  // dev's box, so drawing them would clutter the picture.
  const d = useMemo(() => {
    const opts = {
      seed: SEEDS[target],
      roughness: 1.1,
      strokeLineDash: [6, 4],
    };
    if (target === "dev") {
      return drawablesToStrokePath([
        generator.rectangle(r.x, r.y, r.width, r.height, opts),
      ]);
    }
    return drawablesToStrokePath([
      generator.line(r.x, r.y, r.x + r.width, r.y, opts),
      generator.line(r.x, r.y, r.x, r.y + r.height, opts),
    ]);
  }, [r.x, r.y, r.width, r.height, target]);

  return (
    <g
      data-group={id}
      data-visible={visible ? "true" : "false"}
      className="diagram-group"
    >
      <title>{GROUP_TOOLTIPS[id]}</title>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.2} />
      <GroupLabel rect={r} label={label} />
    </g>
  );
}
