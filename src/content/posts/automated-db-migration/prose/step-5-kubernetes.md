We're not running `Docker` containers directly, though — we're running on a `Kubernetes` cluster.

The API is long-running, with more than one replica. That's a `k8s` `Deployment`, which keeps the desired pod count alive, replacing any that crash.

The migration is one-shot: run `alembic upgrade head` and done. That's a `k8s` `Job`, which creates the pod, waits for it to succeed, and moves on.

The two containers we separated above now get the appropriate `k8s` object types.
