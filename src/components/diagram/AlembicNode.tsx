import { HandDrawnBox } from "../HandDrawnBox";
import { NODE_RECTS } from "../../lib/layout";
import { NODE_TOOLTIPS } from "../../lib/tooltips";
import { NodeLabel } from "./labels";

type Props = {
  visible?: boolean;
  title?: string;
  /** Single line or multiple stacked lines. Helm scene swaps the subtitle
   *  from "migrations" to "Job". */
  subtitle?: string | string[];
};

export function AlembicNode({
  visible = true,
  title = "Alembic",
  subtitle = "migrations",
}: Props) {
  const r = NODE_RECTS.alembic;
  return (
    <g
      data-node="alembic"
      data-visible={visible ? "true" : "false"}
      className="diagram-node"
    >
      <title>{NODE_TOOLTIPS.alembic}</title>
      <HandDrawnBox {...r} seed={19} />
      <NodeLabel rect={r} title={title} subtitle={subtitle} />
    </g>
  );
}
