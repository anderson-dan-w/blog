Until now the API and `Alembic` have lived in the same `Docker` container. We should separate them — same image, different entrypoints — because they have very different roles.

### Different permissions

- API container only needs basic read/write on the DB: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, nothing more
- migrations need more: `CREATE TABLE`, `ALTER TABLE`, `DROP INDEX` — and we don't want every API container to have all that access

### Chicken and egg

- new API code needs the new DB schema before it can run
- can't use API code to run the code that gets the API code working

### Replicas and persistence

- usually we want more than 1 API container running at a time
- want API containers to run indefinitely
- migrations only need to run once
