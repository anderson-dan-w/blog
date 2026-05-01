Every PR gets two automated checks before it can merge.

`alembic check`
- fails the PR if a `SQLAlchemy` model has drifted from the `migrations/` folder — such as someone forgot to run `alembic revision --autogenerate`. The PR physically cannot merge with drift between `SQLAlchemy` and `alembic`

`docker build + push`
- compiles the `Docker` image, tags it, and pushes it to the container registry. By the time a PR merges, a tagged image is already built.

Two straightforward jobs in `GitHub Actions`, but together they remove two major concerns:
-  schema drift in `main`
- "did anyone build the image for this release yet?"

`GitHub Actions` does *not* run migrations itself. It only validates that we _could_, and prepares the `Docker` image that will.
