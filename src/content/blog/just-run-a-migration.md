---
title: "Just Run a Migration"
description: "One ALTER TABLE, ten layers of infrastructure: a scrollytelling walkthrough of every piece of plumbing that sits underneath adding a column at a real company."
pubDate: 2026-04-28
tags: ["infrastructure", "kubernetes", "migrations", "alembic", "terraform"]
customLayout: "scrolly"
---

`ALTER TABLE widgets ADD COLUMN color;` — one SQL statement. At our company, that one statement passes through SQLAlchemy, Alembic, Docker, Kubernetes, Helm, GitHub Actions, ArgoCD, and Terraform before the new column actually exists in production.

This post walks through how each piece showed up — none of it dropped from the sky; each layer solved a real problem the previous setup couldn't handle. Scroll-driven, layer by layer.
