import { HandDrawnBox } from "../HandDrawnBox";
import { NODE_RECTS } from "../../lib/layout";
import { NODE_TOOLTIPS } from "../../lib/tooltips";
import { NodeLabel } from "./labels";

type Props = { visible?: boolean };

export function ArgoNode({ visible = true }: Props) {
  const r = NODE_RECTS.argo;
  return (
    <g
      data-node="argo"
      data-visible={visible ? "true" : "false"}
      className="diagram-node"
    >
      <title>{NODE_TOOLTIPS.argo}</title>
      <HandDrawnBox {...r} seed={29} />
      <NodeLabel rect={r} title="ArgoCD" subtitle="GitOps" />
    </g>
  );
}
