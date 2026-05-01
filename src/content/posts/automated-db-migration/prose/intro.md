After our codebase had grown a bit, we realized that our process for running and applying database migrations was causing slowdowns and confusion.

## Our stack

- `Postgres` runs via `AWS RDS`
- `API` service runs `Python` that can connect to `Postgres`
- each service runs inside a `Docker` container
- `GitHub Actions` (`GHA`) builds `Docker` images
- `GitHub` container registry (`GHCR`) hosts images
- `Docker` containers run inside a `Kubernetes` cluster via `AWS EKS`
- `Kubernetes` is configured via `Helm` charts
- `Helm` charts are deployed by `ArgoCD`
- `ArgoCD` apps deploy to `dev` and `prod`
- `Terraform` manages cloud infrastructure and permissions

## A simple DB change

- add a `color` column on the `widgets` table
