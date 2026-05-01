---
title: "From ALTER TABLE to automated DB rollout"
description: "Anatomy of a modern database migration: one ALTER TABLE statement, ten layers of infrastructure (SQLAlchemy, Alembic, Docker, Kubernetes, Helm, GitHub Actions, ArgoCD, Terraform) sitting quietly underneath it. A scroll-driven walkthrough, layer by layer."
pubDate: 2026-04-28
tags: ["infrastructure", "kubernetes", "migrations", "alembic", "terraform"]
customLayout: "scrolly"
---

`ALTER TABLE widgets ADD COLUMN color;` — one SQL statement. At our company, that one statement passes through SQLAlchemy, Alembic, Docker, Kubernetes, Helm, GitHub Actions, ArgoCD, and Terraform before the new column actually exists in production.

This post walks through how each piece showed up — none of it dropped from the sky; each layer solved a real problem the previous setup couldn't handle. Scroll-driven, layer by layer.
