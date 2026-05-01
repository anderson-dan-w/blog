import { HandDrawnBox } from "../HandDrawnBox";
import { GROUP_RECTS } from "../../lib/layout";
import { GROUP_TOOLTIPS } from "../../lib/tooltips";
import { GroupLabel } from "./labels";

type Props = { visible?: boolean };

export function K8sGroup({ visible = true }: Props) {
  const r = GROUP_RECTS.k8s;
  return (
    <g
      data-group="k8s"
      data-visible={visible ? "true" : "false"}
      className="diagram-group"
    >
      <title>{GROUP_TOOLTIPS.k8s}</title>
      <HandDrawnBox {...r} seed={37} strokeWidth={1.2} />
      <GroupLabel rect={r} label="Kubernetes" />
    </g>
  );
}
