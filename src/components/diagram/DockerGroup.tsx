import { HandDrawnBox } from "../HandDrawnBox";
import { GROUP_RECTS } from "../../lib/layout";
import { GROUP_TOOLTIPS } from "../../lib/tooltips";
import { GroupLabel } from "./labels";

type Props = {
  /** Which node this container wraps. */
  target: "api" | "alembic";
  visible?: boolean;
  /** Override the default "docker" label (e.g. "Job" or "Deployment"). */
  label?: string;
};

const SEEDS = { api: 31, alembic: 37 } as const;

export function DockerGroup({ target, visible = true, label = "docker" }: Props) {
  const id = `docker-${target}` as const;
  const r = GROUP_RECTS[id];
  return (
    <g
      data-group={id}
      data-visible={visible ? "true" : "false"}
      className="diagram-group"
    >
      <title>{GROUP_TOOLTIPS[id]}</title>
      <HandDrawnBox {...r} seed={SEEDS[target]} strokeWidth={1.2} />
      <GroupLabel rect={r} label={label} />
    </g>
  );
}
