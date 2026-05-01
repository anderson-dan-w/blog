import { HandDrawnCylinder } from "../HandDrawnCylinder";
import { NODE_RECTS } from "../../lib/layout";
import { NODE_TOOLTIPS } from "../../lib/tooltips";
import { NodeLabel } from "./labels";

type Props = { visible?: boolean };

export function PostgresNode({ visible = true }: Props) {
  const r = NODE_RECTS.postgres;
  return (
    <g
      data-node="postgres"
      data-visible={visible ? "true" : "false"}
      className="diagram-node"
    >
      <title>{NODE_TOOLTIPS.postgres}</title>
      <HandDrawnCylinder {...r} seed={11} />
      <NodeLabel rect={r} title="Postgres" />
    </g>
  );
}
