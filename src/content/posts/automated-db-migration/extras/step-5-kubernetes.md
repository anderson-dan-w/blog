```yaml
# Migration Job: runs once, exits on success
kind: Job
restartPolicy: Never
command: [alembic, upgrade, head]

# API Deployment: keeps N pods alive
kind: Deployment
replicas: 3
command: [uvicorn, my_app.main:app]
```
