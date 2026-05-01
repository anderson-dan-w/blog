import { useMemo } from "react";
import { drawablesToStrokePath, generator } from "../../lib/rough";
import { GROUP_RECTS } from "../../lib/layout";
import { GROUP_TOOLTIPS } from "../../lib/tooltips";
import { GroupLabel } from "./labels";

type Props = { visible?: boolean; label?: string };

// Terraform / AWS boundary. Rendered as a dashed sketchy rectangle rather
// than a "cloud" puff, because the cloud shape looked awkward at this size
// and the dashed box reads more clearly as "logical grouping" (IAM + billing
// + VPC scope — not a runtime container like docker or k8s). The dash
// pattern [10, 5] is intentionally longer than helm-chart's [6, 4] so the
// two boundaries remain visually distinct if they ever appear together.
export function TerraformGroup({
  visible = true,
  label = "AWS · Terraform",
}: Props) {
  const r = GROUP_RECTS.cloud;
  const d = useMemo(
    () =>
      drawablesToStrokePath([
        generator.rectangle(r.x, r.y, r.width, r.height, {
          seed: 41,
          roughness: 1.1,
          strokeLineDash: [10, 5],
        }),
      ]),
    [r.x, r.y, r.width, r.height],
  );

  return (
    <g
      data-group="cloud"
      data-visible={visible ? "true" : "false"}
      className="diagram-group"
    >
      <title>{GROUP_TOOLTIPS.cloud}</title>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.2} />
      <GroupLabel rect={r} label={label} />
    </g>
  );
}
