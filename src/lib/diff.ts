import type { Scene } from "../content/posts/just-run-a-migration/scenes";
import { endpointId, type Edge, type GroupId, type NodeId } from "./layout";

/**
 * Per-element state used by the diagram to decide visual emphasis between
 * adjacent scenes. Computed once per scene transition in `Scrollytelling`.
 *
 * - `new`           — the element wasn't visible in the previous scene.
 * - `label-changed` — the element was visible last scene, but its label or
 *                     subtitle changed (e.g. API's "SQLAlchemy" subtitle
 *                     becoming "Alembic + migrations/").
 * - `unchanged`     — visible in both, exactly the same. Renders dimmed so
 *                     the eye is drawn to whatever's actually new.
 */
export type ElementState = "new" | "label-changed" | "unchanged";

export type SceneDiff = {
  nodes: Map<NodeId, ElementState>;
  groups: Map<GroupId, ElementState>;
  /** Keyed by a stable identifier built from the connection's endpoints. */
  connections: Map<string, ElementState>;
};

/** Stable key for a connection endpoint pair (label-independent). */
export function connKey(edge: Edge): string {
  return `${endpointId(edge.from)}:${edge.from.side}->${endpointId(edge.to)}:${edge.to.side}`;
}

function nodeOverrideKey(o: Scene["nodeOverrides"] extends infer T
  ? T extends Partial<Record<NodeId, infer V>>
    ? V | undefined
    : never
  : never): string {
  if (!o) return "";
  const subtitle = Array.isArray(o.subtitle) ? o.subtitle.join("|") : o.subtitle ?? "";
  return `${o.title ?? ""}::${subtitle}`;
}

/**
 * Compute the diff used to highlight what's new vs carried over.
 *
 * Special case: when there's no `prev` (first real scene after intro), every
 * visible element is treated as "new" — the reader is just landing here.
 */
export function diffScenes(prev: Scene | null, cur: Scene): SceneDiff {
  const nodes = new Map<NodeId, ElementState>();
  const groups = new Map<GroupId, ElementState>();
  const connections = new Map<string, ElementState>();

  const prevVisibleNodes = new Set<NodeId>(prev?.visibleNodes ?? []);
  const prevVisibleGroups = new Set<GroupId>(prev?.visibleGroups ?? []);
  const prevConnLabels = new Map<string, string>();
  for (const c of prev?.connections ?? []) {
    prevConnLabels.set(connKey(c), c.label ?? "");
  }

  for (const id of cur.visibleNodes) {
    if (!prev || !prevVisibleNodes.has(id)) {
      nodes.set(id, "new");
      continue;
    }
    const prevKey = nodeOverrideKey(prev.nodeOverrides?.[id]);
    const curKey = nodeOverrideKey(cur.nodeOverrides?.[id]);
    nodes.set(id, prevKey === curKey ? "unchanged" : "label-changed");
  }

  for (const id of cur.visibleGroups) {
    if (!prev || !prevVisibleGroups.has(id)) {
      groups.set(id, "new");
      continue;
    }
    const prevLabel = prev.groupOverrides?.[id]?.label ?? "";
    const curLabel = cur.groupOverrides?.[id]?.label ?? "";
    groups.set(id, prevLabel === curLabel ? "unchanged" : "label-changed");
  }

  for (const c of cur.connections ?? []) {
    const key = connKey(c);
    if (!prev || !prevConnLabels.has(key)) {
      connections.set(key, "new");
      continue;
    }
    const prevLabel = prevConnLabels.get(key) ?? "";
    const curLabel = c.label ?? "";
    connections.set(key, prevLabel === curLabel ? "unchanged" : "label-changed");
  }

  return { nodes, groups, connections };
}
