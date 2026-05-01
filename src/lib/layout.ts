// Shared diagram layout. Every node and group has a single canonical rect here
// so scenes can be pure data — they only decide *which* nodes are visible, not
// where anything lives on the canvas. This also guarantees the Postgres anchor
// stays at the same pixel coordinates across every scene.

export type NodeId = "postgres" | "api" | "alembic" | "ci" | "argo";
export type GroupId =
  | "docker-api"
  | "docker-alembic"
  | "k8s"
  | "helm-chart-dev"
  | "helm-chart-prod"
  | "cloud";

export type Rect = { x: number; y: number; width: number; height: number };

// Canvas bounds. Extra empty space around the content rect:
//   - minY=-50 pads the top so the helm-chart-dev box (rect y=0) doesn't
//     visually collide with the fixed progress bar above the sticky column.
//   - minX=-50 pads the left so the CI node and its "build + push" arrow
//     label sit comfortably outside the AWS/Terraform boundary.
// Width/height are sized to contain the full content rect plus those pads.
export const VIEWBOX = {
  minX: -50,
  minY: -80,
  width: 550,
  height: 525,
} as const;

// Tech nodes.
export const NODE_RECTS: Record<NodeId, Rect> = {
  // Center-right cylinder. The anchor — never moves across scenes.
  postgres: { x: 370, y: 150, width: 80, height: 130 },
  // Middle-left box. Added in scene 2.
  api: { x: 160, y: 180, width: 120, height: 80 },
  // Directly above the API box. Added in scene 3.
  alembic: { x: 160, y: 65, width: 120, height: 70 },
  // Top-left, outside the cluster/cloud. CI lives on GitHub's infra, not AWS,
  // so it stays outside the AWS/Terraform boundary. Shifted left into the
  // expanded viewBox so the "build + push" arrow label has room to breathe.
  // Added in scene 7.
  ci: { x: -30, y: 65, width: 100, height: 70 },
  // Below the k8s cluster. ArgoCD runs *inside* the cluster (managed by
  // Terraform), so it sits inside the cloud boundary — unlike CI. Centered
  // on the k8s cluster's x-midpoint so the "sync" arrow points straight up
  // at k8s.bottom. Y tuned for ~50px of arrow clearance. Added in scene 8.
  argo: { x: 170, y: 340, width: 100, height: 55 },
};

// Group/boundary wrappers. Each encloses a subset of nodes.
export const GROUP_RECTS: Record<GroupId, Rect> = {
  // Two separate container wrappers. Step-4 introduces both as a pair —
  // one for the API, one for the migration runner. Not a single shared
  // docker box, because the whole point is the two containers diverge in
  // lifecycle and permissions. Top edges sit ~20px above each node so the
  // "docker" label has clearance above the node's border stroke.
  "docker-alembic": { x: 150, y: 45, width: 140, height: 100 },
  "docker-api": { x: 150, y: 160, width: 140, height: 110 },
  // K8s wraps both docker containers with a margin. Top edge sits ~20px
  // above docker-alembic so the "Kubernetes" label has clearance above
  // the inner docker box border, and below the helm-chart-dev label
  // when helm-chart-dev is also visible.
  k8s: { x: 140, y: 25, width: 160, height: 265 },
  // Helm chart: two stacked boxes representing the same chart deployed to
  // two envs. Prod sits offset up-and-left of dev so its label can peek out
  // of the exposed corner. Both wrap k8s + postgres.
  "helm-chart-dev": { x: 135, y: 0, width: 320, height: 300 },
  "helm-chart-prod": { x: 105, y: -20, width: 320, height: 300 },
  // AWS/Terraform boundary. Wraps the whole helm chart (which itself contains
  // k8s + postgres) plus argo, which runs inside the cluster. CI stays
  // outside — it runs on GitHub's infra, not AWS. Top edge sits above
  // helm-chart-dev's top so the cloud label has clearance without crossing
  // the helm box stroke.
  cloud: { x: 120, y: -30, width: 355, height: 430 },
};

// -- Connection endpoints -----------------------------------------------------

export type Side = "left" | "right" | "top" | "bottom";
// Endpoints can attach to either a tech node or a group/boundary. Groups are
// useful when the arrow represents an action on the whole container (e.g.
// ArgoCD reconciling the helm chart, not a specific pod).
export type Endpoint =
  | { node: NodeId; side: Side }
  | { group: GroupId; side: Side };
export type Edge = {
  from: Endpoint;
  to: Endpoint;
  label?: string;
};

export function resolveEndpointRect(e: Endpoint): Rect {
  return "node" in e ? NODE_RECTS[e.node] : GROUP_RECTS[e.group];
}

export function endpointId(e: Endpoint): string {
  return "node" in e ? e.node : e.group;
}

export function anchorPoint(rect: Rect, side: Side): { x: number; y: number } {
  switch (side) {
    case "left":
      return { x: rect.x, y: rect.y + rect.height / 2 };
    case "right":
      return { x: rect.x + rect.width, y: rect.y + rect.height / 2 };
    case "top":
      return { x: rect.x + rect.width / 2, y: rect.y };
    case "bottom":
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height };
  }
}
