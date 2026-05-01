```yaml
# .github/workflows/ci.yml
on: pull_request
jobs:
  check-build-push:
    steps:
      - run: alembic check   # fails PR if models drift from migrations/
      - run: docker build -t migration:${{ github.sha }} .
      - run: docker push ghcr.io/org/migration:${{ github.sha }}
```
