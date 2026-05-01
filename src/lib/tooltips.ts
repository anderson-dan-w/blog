import type { GroupId, NodeId } from "./layout";

/** Hover tooltips for diagram elements. Renders as native SVG <title>, which
 *  browsers surface as a small tooltip on hover. Useful for readers who don't
 *  recognize every tool by name. */
export const NODE_TOOLTIPS: Record<NodeId, string> = {
  postgres: "Postgres — relational database, hosted on AWS RDS",
  api: "API — Python service that talks to Postgres via SQLAlchemy",
  alembic: "Alembic — schema migration tool built on top of SQLAlchemy",
  ci: "GitHub Actions — CI: builds images and runs alembic check on PRs",
  argo: "ArgoCD — GitOps controller; reconciles helm charts into the cluster",
};

export const GROUP_TOOLTIPS: Record<GroupId, string> = {
  "docker-api": "Docker container running the API process",
  "docker-alembic": "Docker container running `alembic upgrade head` once",
  k8s: "Kubernetes cluster (AWS EKS) — orchestrates containers",
  "helm-chart-dev": "Helm chart — templated, versioned k8s manifests for dev",
  "helm-chart-prod": "Helm chart deployed to prod",
  cloud: "AWS — provisioned by Terraform (RDS, EKS, IAM roles, OIDC/IRSA)",
};
