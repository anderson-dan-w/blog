```yaml
# argocd Application — one per env
# Watches the chart repo, auto-applies helm upgrade
kind: Application
metadata:
  name: my-app
spec:
  source:
    path: charts/my-app
    helm:
      valueFiles: [values-dev.yaml, values.yaml]
  syncPolicy:
    automated: { prune: true, selfHeal: true }
```
