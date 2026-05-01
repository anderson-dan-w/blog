import type { Edge, GroupId, NodeId } from "../../../lib/layout";

// Prose lives in `./prose/<id>.md` (sibling dir) — edit those files to change
// what the reader sees. `?raw` makes Vite hand us the file contents as a
// plain string at build time (bypasses any markdown transformation).
// Supported formatting:
//   - Blank lines separate paragraphs.
//   - Backticks wrap inline code, e.g. `alembic upgrade head`.
// Anything else (bold, italics, links) renders as literal text for now.
import introProse from "./prose/intro.md?raw";
import stepZeroProse from "./prose/step-0-manual-migration.md?raw";
import sqlalchemyProse from "./prose/step-1-sqlalchemy.md?raw";
import migrationsFolderProse from "./prose/step-2-migrations-folder.md?raw";
import alembicProse from "./prose/step-3-alembic-enters.md?raw";
import separateContainerProse from "./prose/step-4-separate-migration-container.md?raw";
import kubernetesProse from "./prose/step-5-kubernetes.md?raw";
import helmProse from "./prose/step-6-helm.md?raw";
import ghaProse from "./prose/step-7-github-actions.md?raw";
import argoProse from "./prose/step-8-argocd.md?raw";
import terraformProse from "./prose/step-9-terraform-irsa.md?raw";

// Per-scene extras (bottom-left quadrant content). Optional per scene; same
// ?raw-import pattern as prose. Each file is plain markdown — usually a
// small code snippet.
import stepZeroExtras from "./extras/step-0-manual-migration.md?raw";
import sqlalchemyExtras from "./extras/step-1-sqlalchemy.md?raw";
import migrationsFolderExtras from "./extras/step-2-migrations-folder.md?raw";
import alembicExtras from "./extras/step-3-alembic-enters.md?raw";
import separateContainerExtras from "./extras/step-4-separate-migration-container.md?raw";
import kubernetesExtras from "./extras/step-5-kubernetes.md?raw";
import helmExtras from "./extras/step-6-helm.md?raw";
import ghaExtras from "./extras/step-7-github-actions.md?raw";
import argoExtras from "./extras/step-8-argocd.md?raw";
import terraformExtras from "./extras/step-9-terraform-irsa.md?raw";

export type Scene = {
  id: string;
  title: string;
  /** 1-word label for the top progress bar marker. */
  shortTitle: string;
  prose: string;
  /** Nodes rendered with `visible=true`. All others fade out. */
  visibleNodes: NodeId[];
  /** Group/boundary wrappers to render. */
  visibleGroups: GroupId[];
  /** Arrows for this scene. Rendered between groups and nodes. */
  connections?: Edge[];
  /** Per-scene overrides on node labels. `subtitle` accepts a string or array
   *  of strings (rendered as stacked lines). */
  nodeOverrides?: Partial<
    Record<NodeId, { title?: string; subtitle?: string | string[] }>
  >;
  /** Per-scene overrides on group labels (e.g. docker box labeled "Job"
   *  instead of "docker" in the k8s scene). */
  groupOverrides?: Partial<Record<GroupId, { label?: string }>>;
  /** Optional markdown rendered in the bottom-left "extras" quadrant —
   *  usually a short code snippet. Hidden on mobile. */
  extras?: string;
  /** Render the whole diagram at low opacity — used for the intro "preview
   *  of everything that's coming" view. Nodes/groups still use their normal
   *  data-visible flags, but the wrapping layer fades the whole thing. */
  ghosted?: boolean;
};

export const scenes: Scene[] = [
  {
    id: "intro",
    title: "Where we started",
    shortTitle: "Intro",
    prose: introProse,
    // Ghost-preview of the stack we already had before this story began —
    // Postgres, API, Docker, k8s, Helm, GHA, ArgoCD, AWS. The alembic node
    // and migration container are *not* here; those are what we added.
    visibleNodes: ["postgres", "api", "ci", "argo"],
    visibleGroups: ["docker-api", "k8s", "helm-chart-dev", "cloud"],
    ghosted: true,
  },
  {
    id: "step-zero",
    title: "0. Manual exec and psql",
    shortTitle: "Manual",
    prose: stepZeroProse,
    visibleNodes: ["postgres", "api"],
    visibleGroups: [],
    connections: [
      {
        from: { node: "api", side: "right" },
        to: { node: "postgres", side: "left" },
        label: "psql",
      },
    ],
    extras: stepZeroExtras,
  },
  {
    id: "sqlalchemy",
    title: "1. SQLAlchemy generates SQL",
    shortTitle: "SQLAlchemy",
    prose: sqlalchemyProse,
    visibleNodes: ["postgres", "api"],
    visibleGroups: [],
    connections: [
      {
        from: { node: "api", side: "right" },
        to: { node: "postgres", side: "left" },
        label: "SQLAlchemy",
      },
    ],
    extras: sqlalchemyExtras,
  },
  {
    id: "migrations-folder",
    title: "2. migrations/ folder with SQL",
    shortTitle: "migrations/",
    prose: migrationsFolderProse,
    visibleNodes: ["postgres", "api"],
    visibleGroups: [],
    connections: [
      {
        from: { node: "api", side: "right" },
        to: { node: "postgres", side: "left" },
        label: "SQLAlchemy",
      },
    ],
    nodeOverrides: {
      api: { subtitle: ["SQLAlchemy", "+ migrations/"] },
    },
    extras: migrationsFolderExtras,
  },
  {
    id: "alembic",
    title: "3. Alembic autogenerates SQL",
    shortTitle: "Alembic",
    prose: alembicProse,
    visibleNodes: ["postgres", "api"],
    visibleGroups: [],
    connections: [
      {
        from: { node: "api", side: "right" },
        to: { node: "postgres", side: "left" },
        label: "alembic",
      },
    ],
    nodeOverrides: {
      api: { subtitle: ["Alembic", "+ migrations/"] },
    },
    extras: alembicExtras,
  },
  {
    id: "separate-migration-container",
    title: "4. Separate migration container",
    shortTitle: "Docker",
    prose: separateContainerProse,
    visibleNodes: ["postgres", "api", "alembic"],
    visibleGroups: ["docker-api", "docker-alembic"],
    connections: [
      {
        from: { node: "alembic", side: "right" },
        to: { node: "postgres", side: "left" },
        label: "alembic",
      },
    ],
    extras: separateContainerExtras,
  },
  {
    id: "kubernetes",
    title: "5. Kubernetes Deployment and Job",
    shortTitle: "Kubernetes",
    prose: kubernetesProse,
    visibleNodes: ["postgres", "api", "alembic"],
    visibleGroups: ["docker-api", "docker-alembic", "k8s"],
    connections: [
      {
        from: { node: "alembic", side: "right" },
        to: { node: "postgres", side: "left" },
        label: "alembic",
      },
    ],
    groupOverrides: {
      "docker-alembic": { label: "Job" },
      "docker-api": { label: "Deployment" },
    },
    extras: kubernetesExtras,
  },
  {
    id: "helm",
    title: "6. Helm Charts for dev and prod",
    shortTitle: "Helm",
    prose: helmProse,
    visibleNodes: ["postgres", "api", "alembic"],
    visibleGroups: ["docker-api", "docker-alembic", "k8s", "helm-chart-dev"],
    connections: [
      {
        from: { node: "alembic", side: "right" },
        to: { node: "postgres", side: "left" },
        label: "alembic",
      },
    ],
    groupOverrides: {
      "docker-alembic": { label: "Job" },
      "docker-api": { label: "Deployment" },
      "helm-chart-dev": { label: "Helm: values-dev" },
    },
    extras: helmExtras,
  },
  {
    id: "github-actions",
    title: "7. GitHub Actions validates and builds",
    shortTitle: "GitHub Actions",
    prose: ghaProse,
    visibleNodes: ["postgres", "api", "alembic", "ci"],
    visibleGroups: ["docker-api", "docker-alembic", "k8s", "helm-chart-dev"],
    connections: [
      {
        from: { node: "alembic", side: "right" },
        to: { node: "postgres", side: "left" },
        label: "alembic",
      },
      {
        from: { node: "ci", side: "right" },
        to: { group: "helm-chart-dev", side: "left" },
        label: "build + push",
      },
    ],
    groupOverrides: {
      "docker-alembic": { label: "Job" },
      "docker-api": { label: "Deployment" },
      "helm-chart-dev": { label: "Helm: values-dev" },
    },
    extras: ghaExtras,
  },
  {
    id: "argocd",
    title: "8. ArgoCD automates Helm deployment",
    shortTitle: "ArgoCD",
    prose: argoProse,
    visibleNodes: ["postgres", "api", "alembic", "ci", "argo"],
    visibleGroups: ["docker-api", "docker-alembic", "k8s", "helm-chart-dev"],
    connections: [
      {
        from: { node: "alembic", side: "right" },
        to: { node: "postgres", side: "left" },
        label: "alembic",
      },
      {
        from: { node: "ci", side: "right" },
        to: { group: "helm-chart-dev", side: "left" },
        label: "build + push",
      },
      {
        from: { node: "argo", side: "top" },
        to: { group: "k8s", side: "bottom" },
        label: "sync",
      },
    ],
    groupOverrides: {
      "docker-alembic": { label: "Job" },
      "docker-api": { label: "Deployment" },
      "helm-chart-dev": { label: "Helm: values-dev" },
    },
    extras: argoExtras,
  },
  {
    id: "terraform-irsa",
    title: "9. Terraform provisions IAM roles for api and migration",
    shortTitle: "Terraform",
    prose: terraformProse,
    visibleNodes: ["postgres", "api", "alembic", "ci", "argo"],
    // Everything the chart deploys runs on AWS. Cloud wraps helm + argo;
    // CI stays outside (it runs on GitHub).
    visibleGroups: [
      "docker-api",
      "docker-alembic",
      "k8s",
      "helm-chart-dev",
      "cloud",
    ],
    connections: [
      {
        from: { node: "alembic", side: "right" },
        to: { node: "postgres", side: "left" },
        label: "alembic · IRSA",
      },
      {
        from: { node: "ci", side: "right" },
        to: { group: "helm-chart-dev", side: "left" },
        label: "build + push",
      },
      {
        from: { node: "argo", side: "top" },
        to: { group: "k8s", side: "bottom" },
        label: "sync",
      },
    ],
    groupOverrides: {
      "docker-alembic": { label: "Job" },
      "docker-api": { label: "Deployment" },
      "helm-chart-dev": { label: "Helm: values-dev" },
    },
    extras: terraformExtras,
  },
];
