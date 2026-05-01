import type { Scene } from "../content/posts/automated-db-migration/scenes";
import type { ElementState, SceneDiff } from "../lib/diff";
import { connKey } from "../lib/diff";
import { VIEWBOX, type GroupId, type NodeId } from "../lib/layout";
import { AlembicNode } from "./diagram/AlembicNode";
import { ApiNode } from "./diagram/ApiNode";
import { ArgoNode } from "./diagram/ArgoNode";
import { CiNode } from "./diagram/CiNode";
import { Connection } from "./diagram/Connection";
import { DockerGroup } from "./diagram/DockerGroup";
import { HelmChartGroup } from "./diagram/HelmChartGroup";
import { K8sGroup } from "./diagram/K8sGroup";
import { PostgresNode } from "./diagram/PostgresNode";
import { TerraformGroup } from "./diagram/TerraformGroup";

type Props = { scene: Scene; diff: SceneDiff };

/** Wrap a single rendered element with diff state for CSS targeting.
 *  - `new`           — full opacity + accent stroke (the "look here" element)
 *  - `label-changed` — full opacity, label text picks up the accent
 *  - `unchanged`     — dimmed so the eye finds the new stuff first
 *  - hidden / no diff entry → renders normally (e.g. intro scene)
 */
function diffWrap(state: ElementState | undefined, child: React.ReactNode) {
  return (
    <g className="diagram-element" data-diff-state={state ?? "none"}>
      {child}
    </g>
  );
}

export function ArchitectureDiagram({ scene, diff }: Props) {
  const visibleNodes = new Set(scene.visibleNodes);
  const visibleGroups = new Set(scene.visibleGroups);
  const overrides = scene.nodeOverrides ?? {};
  const groupOverrides = scene.groupOverrides ?? {};

  const nodeState = (id: NodeId) => diff.nodes.get(id);
  const groupState = (id: GroupId) => diff.groups.get(id);

  return (
    <svg
      viewBox={`${VIEWBOX.minX} ${VIEWBOX.minY} ${VIEWBOX.width} ${VIEWBOX.height}`}
      className="diagram-svg"
      data-ghosted={scene.ghosted ? "true" : "false"}
      role="img"
      aria-label={`Architecture: ${scene.title}`}
    >
      {/* Group wrappers render first so tech nodes sit on top of them.
          Z-order: outer -> inner. Helm-chart-prod sits BEHIND dev so dev's
          stroke and label paint over it cleanly. */}
      {diffWrap(
        groupState("cloud"),
        <TerraformGroup
          visible={visibleGroups.has("cloud")}
          label={groupOverrides["cloud"]?.label}
        />,
      )}
      {diffWrap(
        groupState("helm-chart-prod"),
        <HelmChartGroup
          target="prod"
          visible={visibleGroups.has("helm-chart-prod")}
          label={groupOverrides["helm-chart-prod"]?.label}
        />,
      )}
      {diffWrap(
        groupState("helm-chart-dev"),
        <HelmChartGroup
          target="dev"
          visible={visibleGroups.has("helm-chart-dev")}
          label={groupOverrides["helm-chart-dev"]?.label}
        />,
      )}
      {diffWrap(groupState("k8s"), <K8sGroup visible={visibleGroups.has("k8s")} />)}
      {diffWrap(
        groupState("docker-api"),
        <DockerGroup
          target="api"
          visible={visibleGroups.has("docker-api")}
          label={groupOverrides["docker-api"]?.label}
        />,
      )}
      {diffWrap(
        groupState("docker-alembic"),
        <DockerGroup
          target="alembic"
          visible={visibleGroups.has("docker-alembic")}
          label={groupOverrides["docker-alembic"]?.label}
        />,
      )}

      {/* Connections render between groups and nodes so arrow shafts sit on
          top of group fills but below node labels. Keyed by scene.id so React
          unmounts on scene change. */}
      {scene.connections?.map((edge, i) =>
        diffWrap(
          diff.connections.get(connKey(edge)),
          <Connection
            key={`${scene.id}-${i}`}
            from={edge.from}
            to={edge.to}
            label={edge.label}
            seed={51 + i * 5}
          />,
        ),
      )}

      {/* Tech nodes. Always rendered in DOM; the `visible` prop drives a CSS
          fade via `[data-visible="false"]` so the Postgres anchor truly stays
          mounted across every scene. */}
      {diffWrap(
        nodeState("postgres"),
        <PostgresNode visible={visibleNodes.has("postgres")} />,
      )}
      {diffWrap(
        nodeState("api"),
        <ApiNode
          visible={visibleNodes.has("api")}
          subtitle={overrides.api?.subtitle}
        />,
      )}
      {diffWrap(
        nodeState("alembic"),
        <AlembicNode
          visible={visibleNodes.has("alembic")}
          title={overrides.alembic?.title}
          subtitle={overrides.alembic?.subtitle}
        />,
      )}
      {diffWrap(nodeState("ci"), <CiNode visible={visibleNodes.has("ci")} />)}
      {diffWrap(nodeState("argo"), <ArgoNode visible={visibleNodes.has("argo")} />)}
    </svg>
  );
}
