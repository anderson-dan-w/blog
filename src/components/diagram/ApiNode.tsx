import { HandDrawnBox } from "../HandDrawnBox";
import { NODE_RECTS } from "../../lib/layout";
import { NODE_TOOLTIPS } from "../../lib/tooltips";
import { NodeLabel } from "./labels";

type Props = {
  visible?: boolean;
  /** Single line, or multiple stacked lines. Helm scene swaps the subtitle
   *  from "SQLAlchemy" to "Deployment"; step-2 adds a second line. */
  subtitle?: string | string[];
};

export function ApiNode({
  visible = true,
  subtitle = "SQLAlchemy",
}: Props) {
  const r = NODE_RECTS.api;
  return (
    <g
      data-node="api"
      data-visible={visible ? "true" : "false"}
      className="diagram-node"
    >
      <title>{NODE_TOOLTIPS.api}</title>
      <HandDrawnBox {...r} seed={13} />
      <NodeLabel rect={r} title="API" subtitle={subtitle} />
    </g>
  );
}
