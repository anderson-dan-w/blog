import { HandDrawnBox } from "../HandDrawnBox";
import { NODE_RECTS } from "../../lib/layout";
import { NODE_TOOLTIPS } from "../../lib/tooltips";
import { NodeLabel } from "./labels";

type Props = { visible?: boolean };

export function CiNode({ visible = true }: Props) {
  const r = NODE_RECTS.ci;
  return (
    <g
      data-node="ci"
      data-visible={visible ? "true" : "false"}
      className="diagram-node"
    >
      <title>{NODE_TOOLTIPS.ci}</title>
      <HandDrawnBox {...r} seed={23} />
      <NodeLabel rect={r} title="GHA" subtitle="build + publish" />
    </g>
  );
}
