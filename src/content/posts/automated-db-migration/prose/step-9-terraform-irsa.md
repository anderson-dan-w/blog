Two things we've been hand-waving the whole way through.

### Database credentials

The `migration-job` needs (`CREATE`, `ALTER`); but `api` needs only (`SELECT`, `INSERT`, `UPDATE`, `DELETE`). How do those credentials reach each pod at runtime?

### The cloud underneath

`RDS` for `Postgres`, `EKS` for the cluster, `IAM` for identity. Who provisions all of *that*?

---

`terraform` provisions the `RDS` instance, the `EKS` cluster, and two distinct `IAM roles` — one for `migration-job`' and another for `api`.

Each role has access to a different DB credential, and `AWS OIDC` attaches `IAM Roles` to `k8s` `Service Accounts` (`IRSA`). Now, it's impossible for our `api` container, with the `api IRSA`, to access `migration`-level DB credentials.

And to wrap everything up, `terraform`, just like `Helm` charts, `k8s` manifests, `docker` files, and `python` code for `api` and `migration` live in a common repo.
