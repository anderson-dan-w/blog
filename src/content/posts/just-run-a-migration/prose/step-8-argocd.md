Everything up to this point still needed a human to type `helm upgrade` somewhere.

`ArgoCD` automates this. On every merge to `main`, it:

- pulls the new `Helm` chart
- diffs it against the `k8s` cluster for that env (`dev` or `prod`)
- runs `helm upgrade`
- which fires the `post-upgrade` hook
- which kicks off the migration `Job`

The deploy, and the DB migration, is no longer "a command someone needs to remember to run after merging". It *is* the merge.

This is the point where the whole loop closes: a `SQLAlchemy` model change becomes an `Alembic` migration, a PR, `GitHub Actions` run into `Docker containers`, a PR merge, a `Helm` chart bump, an automated sync from `ArgoCD`, a `Kubernetes` migration `Job` and API `Deployment` — all hands off.
