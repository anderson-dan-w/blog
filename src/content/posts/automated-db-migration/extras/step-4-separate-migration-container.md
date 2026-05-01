```dockerfile
# Dockerfile (can be same image, but two roles at runtime)
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install -e .
```

```shellsession
# migration container: higher-perm DB role, run once
$ docker run --rm \
    -e DATABASE_URL=$MIGRATION_URL \
    my-app alembic upgrade head

# api container: regular read/write DB role, long-running
$ docker run -d \
    -e DATABASE_URL=$APP_URL \
    my-app uvicorn my_app.main:app --host 0.0.0.0
```
