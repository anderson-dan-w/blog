```yaml
# templates/migration-job.yaml
kind: Job
metadata:
  annotations:
    "helm.sh/hook": post-install,post-upgrade
spec:
  template:
    spec:
      containers:
        - image: {{ .Values.image }}
          command: [alembic, upgrade, head]
```

```yaml
# values-dev.yaml — overrides shared defaults
image: my-app:dev-abc123
replicas: 1
db:
  url: postgres://dbnl-dev.us-east-1.rds.aws/dbnl
```