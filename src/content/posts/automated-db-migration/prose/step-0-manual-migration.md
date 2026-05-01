- Connect to a `k8s pod` that has `Postgres` credentials from a personal machine
- Connect to the db with `psql`
- Write raw SQL to add `color` column to `widgets` table in database
- Separately, update `Python` `SQLAlchemy` code to reference the new column
- Merge and deploy the code changes
- Coordinate *when* the migration runs — hopefully before the deploy that depends on it!
- Hope the script that ran against `prod` matches `dev` and what's on `GitHub`

No history. No review. No rollback.

Manual. Tedious. Error-prone.

## Goal

What we want is for database migrations to be *part of every deploy*:

- no humans
- no Slack threads
- no "did you remember to migrate `dev`? what about `prod`, is that image built yet?"

Just merge a PR and the DB schema ends up where it should — in every environment, every time.

This is how we got there, one layer at a time.
