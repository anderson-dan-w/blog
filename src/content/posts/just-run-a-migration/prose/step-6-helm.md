Managing `dev` and `prod` `k8s` clusters by hand would be tedious and invite environment drift. We use `Helm` to bundle everything, keeping most of the configuration shared and in sync.

### Templating across environments

Every `k8s` manifest is now a template. Replicas, image tags, DB connection strings, resource limits — all parameterized. Three files do the work:

- the `Helm` chart (templates and `k8s` manifests)
- `values.yaml` (shared defaults)
- `values-dev.yaml` / `values-prod.yaml` (per-env overrides)

No more copy-pasted YAML that drifts over time.

### Helm hooks for deploy sequencing

The migration `Job` gets an annotation: `helm.sh/hook: post-install,post-upgrade`. On every `helm upgrade`:

- the API `Deployment` rolls out first
- the migration `Job` runs after
- if the `Job` fails, `Helm` marks the release as failed

A simple `helm upgrade` deploys the API code and runs any pending migrations.
Now, nobody has to remember to apply a migration, or wonder if it's safe to deploy.
