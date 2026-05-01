```hcl
# terraform: IAM role attached to the migration Job's ServiceAccount
resource "iam_role_policy" "alembic_permissions" {
  role       = iam_role.alembic.name
  policy_arn = iam_policy.db_migration.arn  # CREATE / ALTER / etc.
}
```

```yaml
# helm chart: serviceaccount.yaml — stitches k8s identity to AWS identity
kind: ServiceAccount
metadata:
  name: migration-job
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123:role/alembic
```
